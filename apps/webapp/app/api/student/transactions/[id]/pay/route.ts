import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

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
      .select('id, student_id, transaction_status, stripe_hosted_invoice_url')
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
    if (!transaction.stripe_hosted_invoice_url) {
      return NextResponse.json({ success: false, error: 'This invoice does not have a payment link yet. Please contact support.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, checkoutUrl: transaction.stripe_hosted_invoice_url });
  } catch (err: any) {
    console.error('[student/transactions/pay] Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to start payment' }, { status: 500 });
  }
}
