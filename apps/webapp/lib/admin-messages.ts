/**
 * Admin plain-text messages ("Message student" / "Message all students").
 *
 * Kept in its own module (not lib/email.ts). Emails are sent through the
 * existing sendEmail() and logged to email_logs with email_type
 * 'admin_message' (email_logs.email_type is free text, no CHECK).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { escapeHtml, logEmailToDatabase, sendEmail } from '@/lib/email';

export const ADMIN_MESSAGE_EMAIL_TYPE = 'admin_message';
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_MESSAGE_LENGTH = 10000;
/** Refuse a class send above this many recipients. */
export const MAX_CLASS_RECIPIENTS = 500;

export interface MessageRecipient {
  studentId: string;
  name: string;
  email: string;
}

export interface AdminMessageResult {
  sent: number;
  failed: Array<{ studentId: string; error: string }>;
  recipients: number;
}

export class AdminMessageError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate and normalise subject/message. Subject is forced to one line. */
export function validateMessageInput(subject: unknown, message: unknown): { subject: string; message: string } {
  if (typeof subject !== 'string' || typeof message !== 'string') {
    throw new AdminMessageError('Subject and message are required', 400);
  }
  const cleanSubject = subject.replace(/[\r\n]+/g, ' ').trim();
  const cleanMessage = message.replace(/\r\n/g, '\n').trim();
  if (!cleanSubject) throw new AdminMessageError('Subject is required', 400);
  if (!cleanMessage) throw new AdminMessageError('Message is required', 400);
  if (cleanSubject.length > MAX_SUBJECT_LENGTH) {
    throw new AdminMessageError(`Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer`, 400);
  }
  if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
    throw new AdminMessageError(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`, 400);
  }
  return { subject: cleanSubject, message: cleanMessage };
}

/** Plain-text body as minimal, safe HTML: escaped, line breaks preserved. */
export function plainTextToHtml(message: string): string {
  const body = escapeHtml(message).replace(/\n/g, '<br>\n');
  return `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #222222;">${body}</div>`;
}

async function resolveEmail(supabase: SupabaseClient, studentId: string, rowEmail: string | null): Promise<string | null> {
  // Same precedence as the admin email lookup: auth email, then students.email.
  try {
    const { data } = await supabase.auth.admin.getUserById(studentId);
    if (data?.user?.email) return data.user.email.trim();
  } catch {
    // fall through to the students row
  }
  return rowEmail && rowEmail.trim() ? rowEmail.trim() : null;
}

type StudentRow = { id: string; full_name: string | null; email: string | null; deleted_at: string | null };

async function loadStudents(supabase: SupabaseClient, ids: string[]): Promise<StudentRow[]> {
  const rows: StudentRow[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await supabase
      .from('students')
      .select('id, full_name, email, deleted_at')
      .in('id', ids.slice(i, i + 100))
      .is('deleted_at', null);
    if (error) throw new AdminMessageError(`Failed to load students: ${error.message}`, 500);
    rows.push(...((data as StudentRow[]) ?? []));
  }
  return rows;
}

export async function resolveStudentRecipient(supabase: SupabaseClient, studentId: string): Promise<MessageRecipient> {
  if (typeof studentId !== 'string' || !UUID_RE.test(studentId)) {
    throw new AdminMessageError('Invalid studentId', 400);
  }
  const [student] = await loadStudents(supabase, [studentId]);
  if (!student) throw new AdminMessageError('Student not found', 404);
  const email = await resolveEmail(supabase, student.id, student.email);
  if (!email || !EMAIL_RE.test(email)) throw new AdminMessageError('This student has no valid email address', 422);
  return { studentId: student.id, name: student.full_name?.trim() || 'Student', email };
}

/**
 * Recipients for a class: enrollment status not 'removed', student and class
 * not soft-deleted, non-empty email, deduped by (lowercased) email.
 * classId may be the class UUID or the human class_id text.
 */
export async function resolveClassRecipients(supabase: SupabaseClient, classId: string): Promise<MessageRecipient[]> {
  if (typeof classId !== 'string' || !classId.trim()) throw new AdminMessageError('Invalid classId', 400);
  const classQuery = supabase.from('classes').select('id').is('deleted_at', null);
  const { data: cls, error: classError } = UUID_RE.test(classId)
    ? await classQuery.eq('id', classId).maybeSingle()
    : await classQuery.ilike('class_id', classId).maybeSingle();
  if (classError) throw new AdminMessageError(`Failed to load class: ${classError.message}`, 500);
  if (!cls) throw new AdminMessageError('Class not found', 404);

  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('student_id, enrollment_status')
    .eq('class_id', cls.id);
  if (enrollError) throw new AdminMessageError(`Failed to load enrollments: ${enrollError.message}`, 500);

  const studentIds = Array.from(
    new Set(
      ((enrollments as Array<{ student_id: string; enrollment_status: string | null }>) ?? [])
        .filter((e) => e.enrollment_status !== 'removed' && e.student_id)
        .map((e) => e.student_id)
    )
  );
  // Cheap cap check before any per-student auth lookups.
  if (studentIds.length > MAX_CLASS_RECIPIENTS) {
    throw new AdminMessageError(
      `This class has ${studentIds.length} enrolled students, above the ${MAX_CLASS_RECIPIENTS} limit for a single message. Nothing was sent.`,
      400
    );
  }

  const students = await loadStudents(supabase, studentIds);
  const seen = new Set<string>();
  const recipients: MessageRecipient[] = [];
  for (const student of students) {
    const email = await resolveEmail(supabase, student.id, student.email);
    if (!email || !EMAIL_RE.test(email)) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    recipients.push({ studentId: student.id, name: student.full_name?.trim() || 'Student', email });
  }
  return recipients;
}

/** Send sequentially; one failure never aborts the rest. */
export async function sendAdminMessage(
  recipients: MessageRecipient[],
  subject: string,
  message: string
): Promise<AdminMessageResult> {
  const html = plainTextToHtml(message);
  const result: AdminMessageResult = { sent: 0, failed: [], recipients: recipients.length };
  for (const recipient of recipients) {
    try {
      const sendResult = await sendEmail({
        from: process.env.EMAIL_FROM || 'noreply@midwestea.com',
        to: recipient.email,
        subject,
        html,
        text: message,
        tags: [
          { name: 'email_type', value: ADMIN_MESSAGE_EMAIL_TYPE },
          { name: 'student_id', value: recipient.studentId },
        ],
        metadata: { student_id: recipient.studentId },
      });
      await logEmailToDatabase({
        recipient_email: recipient.email,
        recipient_name: recipient.name,
        subject,
        email_type: ADMIN_MESSAGE_EMAIL_TYPE,
        student_id: recipient.studentId,
        success: sendResult.success,
        email_id: sendResult.id,
        error: sendResult.error,
        retries: sendResult.retries || 0,
      }).catch((logError) => console.error('[admin-messages] Failed to log email:', logError));
      if (sendResult.success) {
        result.sent += 1;
      } else {
        result.failed.push({ studentId: recipient.studentId, error: sendResult.error || 'Send failed' });
      }
    } catch (err: any) {
      result.failed.push({ studentId: recipient.studentId, error: err?.message || 'Send failed' });
    }
  }
  return result;
}
