import * as React from 'react';
import { BodyText, BodyLine } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { HeroImage } from './components/HeroImage';
import { PrimaryButton } from './components/PrimaryButton';

export interface WaitlistOpensProps {
  studentName: string;
  className: string;
  startDate: string;
  registrationCloseDate: string;
  heroImageUrl: string;
  registerUrl: string;
}

/**
 * Sent when a new class instance opens for a course someone is waitlisted for.
 *
 * Trigger: no existing call site. Needs a bulk-send helper — given a course_code,
 * look up all `waitlist` rows for that code and send this to each student. See
 * apps/webapp/emails/EMAILS-GUIDE.md for the suggested `notifyWaitlistOfNewClass()`
 * shape; not implemented here since it needs an admin action or a hook off class
 * creation to actually call it.
 *
 * Figma: node 9947-9933 ("Waitlist Class Opens").
 */
export default function WaitlistOpens({
  studentName,
  className,
  startDate,
  registrationCloseDate,
  heroImageUrl,
  registerUrl,
}: WaitlistOpensProps) {
  return (
    <EmailLayout previewText={`Registration is open for ${className}`}>
      <Heading size={64}>Join the team!</Heading>
      <HeroImage src={heroImageUrl} alt={className} />
      <BodyText align="left">
        <BodyLine>Hello {studentName},</BodyLine>
        <BodyLine>Previously, you were interested in {className}.</BodyLine>
        <BodyLine>
          We&apos;re excited to let you know that we have just opened up registration for our
          newest {className}, which starts on {startDate}.
        </BodyLine>
        <BodyLine>Registration goes through {registrationCloseDate}.</BodyLine>
      </BodyText>
      <PrimaryButton href={registerUrl}>
        Join the team and get your {className} certification
      </PrimaryButton>
    </EmailLayout>
  );
}

WaitlistOpens.PreviewProps = {
  studentName: 'Jane Smith',
  className: 'Paramedic Training',
  startDate: 'August 19th',
  registrationCloseDate: 'August 5th',
  heroImageUrl: 'https://placehold.co/1280x720/191920/f7f6f3?text=MidwestEA',
  registerUrl: 'https://midwestea.com/checkout?class_id=demo',
} satisfies WaitlistOpensProps;
