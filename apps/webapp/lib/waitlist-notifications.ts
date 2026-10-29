import { createSupabaseAdminClient } from '@midwestea/utils';
import { sendWaitlistOpensEmail, waitlistOpensEmailType } from './email';

/** Pause between sends to stay under Resend's per-second rate limit. */
const SEND_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface WaitlistClass {
  id: string;
  class_id: string;
  class_name: string | null;
  course_code: string | null;
  class_image: string | null;
  class_start_date: string | null;
  enrollment_start: string | null;
  enrollment_close: string | null;
  is_online: boolean | null;
}

export const WAITLIST_CLASS_COLUMNS =
  'id, class_id, class_name, course_code, class_image, class_start_date, enrollment_start, enrollment_close, is_online';

/**
 * Same rule as app/api/classes/by-class-id/[classId]/route.ts, so the
 * register link in the email never lands on "Enrollment has closed".
 */
export function isEnrollmentOpen(classRecord: WaitlistClass, today = new Date().toISOString().split('T')[0]): boolean {
  if (classRecord.is_online === true) return true;
  return Boolean(
    classRecord.enrollment_start &&
      classRecord.enrollment_close &&
      classRecord.enrollment_start <= today &&
      classRecord.enrollment_close >= today
  );
}

export interface NotifyWaitlistResult {
  classId: string;
  due: number;
  sent: number;
  failed: number;
  skipped?: 'enrollment_not_open' | 'no_course_code';
  wouldSend?: string[];
}

/**
 * Email everyone on the class's course waitlist that registration is open.
 * Skips students already enrolled in the class and anyone already emailed
 * about this class (successful waitlist_opens:<class id> row in email_logs),
 * so it is safe to call repeatedly: on class creation and from the daily cron.
 */
export async function notifyWaitlistForClass(
  classRecord: WaitlistClass,
  options?: { dryRun?: boolean; maxSends?: number }
): Promise<NotifyWaitlistResult> {
  const base = { classId: classRecord.class_id, due: 0, sent: 0, failed: 0 };

  if (!classRecord.course_code) return { ...base, skipped: 'no_course_code' };
  if (!isEnrollmentOpen(classRecord)) return { ...base, skipped: 'enrollment_not_open' };

  const supabase = createSupabaseAdminClient();

  const { data: waitlist, error: waitlistError } = await supabase
    .from('waitlist')
    .select('student_id')
    .eq('course_code', classRecord.course_code.toUpperCase());
  if (waitlistError) throw new Error(`Failed to query waitlist: ${waitlistError.message}`);

  const waitlistedIds = Array.from(new Set((waitlist ?? []).map((row) => row.student_id as string)));
  if (waitlistedIds.length === 0) return base;

  // Soft-deleted students get no automated email.
  const { data: activeStudents, error: studentsError } = await supabase
    .from('students')
    .select('id')
    .in('id', waitlistedIds)
    .is('deleted_at', null);
  if (studentsError) throw new Error(`Failed to query students: ${studentsError.message}`);
  const studentIds = (activeStudents ?? []).map((row) => row.id as string);
  if (studentIds.length === 0) return base;

  const { data: enrolled, error: enrolledError } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('class_id', classRecord.id)
    .in('student_id', studentIds);
  if (enrolledError) throw new Error(`Failed to query enrollments: ${enrolledError.message}`);

  const { data: logs, error: logsError } = await supabase
    .from('email_logs')
    .select('student_id')
    .eq('email_type', waitlistOpensEmailType(classRecord.id))
    .eq('success', true)
    .in('student_id', studentIds);
  if (logsError) throw new Error(`Failed to query email_logs: ${logsError.message}`);

  const skip = new Set<string>([
    ...(enrolled ?? []).map((row) => row.student_id as string),
    ...(logs ?? []).map((row) => row.student_id as string),
  ]);
  const due = studentIds.filter((id) => !skip.has(id));
  const batch = options?.maxSends !== undefined ? due.slice(0, options.maxSends) : due;

  if (options?.dryRun) {
    return { ...base, due: due.length, wouldSend: batch };
  }

  let sent = 0;
  const failures: Array<{ student_id: string; error?: string }> = [];

  for (const studentId of batch) {
    const result = await sendWaitlistOpensEmail({
      studentId,
      classId: classRecord.id,
      classCode: classRecord.class_id,
      courseCode: classRecord.course_code,
      className: classRecord.class_name || classRecord.class_id,
      classStartDate: classRecord.class_start_date,
      enrollmentClose: classRecord.enrollment_close,
      classImage: classRecord.class_image,
    });
    if (result.success) {
      sent += 1;
    } else {
      failures.push({ student_id: studentId, error: result.error });
    }
    await sleep(SEND_DELAY_MS);
  }

  if (failures.length > 0) {
    console.error('[notifyWaitlistForClass] Some waitlist emails failed:', { classId: classRecord.class_id, failures });
  }

  return { ...base, due: due.length, sent, failed: failures.length };
}

/**
 * Drop a student's waitlist entry for the course they just enrolled in.
 * Best-effort: a failure here must never block the enrollment itself.
 */
export async function removeFromWaitlistOnEnrollment(studentId: string, classUuid: string): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: classRecord } = await supabase
      .from('classes')
      .select('course_code')
      .eq('id', classUuid)
      .maybeSingle();
    if (!classRecord?.course_code) return;

    const { error } = await supabase
      .from('waitlist')
      .delete()
      .eq('student_id', studentId)
      .eq('course_code', String(classRecord.course_code).toUpperCase());
    if (error) {
      console.error('[removeFromWaitlistOnEnrollment] Failed to remove waitlist entry:', error.message);
    }
  } catch (error) {
    console.error('[removeFromWaitlistOnEnrollment] Error:', error);
  }
}
