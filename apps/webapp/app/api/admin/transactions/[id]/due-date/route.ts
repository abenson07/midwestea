import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { createAndFinalizeStripeInvoice, voidStripeInvoice } from '@/lib/stripe-invoices';

export const runtime = 'nodejs';

/**
 * POST /api/admin/transactions/[id]/due-date
 *
 * Updates a transaction's due date, keeping any linked Stripe Invoice in sync.
 * lib/payments.ts's updateTransactionDueDate previously did this as a direct
 * Supabase update from the browser — moved server-side because syncing the
 * Stripe Invoice needs STRIPE_SECRET_KEY, which isn't available client-side.
 *
 * Always voids + reissues rather than attempting a direct due_date update —
 * per Stripe's own "Manage invoices" docs: "After Stripe finalizes an
 * invoice, you can't change its due date... void the original invoice and
 * send a new one." Same pattern as the amount route below, and for the same
 * reason: no direct-update path exists once an invoice is finalized.
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

    const body = await request.json();
    const dueDate = body?.dueDate;
    if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) {
      return NextResponse.json({ success: false, error: 'A valid dueDate is required' }, { status: 400 });
    }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, stripe_invoice_id, amount_due, quantity, student_id, transaction_type')
      .eq('id', id)
      .maybeSingle();

    if (txError || !transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.stripe_invoice_id) {
      // Void first, then create the replacement - never leave both the old and
      // new invoice simultaneously open and payable for the same charge.
      try {
        await voidStripeInvoice(transaction.stripe_invoice_id);
      } catch (voidErr: any) {
        return NextResponse.json({ success: false, error: `Failed to void existing invoice: ${voidErr.message}` }, { status: 500 });
      }

      const { data: student } = await supabase
        .from('students')
        .select('stripe_customer_id')
        .eq('id', transaction.student_id)
        .maybeSingle();

      if (!student?.stripe_customer_id) {
        return NextResponse.json({ success: false, error: 'Cannot reissue invoice: student has no Stripe customer on file' }, { status: 400 });
      }

      const description =
        transaction.transaction_type === 'tuition_a' ? 'First Tuition Payment' :
        transaction.transaction_type === 'tuition_b' ? 'Second Tuition Payment' :
        'Revised Invoice';
      const payableAmountCents = Math.round((transaction.amount_due ?? 0) * (transaction.quantity ?? 1));

      let replacement;
      try {
        replacement = await createAndFinalizeStripeInvoice({
          customerId: student.stripe_customer_id,
          amountCents: payableAmountCents,
          dueDate,
          description,
        });
      } catch (createErr: any) {
        return NextResponse.json({ success: false, error: `Voided old invoice but failed to create replacement: ${createErr.message}` }, { status: 500 });
      }

      const { error: swapError } = await supabase
        .from('transactions')
        .update({
          stripe_invoice_id: replacement.stripeInvoiceId,
          stripe_hosted_invoice_url: replacement.hostedInvoiceUrl,
        })
        .eq('id', id);

      if (swapError) {
        return NextResponse.json({ success: false, error: `Failed to link reissued invoice: ${swapError.message}` }, { status: 500 });
      }
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update({ due_date: dueDate })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/transactions/due-date] Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update due date' }, { status: 500 });
  }
}
