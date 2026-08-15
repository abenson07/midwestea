import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { createStripeCustomerWithFetch, createStripeCheckoutSessionForAmountWithFetch } from '@/lib/stripe';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await context.params;

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

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, student_id')
      .eq('id', enrollmentId)
      .maybeSingle();
    if (enrollmentError || !enrollment) {
      return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 });
    }
    if (enrollment.student_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { data: pendingTransactions, error: txError } = await supabase
      .from('transactions')
      .select('id, amount_due, quantity')
      .eq('enrollment_id', enrollmentId)
      .eq('transaction_status', 'pending');
    if (txError) {
      return NextResponse.json({ success: false, error: txError.message }, { status: 500 });
    }
    if (!pendingTransactions || pendingTransactions.length === 0) {
      return NextResponse.json({ success: false, error: 'No open invoices to pay for this enrollment' }, { status: 400 });
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

    const totalAmountCents = pendingTransactions.reduce(
      (sum, t) => sum + (t.amount_due || 0) * (t.quantity || 1),
      0
    );
    const transactionIds = pendingTransactions.map((t) => t.id);

    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const session = await createStripeCheckoutSessionForAmountWithFetch(
      customerId,
      totalAmountCents,
      'Remaining Tuition Balance',
      `${origin}/student/billing?paid=1`,
      `${origin}/student/billing`,
      {
        payment_purpose: 'pay_remaining',
        enrollment_id: enrollmentId,
        transaction_ids: transactionIds.join(','),
      },
      stripeSecretKey
    );

    if (!session.url) {
      return NextResponse.json({ success: false, error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch (err: any) {
    console.error('[student/enrollments/pay-remaining] Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to start payment' }, { status: 500 });
  }
}
