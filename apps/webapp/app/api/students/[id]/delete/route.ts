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

    // Soft delete: nothing is removed. The student is hidden (deleted_at) and
    // their login is blocked; enrollments, transactions, payments, logs,
    // certificates and email logs are all kept.
    const { data: existingStudent, error: getError } = await supabase
      .from('students')
      .select('id, deleted_at')
      .eq('id', studentId)
      .maybeSingle();

    if (getError) {
      console.error('[delete student] lookup:', getError);
      return NextResponse.json(
        { success: false, error: getError.message || 'Failed to look up student' },
        { status: 500 }
      );
    }
    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    let alreadyDeleted = Boolean(existingStudent.deleted_at);

    // 1. Mark deleted first (hides them everywhere).
    if (!alreadyDeleted) {
      const { data: updated, error: markError } = await supabase
        .from('students')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', studentId)
        .is('deleted_at', null)
        .select('id');
      if (markError) {
        console.error('[delete student] mark deleted:', markError);
        return NextResponse.json(
          { success: false, error: markError.message || 'Failed to delete student' },
          { status: 500 }
        );
      }
      if (!updated || updated.length === 0) {
        alreadyDeleted = true; // lost a race with another delete request
      } else {
        await insertLog({
          admin_user_id: admin.id,
          reference_id: studentId,
          reference_type: 'student',
          action_type: 'student_deleted',
          student_id: studentId,
        });
      }
    }

    // 2. Block login (~100 years). Reversible with ban_duration: 'none'.
    // Also runs when already deleted, so a retry after a failed ban completes it.
    const { error: banError } = await supabase.auth.admin.updateUserById(studentId, {
      ban_duration: '876000h',
    });
    if (banError) {
      console.error('[delete student] ban:', banError);
      return NextResponse.json(
        {
          success: false,
          error:
            'The student is now hidden, but their login is NOT yet blocked (' +
            (banError.message || 'unknown error') +
            '). Run delete again to retry, or block the user in Supabase Auth.',
        },
        { status: 500 }
      );
    }

    if (alreadyDeleted) {
      return NextResponse.json({ success: true, alreadyDeleted: true });
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
