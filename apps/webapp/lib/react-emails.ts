import { render } from '@react-email/render';
import * as React from 'react';
import { sendEmail, type EmailSendResult } from './email';
import WaitlistSuccessful, {
  type WaitlistSuccessfulProps,
} from '../emails/waitlist-successful';
import EnrollmentSuccessful, {
  type EnrollmentSuccessfulProps,
} from '../emails/enrollment-successful';
import CompletedClassFollowups, {
  type CompletedClassFollowupsProps,
} from '../emails/completed-class-followups';

/**
 * Send functions for the new React Email-based transactional emails
 * (apps/webapp/emails/). Kept separate from lib/email.ts's older
 * flat-HTML-template send functions to avoid mixing the two rendering
 * approaches in one file — see apps/webapp/emails/EMAILS-GUIDE.md.
 */

const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@midwestea.com';

/**
 * Send the "Waitlist Successful" confirmation email.
 * Real bug fix: app/api/waitlist/submit/route.ts previously created the
 * waitlist row but never sent any confirmation email.
 */
export async function sendWaitlistSuccessfulEmail(
  to: string,
  props: WaitlistSuccessfulProps
): Promise<EmailSendResult> {
  const html = await render(React.createElement(WaitlistSuccessful, props));

  return sendEmail({
    from: DEFAULT_FROM,
    to,
    subject: `You're on the waitlist for ${props.courseName}`,
    html,
    tags: [{ name: 'email_type', value: 'waitlist_successful' }],
  });
}

/**
 * Render the "Enrollment Successful" email to an HTML string, for use by
 * sendCourseEnrollmentEmail / sendProgramEnrollmentEmail in lib/email.ts.
 * Rendering only (no send) — those functions handle from/subject/tags/logging
 * so both course and program paths share one send pipeline.
 */
export async function renderEnrollmentSuccessfulEmail(
  props: EnrollmentSuccessfulProps
): Promise<string> {
  return render(React.createElement(EnrollmentSuccessful, props));
}

/**
 * Send the "Completed Class + Followups" certificate-ready email
 * (BEN-1155/1156). First real caller — previously template-only, blocked on
 * the certificates table/completion data this build adds.
 */
export async function sendCertificateIssuedEmail(
  to: string,
  props: CompletedClassFollowupsProps
): Promise<EmailSendResult> {
  const html = await render(React.createElement(CompletedClassFollowups, props));

  return sendEmail({
    from: DEFAULT_FROM,
    to,
    subject: `Your ${props.className} certificate is ready`,
    html,
    tags: [{ name: 'email_type', value: 'completed_class_followups' }],
  });
}
