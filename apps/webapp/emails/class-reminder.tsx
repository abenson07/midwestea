import * as React from 'react';
import { BodyText, BodyLine } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { HeroImage } from './components/HeroImage';
import { PrerequisiteGrid, type PrerequisiteItem } from './components/PrerequisiteGrid';

export interface ClassReminderProps {
  studentName: string;
  className: string;
  startDate: string;
  heroImageUrl: string;
  prerequisiteDueDate?: string;
  missingPrerequisites?: PrerequisiteItem[];
}

/**
 * Sent 14 days before a class starts, as a reminder + outstanding prerequisites.
 *
 * Trigger: the daily Vercel Cron app/api/cron/class-reminders/route.ts (schedule in
 * apps/webapp/vercel.json) via sendClassReminderEmail in lib/email.ts, which passes
 * only the prerequisites the student hasn't satisfied (lib/prerequisite-evaluation.ts).
 *
 * Figma: node 9947-9938 ("Class Reminder (2 weeks away)"). The Figma closing line
 * ("We will follow up with a reminder a few weeks before class...") is copy-pasted
 * from Enrollment Successful and doesn't make sense here since this email IS the
 * follow-up — replaced with different closing copy.
 */
export default function ClassReminder({
  studentName,
  className,
  startDate,
  heroImageUrl,
  prerequisiteDueDate,
  missingPrerequisites,
}: ClassReminderProps) {
  const hasMissingPrerequisites = !!missingPrerequisites && missingPrerequisites.length > 0;

  return (
    <EmailLayout previewText={`Your ${className} class starts soon`}>
      <Heading size={64}>It&apos;s almost here</Heading>
      <HeroImage src={heroImageUrl} alt={className} />
      <BodyText align="left">
        <BodyLine>Hello {studentName},</BodyLine>
        <BodyLine>Your {className} class starts on {startDate}.</BodyLine>
      </BodyText>

      {hasMissingPrerequisites && (
        <PrerequisiteGrid
          eyebrow="Make sure you're ready"
          dueDateLabel={prerequisiteDueDate || 'the due date'}
          items={missingPrerequisites!}
        />
      )}

      <BodyText>We can&apos;t wait to see you in class!</BodyText>
    </EmailLayout>
  );
}

ClassReminder.PreviewProps = {
  studentName: 'Jane Smith',
  className: 'Paramedic Training',
  startDate: 'August 19th',
  heroImageUrl: 'https://placehold.co/1280x720/191920/f7f6f3?text=MidwestEA',
  prerequisiteDueDate: 'DUE DATE HERE',
  missingPrerequisites: [
    { title: 'PRERESQUISITE TITLE HERE', details: 'Details go here' },
    { title: 'PRERESQUISITE TITLE HERE', details: 'Details go here' },
    { title: 'PRERESQUISITE TITLE HERE', details: 'Details go here' },
    { title: 'PRERESQUISITE TITLE HERE', details: 'Details go here' },
  ],
} satisfies ClassReminderProps;
