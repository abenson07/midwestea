import * as React from 'react';
import { render } from '@react-email/render';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendEmail, logEmailToDatabase, validateEmail } from './email';
import PrerequisiteMissing from '../emails/prerequisite-missing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://midwestea.com';

/** email_logs.email_type is free text; this one is keyed per class + type so it doubles as the dedupe key. */
export function prerequisiteMissingEmailType(classId: string, prerequisiteTypeId: string): string {
  return `prerequisite_missing:${classId}:${prerequisiteTypeId}`;
}

export function getPrerequisiteMissingSubject(prerequisiteTypeName: string, className: string): string {
  return `Your ${prerequisiteTypeName} is still needed for ${className}`;
}

/**
 * Sends the "document still needed" reminder. The caller (the admin route)
 * has already validated the student/class/prerequisite and the duplicate guard.
 */
export async function sendPrerequisiteMissingEmail(params: {
  studentId: string;
  studentName: string;
  studentEmail: string;
  classId: string;
  className: string;
  prerequisiteTypeId: string;
  prerequisiteTypeName: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    validateEmail(params.studentEmail, 'student email');
  } catch (error: any) {
    return { success: false, error: `Invalid student email: ${error.message}` };
  }

  // Same destination as the rejected-submission email's resubmit link.
  const uploadUrl = `${SITE_URL}/student/classes/${params.classId}`;

  let html: string;
  try {
    html = await render(
      React.createElement(PrerequisiteMissing, {
        studentName: params.studentName,
        prerequisiteTypeName: params.prerequisiteTypeName,
        className: params.className,
        uploadUrl,
      })
    );
  } catch (error: any) {
    return { success: false, error: `Failed to render email template: ${error.message}` };
  }

  const subject = getPrerequisiteMissingSubject(params.prerequisiteTypeName, params.className);
  const emailType = prerequisiteMissingEmailType(params.classId, params.prerequisiteTypeId);

  const result = await sendEmail({
    from: process.env.EMAIL_FROM || 'noreply@midwestea.com',
    to: params.studentEmail,
    subject,
    html,
    tags: [
      { name: 'email_type', value: 'prerequisite_missing' },
      { name: 'student_id', value: params.studentId },
    ],
    metadata: { student_id: params.studentId },
  });

  if (result.success || result.error) {
    await logEmailToDatabase({
      recipient_email: params.studentEmail,
      recipient_name: params.studentName,
      subject,
      email_type: emailType,
      student_id: params.studentId,
      success: result.success,
      email_id: result.id,
      error: result.error,
      retries: result.retries || 0,
    }).catch((logError) => {
      console.error('[sendPrerequisiteMissingEmail] Failed to log to database:', logError);
    });
  }

  return { success: result.success, error: result.error };
}

/** True when a successful reminder for this student/class/type was logged within `withinHours`. */
export async function wasPrerequisiteReminderSentRecently(
  supabase: SupabaseClient,
  params: { studentId: string; classId: string; prerequisiteTypeId: string },
  withinHours = 24
): Promise<{ recent: boolean; error: string | null }> {
  const since = new Date(Date.now() - withinHours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('email_logs')
    .select('id')
    .eq('student_id', params.studentId)
    .eq('email_type', prerequisiteMissingEmailType(params.classId, params.prerequisiteTypeId))
    .eq('success', true)
    .gte('created_at', since)
    .limit(1);
  if (error) return { recent: false, error: error.message };
  return { recent: (data?.length ?? 0) > 0, error: null };
}
