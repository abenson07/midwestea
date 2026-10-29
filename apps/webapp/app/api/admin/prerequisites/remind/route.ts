import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { evaluateClassPrerequisites } from '@/lib/prerequisite-evaluation';
import {
  sendPrerequisiteMissingEmail,
  wasPrerequisiteReminderSentRecently,
} from '@/lib/prerequisite-reminder-email';

export const runtime = 'nodejs';

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * POST /api/admin/prerequisites/remind
 * Body: { studentId, classId, prerequisiteTypeId }
 *
 * Admin "Remind" for a required prerequisite document the student has not
 * submitted. Emails the student a link to upload it. Refuses when the student
 * or class is deleted, the prerequisite is not required for the class, it is
 * not currently missing, the student has no email, or a reminder for the same
 * student/class/type was already sent in the last 24 hours.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return fail('Unauthorized - Missing or invalid authorization header', 401);
    }
    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return fail('Unauthorized - Invalid session', 401);
    }
    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return fail('Admin access required', 403);
    }

    const body = await request.json().catch(() => null);
    const studentId = typeof body?.studentId === 'string' ? body.studentId : '';
    const classId = typeof body?.classId === 'string' ? body.classId : '';
    const prerequisiteTypeId = typeof body?.prerequisiteTypeId === 'string' ? body.prerequisiteTypeId : '';
    if (!studentId || !classId || !prerequisiteTypeId) {
      return fail('studentId, classId and prerequisiteTypeId are required', 400);
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .eq('id', studentId)
      .is('deleted_at', null)
      .maybeSingle();
    if (studentError) return fail(studentError.message, 500);
    if (!student) return fail('Student not found', 404);

    const { data: cls, error: classError } = await supabase
      .from('classes')
      .select('id, class_name')
      .eq('id', classId)
      .is('deleted_at', null)
      .maybeSingle();
    if (classError) return fail(classError.message, 500);
    if (!cls) return fail('Class not found', 404);

    const { evaluation, error: evalError } = await evaluateClassPrerequisites(supabase, studentId, classId);
    if (evalError || !evaluation) return fail(evalError || 'Failed to evaluate prerequisites', 500);

    const item = evaluation.items.find((row) => row.prerequisite_type_id === prerequisiteTypeId);
    if (!item || !item.is_required) {
      return fail('That document is not a required prerequisite for this class', 404);
    }
    if (item.status !== 'missing') {
      return fail('That document is not missing for this student, so no reminder was sent', 409);
    }

    const prerequisiteTypeName = item.prerequisite_type?.name;
    if (!prerequisiteTypeName) return fail('Prerequisite not found', 404);

    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(studentId);
    if (authUserError) return fail(`Failed to look up student email: ${authUserError.message}`, 500);
    const studentEmail = authUser?.user?.email;
    if (!studentEmail) return fail('This student has no email address on file', 422);

    const { recent, error: dupError } = await wasPrerequisiteReminderSentRecently(supabase, {
      studentId,
      classId,
      prerequisiteTypeId,
    });
    if (dupError) return fail(`Failed to check recent reminders: ${dupError}`, 500);
    if (recent) {
      return fail('A reminder for this document was already sent in the last 24 hours', 429);
    }

    const studentName = `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() || 'Student';
    const result = await sendPrerequisiteMissingEmail({
      studentId,
      studentName,
      studentEmail,
      classId,
      className: cls.class_name || 'your class',
      prerequisiteTypeId,
      prerequisiteTypeName,
    });
    if (!result.success) {
      return fail(result.error || 'Failed to send reminder email', 502);
    }

    return NextResponse.json({ success: true, sentTo: studentEmail });
  } catch (error: any) {
    console.error('[API] Error in prerequisites remind route:', error);
    return fail(error.message || 'Internal server error', 500);
  }
}
