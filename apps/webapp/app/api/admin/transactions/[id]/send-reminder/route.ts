import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { sendTuitionReminderEmail } from '@/lib/email';

export const runtime = 'nodejs';

// Deliberately queries `transactions`/`students`/`classes` directly on every call —
// never route this through lib/enrollments.ts's getOutstandingInvoices(), which has
// an in-memory 5-minute cache. This endpoint must always reflect the live row. (BEN-1186)
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

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, enrollment_id, student_id, class_id, transaction_type, transaction_status, amount_due, quantity, invoice_number, due_date, stripe_hosted_invoice_url')
      .eq('id', id)
      .maybeSingle();

    if (txError || !transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    if (transaction.transaction_status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Reminders can only be sent for open (pending) invoices' }, { status: 400 });
    }
    if (!transaction.student_id) {
      return NextResponse.json({ success: false, error: 'Transaction has no associated student' }, { status: 400 });
    }

    const { data: studentRecord, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .eq('id', transaction.student_id)
      .maybeSingle();
    if (studentError || !studentRecord) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    let classRecord = { class_name: null as string | null };
    if (transaction.class_id) {
      const { data: classRow } = await supabase
        .from('classes')
        .select('class_name')
        .eq('id', transaction.class_id)
        .maybeSingle();
      if (classRow) classRecord = { class_name: classRow.class_name };
    }

    const result = await sendTuitionReminderEmail(studentRecord, transaction, classRecord);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to send reminder' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: result.id, dueDateSent: transaction.due_date });
  } catch (err: any) {
    console.error('[transactions/send-reminder] Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to send reminder' }, { status: 500 });
  }
}
