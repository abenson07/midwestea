import * as React from 'react';
import { BodyText } from './components/BodyText';
import { CourseUpsellGrid, type UpsellCourse } from './components/CourseUpsellGrid';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { PrimaryButton } from './components/PrimaryButton';

export interface CompletedClassFollowupsProps {
  studentName: string;
  className: string;
  certificateUrl: string;
  suggestedFollowUps: UpsellCourse[]; // max 4, pre-filtered by the caller
  allCoursesUrl: string;
}

/**
 * Sent when a student completes a class — links their certificate and suggests
 * relevant follow-on courses.
 *
 * Scope decision: template only, no DB/schema changes, no PDF attachment (the
 * database has no "completed" enrollment status or certifications table today —
 * only 'registered'/'removed'). Certificate is linked, not attached.
 *
 * Selection algorithm for `suggestedFollowUps` (document only — the caller is
 * responsible for computing this list; not implemented against a real DB):
 *
 *   function getSuggestedFollowUps(completedCourseCode, studentHeldCourseCodes, max=4):
 *     candidates = COURSE_UPSELL_MAP[completedCourseCode]   // ordered list, defined per-course
 *     relevant = candidates.filter(c => !studentHeldCourseCodes.includes(c.courseCode))
 *     return relevant.slice(0, max)
 *
 * This needs `studentHeldCourseCodes` (the student's held certifications) and a
 * `COURSE_UPSELL_MAP` definition, neither of which exist today. See
 * apps/webapp/emails/EMAILS-GUIDE.md.
 *
 * Figma: node 9947-9935 ("Completed Class + Suggeted Followups"). The Figma copy
 * says the certificate is "as an attachment to this email" — dropped that clause
 * since we're linking, not attaching, per the scope decision above.
 */
export default function CompletedClassFollowups({
  studentName,
  className,
  certificateUrl,
  suggestedFollowUps,
  allCoursesUrl,
}: CompletedClassFollowupsProps) {
  return (
    <EmailLayout previewText={`You're all set, ${studentName}!`}>
      <Heading size={48}>You&apos;re all set</Heading>
      <BodyText align="left">
        Congratulations on completing your {className} training. We&apos;ve provided your
        certificate on your profile. You can access it at any time in your account.
      </BodyText>
      <PrimaryButton href={certificateUrl}>Get your certificate</PrimaryButton>
      <BodyText align="left">
        Here at Midwest Emergency Academy, we know that your training is never done. We offer
        a wide range of classes and trainings, whether its for a recertification or for taking
        the next step in your first responder career.
      </BodyText>
      <CourseUpsellGrid eyebrow="Additional Courses" courses={suggestedFollowUps} />
      <PrimaryButton href={allCoursesUrl}>See all available courses</PrimaryButton>
    </EmailLayout>
  );
}

CompletedClassFollowups.PreviewProps = {
  studentName: 'Jane Smith',
  className: 'Paramedic Training',
  certificateUrl: 'https://midwestea.com/student/certificates/demo',
  allCoursesUrl: 'https://midwestea.com/courses',
  suggestedFollowUps: [
    { title: 'Pediatric CPR', description: 'Short statement here', href: 'https://midwestea.com/courses/pediatric-cpr' },
    { title: 'Pediatric CPR', description: 'Short statement here', href: 'https://midwestea.com/courses/pediatric-cpr' },
    { title: 'Pediatric CPR', description: 'Short statement here', href: 'https://midwestea.com/courses/pediatric-cpr' },
    { title: 'Pediatric CPR', description: 'Short statement here', href: 'https://midwestea.com/courses/pediatric-cpr' },
  ],
} satisfies CompletedClassFollowupsProps;
