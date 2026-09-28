import * as React from 'react';
import { BodyText, BodyLine } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { PrimaryButton } from './components/PrimaryButton';

export interface FullyEnrolledProps {
  studentName: string;
  className: string;
  profileUrl: string;
}

/**
 * Sent when the last required prerequisite for a class becomes approved
 * (BEN-865). Replaces lib/email-templates/fully-enrolled.html — see
 * apps/webapp/emails/EMAILS-GUIDE.md.
 */
export default function FullyEnrolled({ studentName, className, profileUrl }: FullyEnrolledProps) {
  return (
    <EmailLayout previewText={`You're fully enrolled in ${className}`}>
      <Heading size={48}>You&apos;re fully enrolled</Heading>
      <BodyText align="left">
        <BodyLine>Hello {studentName},</BodyLine>
        <BodyLine>
          Good news — all of your requirements for {className} have been approved. You&apos;re
          fully enrolled.
        </BodyLine>
        <BodyLine>Your class materials are now available in your student portal.</BodyLine>
      </BodyText>

      <PrimaryButton href={profileUrl} align="left">
        Go to my portal
      </PrimaryButton>
    </EmailLayout>
  );
}

FullyEnrolled.PreviewProps = {
  studentName: 'Jane Smith',
  className: 'Advanced Cardiovascular Life Support (ACLS)',
  profileUrl: 'https://midwestea.com/student/profile',
} satisfies FullyEnrolledProps;
