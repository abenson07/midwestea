import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const studentId = params.id;

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found. Please ensure you are registered as an admin.' },
        { status: 403 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing student ID' },
        { status: 400 }
      );
    }

    const { data: existingStudent, error: getError } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .single();

    if (getError || !existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId);
    const enrollmentIds = (enrollments ?? []).map((e) => e.id);

    let paymentIds: string[] = [];
    if (enrollmentIds.length > 0) {
      const { data: payments } = await supabase
        .from('payments')
        .select('id')
        .in('enrollment_id', enrollmentIds);
      paymentIds = (payments ?? []).map((p) => p.id);
    }

    if (paymentIds.length > 0) {
      const { error: invoicesError } = await supabase
        .from('invoices_to_import')
        .delete()
        .in('payment_id', paymentIds);
      if (invoicesError) {
        console.error('[delete student] invoices_to_import:', invoicesError);
        return NextResponse.json(
          { success: false, error: invoicesError.message || 'Failed to delete related invoices' },
          { status: 500 }
        );
      }
    }

    const { error: transactionsError } = await supabase
      .from('transactions')
      .delete()
      .eq('student_id', studentId);
    if (transactionsError) {
      console.error('[delete student] transactions:', transactionsError);
      return NextResponse.json(
        { success: false, error: transactionsError.message || 'Failed to delete transactions' },
        { status: 500 }
      );
    }

    if (enrollmentIds.length > 0) {
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .in('enrollment_id', enrollmentIds);
      if (paymentsError) {
        console.error('[delete student] payments:', paymentsError);
        return NextResponse.json(
          { success: false, error: paymentsError.message || 'Failed to delete payments' },
          { status: 500 }
        );
      }
    }

    const { error: enrollmentsError } = await supabase
      .from('enrollments')
      .delete()
      .eq('student_id', studentId);
    if (enrollmentsError) {
      console.error('[delete student] enrollments:', enrollmentsError);
      return NextResponse.json(
        { success: false, error: enrollmentsError.message || 'Failed to delete enrollments' },
        { status: 500 }
      );
    }

    const { error: emailLogsError } = await supabase
      .from('email_logs')
      .delete()
      .eq('student_id', studentId);
    if (emailLogsError) {
      console.error('[delete student] email_logs:', emailLogsError);
      return NextResponse.json(
        { success: false, error: emailLogsError.message || 'Failed to delete email logs' },
        { status: 500 }
      );
    }

    const { error: logsError } = await supabase
      .from('logs')
      .delete()
      .eq('student_id', studentId);
    if (logsError) {
      console.error('[delete student] logs:', logsError);
      return NextResponse.json(
        { success: false, error: logsError.message || 'Failed to delete logs' },
        { status: 500 }
      );
    }

    const { error: studentsError } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);
    if (studentsError) {
      console.error('[delete student] students:', studentsError);
      return NextResponse.json(
        { success: false, error: studentsError.message || 'Failed to delete student' },
        { status: 500 }
      );
    }

    await insertLog({
      admin_user_id: admin.id,
      reference_id: studentId,
      reference_type: 'student',
      action_type: 'student_deleted',
      student_id: studentId,
    });

    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(studentId);
    if (authDeleteError) {
      console.warn('[delete student] auth delete (user may already be gone):', authDeleteError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[delete student]', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
