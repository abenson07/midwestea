import { Section } from '@react-email/components';
import * as React from 'react';
import { BodyText, BodyLine } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { HeroImage } from './components/HeroImage';
import { DetailItem, EyebrowLabel } from './components/DetailItem';
import { GhostLinkButton } from './components/GhostLinkButton';
import { PrerequisiteGrid, type PrerequisiteItem } from './components/PrerequisiteGrid';
import { EMAIL_FONTS } from './components/constants';
import { getEnrollmentContent } from './content/enrollment';

export interface Installment {
  label: string; // e.g. "First installment", "Second installment"
  date: string;
}

export interface EnrollmentSuccessfulProps {
  studentName: string;
  courseCode: string;
  courseName: string;
  heroImageUrl: string;
  startDateLabel: string; // e.g. "July 15th/16th"
  endDateLabel: string; // e.g. "January 15th"
  remainingCost?: string; // formatted currency; omit installment section if undefined
  installments?: Installment[];
  invoicesUrl: string;
  portalLoginUrl: string;
  prerequisites?: PrerequisiteItem[];
  prerequisiteDueDate?: string;
}

/**
 * Sent right after a student registers and pays the registration fee for a class.
 * Replaces both course-enrollment.html and program-enrollment.html — the installment
 * section only renders when `installments` is provided, which is what used to
 * distinguish "course" vs "program" enrollment emails.
 *
 * Figma: node 9947-9870 ("Enrollment Successful").
 */
export default function EnrollmentSuccessful({
  studentName,
  courseCode,
  courseName,
  heroImageUrl,
  startDateLabel,
  endDateLabel,
  remainingCost,
  installments,
  invoicesUrl,
  portalLoginUrl,
  prerequisites,
  prerequisiteDueDate,
}: EnrollmentSuccessfulProps) {
  const content = getEnrollmentContent(courseCode);
  const hasInstallments = !!installments && installments.length > 0;
  const hasPrerequisites = !!prerequisites && prerequisites.length > 0;
  const lastInstallmentDate = hasInstallments ? installments![installments!.length - 1].date : undefined;

  return (
    <EmailLayout previewText={`Welcome to ${courseName}!`}>
      <Heading size={64}>
        Welcome to <br />
        the team
      </Heading>
      <HeroImage src={heroImageUrl} alt={courseName} />
      <BodyText align="left">
        <BodyLine>Hello {studentName},</BodyLine>
        <BodyLine>
          Thank you for choosing Midwest Emergency Academy for your {courseName}. We&apos;re
          excited to get you in field.
        </BodyLine>
        <BodyLine>Here&apos;s a few important things to note:</BodyLine>
      </BodyText>

      <Section style={{ padding: '24px 64px 48px' }}>
        <EyebrowLabel>Class Details</EyebrowLabel>

        <div style={{ marginBottom: 24 }}>
          <DetailItem
            title={`Classes Start ${startDateLabel}`}
            description={content.scheduleNarrative({ startDateLabel, endDateLabel })}
          />
        </div>

        {hasInstallments && (
          <div style={{ marginBottom: 24 }}>
            <DetailItem
              title={`Final Payment Due ${lastInstallmentDate}`}
              description={
                <>
                  Your registration fee is paid! The remaining class cost is {remainingCost},
                  paid in two installments.
                  <br />
                  <span style={{ fontFamily: EMAIL_FONTS.body, fontWeight: 500, fontSize: 12 }}>
                    {installments!.map((installment) => (
                      <React.Fragment key={installment.label}>
                        {installment.label}: {installment.date}
                        <br />
                      </React.Fragment>
                    ))}
                  </span>
                </>
              }
            />
            <div style={{ marginTop: 16 }}>
              <GhostLinkButton href={invoicesUrl}>See invoices</GhostLinkButton>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <DetailItem title="Course Material" description={content.courseMaterialBlurb} />
        </div>

        <div>
          <DetailItem
            title="Login to your new account"
            description="Your email gets you access to your course content, pay your invoices, and receive your certification. Just click the link here to access your account today."
          />
          <div style={{ marginTop: 16 }}>
            <GhostLinkButton href={portalLoginUrl}>Log in to account</GhostLinkButton>
          </div>
        </div>
      </Section>

      {hasPrerequisites && (
        <PrerequisiteGrid
          eyebrow="Pre-requisites"
          dueDateLabel={prerequisiteDueDate || 'the due date'}
          items={prerequisites!}
        />
      )}

      <BodyText>
        We will follow up with a reminder a few weeks before class. See you soon!
      </BodyText>
    </EmailLayout>
  );
}

EnrollmentSuccessful.PreviewProps = {
  studentName: 'Jane Smith',
  courseCode: 'PARA',
  courseName: 'Paramedic Training',
  heroImageUrl: 'https://placehold.co/1280x720/191920/f7f6f3?text=MidwestEA',
  startDateLabel: 'July 15th/16th',
  endDateLabel: 'January 15th',
  remainingCost: '$4,200.00',
  installments: [
    { label: 'First installment', date: 'June 15th' },
    { label: 'Second installment', date: 'July 20th' },
  ],
  invoicesUrl: 'https://midwestea.com/student/invoices',
  portalLoginUrl: 'https://midwestea.com/student',
  prerequisites: [
    { title: 'PRERESQUISITE TITLE HERE', details: 'Details go here' },
    { title: 'PRERESQUISITE TITLE HERE', details: 'Details go here' },
    { title: 'PRERESQUISITE TITLE HERE', details: 'Details go here' },
    { title: 'PRERESQUISITE TITLE HERE', details: 'Details go here' },
  ],
  prerequisiteDueDate: 'DUE DATE HERE',
} satisfies EnrollmentSuccessfulProps;
