import * as React from 'react';
import { BodyText, BodyLine } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { HeroImage } from './components/HeroImage';
import { PrimaryButton } from './components/PrimaryButton';

export interface WaitlistSpotOpensProps {
  studentName: string;
  className: string;
  startDate: string;
  registrationCloseDate: string;
  heroImageUrl: string;
  registerUrl: string;
}

/**
 * Sent when a spot opens up in an already-open (previously full) class, e.g. after
 * an enrollment cancellation. First-come-first-served — send to every waitlisted
 * student for that course_code at once, not one at a time.
 *
 * Trigger: natural hook point is app/api/enrollments/remove/route.ts. After a
 * removal, look up `waitlist` rows for that class's course_code and bulk-send.
 * Not wired up here — see apps/webapp/emails/EMAILS-GUIDE.md.
 *
 * Figma: node 9947-9934 ("Waitlist Spot Opens").
 */
export default function WaitlistSpotOpens({
  studentName,
  className,
  startDate,
  registrationCloseDate,
  heroImageUrl,
  registerUrl,
}: WaitlistSpotOpensProps) {
  return (
    <EmailLayout previewText={`A spot opened up in ${className}`}>
      <Heading size={64}>Answer the call</Heading>
      <HeroImage src={heroImageUrl} alt={className} />
      <BodyText align="left">
        <BodyLine>Hello {studentName},</BodyLine>
        <BodyLine>
          Previously, you were interested in {className}. Unfortunately, that class was full.
        </BodyLine>
        <BodyLine>
          One of our students had to step back and we have an open slot for our {className},
          which starts on {startDate}.
        </BodyLine>
        <BodyLine>
          This class registration closes {registrationCloseDate}. This slot is available on a
          first come, first served basis, so don&apos;t wait!
        </BodyLine>
      </BodyText>
      <PrimaryButton href={registerUrl}>
        Secure your spot in this class
      </PrimaryButton>
    </EmailLayout>
  );
}

WaitlistSpotOpens.PreviewProps = {
  studentName: 'Jane Smith',
  className: 'Paramedic Training',
  startDate: 'August 19th',
  registrationCloseDate: 'August 12th',
  heroImageUrl: 'https://placehold.co/1280x720/191920/f7f6f3?text=MidwestEA',
  registerUrl: 'https://midwestea.com/checkout?class_id=demo',
} satisfies WaitlistSpotOpensProps;
