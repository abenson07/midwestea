import * as React from 'react';
import { BodyText } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { PrimaryButton } from './components/PrimaryButton';

export interface RateClassProps {
  className: string;
  reviewUrl: string;
}

/**
 * Sent to specific students to collect feedback on a completed class.
 * `reviewUrl` carries whatever identifying query params (class_id, student_id,
 * enrollment_id) the review form needs — caller's responsibility to build it.
 * Figma: node 9947-9936 ("Rate Class").
 */
export default function RateClass({ className, reviewUrl }: RateClassProps) {
  return (
    <EmailLayout previewText={`How did we do on ${className}?`}>
      <Heading size={48}>How did we do?</Heading>
      <BodyText align="left">
        You recently completed {className} training. We&apos;d love to hear how we did. As a
        thank you, we&apos;ll provide a 25% discount on any of our training courses, redeemable
        in the next year.
      </BodyText>
      <PrimaryButton href={reviewUrl} align="left">
        Provide a review
      </PrimaryButton>
    </EmailLayout>
  );
}

RateClass.PreviewProps = {
  className: 'Paramedic Training',
  reviewUrl: 'https://midwestea.com/review?class_id=demo&student_id=demo',
} satisfies RateClassProps;
