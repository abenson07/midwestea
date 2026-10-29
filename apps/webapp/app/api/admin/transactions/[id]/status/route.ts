import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { applyPaidUpdate } from '@/lib/invoice-payments';
import { payStripeInvoiceOutOfBand, voidStripeInvoice } from '@/lib/stripe-invoices';
import { logServerError } from '@/lib/error-reporting/log-server-error';

export const runtime = 'nodejs';

/**
 * POST /api/admin/transactions/[id]/status
 * Body: { status: 'paid' | 'cancelled' }
 *
 * Admin "Mark as paid" / "Cancel invoice". Runs server-side (service role)
 * because transactions are owner-only under RLS (migrations 33/35) and because
 * a linked Stripe Invoice must be settled/voided so the student can't still pay
 * it. Only pending rows can be changed.
 *
 * paid:      Stripe invoice (if any) is paid out-of-band first; then the shared
 *            applyPaidUpdate sets status, payment_date and amount_paid. Stripe
 *            goes first so a failed DB write is still healed by the resulting
 *            invoice.paid webhook, which hits the same already-paid guard.
 * cancelled: Stripe invoice (if any) is voided, then status -> cancelled.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Invalid session' }, { status: 401 });
    }
    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json({ success: false, error: 'Admin not found. Please ensure you are registered as an admin.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const status = body?.status;
    if (status !== 'paid' && status !== 'cancelled') {
      return NextResponse.json({ success: false, error: "status must be 'paid' or 'cancelled'" }, { status: 400 });
    }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, transaction_status, stripe_invoice_id, amount_due, quantity')
      .eq('id', id)
      .maybeSingle();

    if (txError || !transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.transaction_status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Only pending transactions can be changed (this one is ${transaction.transaction_status})` },
        { status: 409 }
      );
    }

    if (status === 'paid') {
      if (transaction.stripe_invoice_id) {
        try {
          await payStripeInvoiceOutOfBand(transaction.stripe_invoice_id);
        } catch (stripeErr: any) {
          return NextResponse.json({ success: false, error: `Failed to settle Stripe invoice: ${stripeErr.message}` }, { status: 502 });
        }
      }
      const amountPaidCents = Math.round((transaction.amount_due ?? 0) * (transaction.quantity ?? 1));
      const result = await applyPaidUpdate(transaction, { paymentIntentId: null, amountPaidCents });
      if (result.alreadyProcessed) {
        return NextResponse.json({ success: false, error: 'Transaction was already marked paid' }, { status: 409 });
      }
      return NextResponse.json({ success: true, status: 'paid', amountPaidCents });
    }

    // cancelled
    if (transaction.stripe_invoice_id) {
      try {
        await voidStripeInvoice(transaction.stripe_invoice_id);
      } catch (stripeErr: any) {
        return NextResponse.json({ success: false, error: `Failed to void Stripe invoice: ${stripeErr.message}` }, { status: 502 });
      }
    }
    const { data: updated, error: updateError } = await supabase
      .from('transactions')
      .update({ transaction_status: 'cancelled' })
      .eq('id', id)
      .eq('transaction_status', 'pending')
      .select('id');
    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }
    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, error: 'Transaction is no longer pending' }, { status: 409 });
    }
    return NextResponse.json({ success: true, status: 'cancelled' });
  } catch (err: any) {
    console.error('[admin/transactions/status] Error:', err);
    void logServerError({
      message: err?.message || 'Failed to update transaction status',
      stack: err?.stack,
      requestUrl: request.nextUrl.pathname,
      statusCode: 500,
      context: { route: 'admin/transactions/[id]/status' },
    });
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update transaction status' }, { status: 500 });
  }
}
