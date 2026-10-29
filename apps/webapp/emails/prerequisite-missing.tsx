import * as React from 'react';
import { BodyText, BodyLine } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { PrimaryButton } from './components/PrimaryButton';

export interface PrerequisiteMissingProps {
  studentName: string;
  prerequisiteTypeName: string;
  className: string;
  uploadUrl: string;
}

/**
 * Sent when an admin clicks "Remind" for a required prerequisite document the
 * student has not submitted yet. See apps/webapp/emails/EMAILS-GUIDE.md.
 */
export default function PrerequisiteMissing({
  studentName,
  prerequisiteTypeName,
  className,
  uploadUrl,
}: PrerequisiteMissingProps) {
  return (
    <EmailLayout previewText={`Your ${prerequisiteTypeName} is still needed for ${className}`}>
      <Heading size={48}>Document needed</Heading>
      <BodyText align="left">
        <BodyLine>Hello {studentName},</BodyLine>
        <BodyLine>
          We haven&apos;t received your <strong>{prerequisiteTypeName}</strong> for {className}{' '}
          yet. It&apos;s required before your spot is fully confirmed.
        </BodyLine>
        <BodyLine>You can upload it any time using the button below.</BodyLine>
      </BodyText>

      <PrimaryButton href={uploadUrl} align="left">
        Upload my document
      </PrimaryButton>
    </EmailLayout>
  );
}

PrerequisiteMissing.PreviewProps = {
  studentName: 'Jane Smith',
  prerequisiteTypeName: 'CPR Certification',
  className: 'Advanced Cardiovascular Life Support (ACLS)',
  uploadUrl: 'https://midwestea.com/student/classes/00000000-0000-0000-0000-000000000000',
} satisfies PrerequisiteMissingProps;
