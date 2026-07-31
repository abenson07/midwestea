import { Link } from '@react-email/components';
import * as React from 'react';
import { BodyText, BodyLine } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { HeroImage } from './components/HeroImage';
import { EMAIL_COLORS } from './components/constants';

export interface WaitlistSuccessfulProps {
  studentName: string;
  courseName: string;
  heroImageUrl: string;
  supportUrl?: string;
}

/**
 * Sent immediately after a student joins the waitlist for a course.
 * Figma: node 9947-9932 ("Waitlist Confirmed").
 */
export default function WaitlistSuccessful({
  studentName,
  courseName,
  heroImageUrl,
  supportUrl = 'mailto:support@midwestea.com',
}: WaitlistSuccessfulProps) {
  return (
    <EmailLayout previewText={`You're on the waitlist for ${courseName}`}>
      <Heading size={48}>You&apos;re on the list</Heading>
      <HeroImage src={heroImageUrl} alt={courseName} />
      <BodyText align="left">
        <BodyLine>Hello {studentName},</BodyLine>
        <BodyLine>
          Thanks for your interest in {courseName}. Currently, we do not have any classes
          available, but you will be the first to know when we open a new one.
        </BodyLine>
        <BodyLine>
          If you have any questions,{' '}
          <Link href={supportUrl} style={{ color: EMAIL_COLORS.text, textDecoration: 'underline' }}>
            contact support here.
          </Link>
        </BodyLine>
      </BodyText>
    </EmailLayout>
  );
}

WaitlistSuccessful.PreviewProps = {
  studentName: 'Jane Smith',
  courseName: 'Advanced Emergency Medical Technician',
  heroImageUrl: 'https://placehold.co/1280x720/191920/f7f6f3?text=MidwestEA',
} satisfies WaitlistSuccessfulProps;
