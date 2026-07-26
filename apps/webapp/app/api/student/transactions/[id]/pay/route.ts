import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { createStripeCustomerWithFetch, createStripeCheckoutSessionForAmountWithFetch } from '@/lib/stripe';

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

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, student_id, transaction_status, transaction_type, amount_due, quantity')
      .eq('id', id)
      .maybeSingle();

    if (txError || !transaction) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }
    if (transaction.student_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    if (transaction.transaction_status !== 'pending') {
      return NextResponse.json({ success: false, error: 'This invoice is not open for payment' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ success: false, error: 'Payment service not configured' }, { status: 500 });
    }

    const { data: student } = await supabase
      .from('students')
      .select('id, stripe_customer_id, full_name')
      .eq('id', user.id)
      .maybeSingle();

    let customerId = student?.stripe_customer_id || null;
    if (!customerId) {
      const customer = await createStripeCustomerWithFetch(user.email || '', student?.full_name || 'Student', stripeSecretKey);
      customerId = customer.id;
      await supabase.from('students').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const amountCents = (transaction.amount_due || 0) * (transaction.quantity || 1);
    const productName =
      transaction.transaction_type === 'tuition_a' ? 'First Tuition Payment' :
      transaction.transaction_type === 'tuition_b' ? 'Second Tuition Payment' :
      'Registration Fee';

    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const session = await createStripeCheckoutSessionForAmountWithFetch(
      customerId,
      amountCents,
      productName,
      `${origin}/student/billing?paid=1`,
      `${origin}/student/billing`,
      { payment_purpose: 'existing_invoice', transaction_id: transaction.id },
      stripeSecretKey
    );

    if (!session.url) {
      return NextResponse.json({ success: false, error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch (err: any) {
    console.error('[student/transactions/pay] Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to start payment' }, { status: 500 });
  }
}
