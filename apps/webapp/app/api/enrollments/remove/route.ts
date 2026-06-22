import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';

export const runtime = 'nodejs';

/**
 * DELETE /api/enrollments/remove — Remove a student from a class roster (admin only).
 * Soft-removes the enrollment (status = removed) so payment transactions are preserved.
 */
export async function DELETE(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { student_id: studentId, class_id: classId } = body;

    if (!studentId || !classId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: student_id, class_id' },
        { status: 400 }
      );
    }

    const { data: enrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('id, enrollment_status')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message || 'Failed to look up enrollment' },
        { status: 500 }
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    if (enrollment.enrollment_status === 'removed') {
      return NextResponse.json({
        success: true,
        removedCount: 0,
        alreadyRemoved: true,
      });
    }

    const { data: updatedRows, error: updateError } = await supabase
      .from('enrollments')
      .update({
        enrollment_status: 'removed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id)
      .select('id');

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message || 'Failed to remove enrollment' },
        { status: 500 }
      );
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    await insertLog({
      admin_user_id: admin.id,
      reference_id: classId,
      reference_type: 'class',
      action_type: 'student_removed',
      student_id: studentId,
      class_id: classId,
    });

    return NextResponse.json({
      success: true,
      removedCount: updatedRows.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in enrollments/remove API:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
