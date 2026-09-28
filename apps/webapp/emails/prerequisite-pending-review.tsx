import { Section } from '@react-email/components';
import * as React from 'react';
import { BodyText, BodyLine } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { PrimaryButton } from './components/PrimaryButton';
import { EMAIL_COLORS, EMAIL_FONTS } from './components/constants';

export interface PrerequisitePendingReviewProps {
  studentName: string;
  className: string;
  outstandingList: string; // plain-text, comma-joined — not markup
  actionUrl: string;
}

/**
 * Sent at enrollment when a class has required prerequisites that are not
 * all approved yet (BEN-865). Replaces
 * lib/email-templates/prerequisite-pending-review.html — see
 * apps/webapp/emails/EMAILS-GUIDE.md.
 */
export default function PrerequisitePendingReview({
  studentName,
  className,
  outstandingList,
  actionUrl,
}: PrerequisitePendingReviewProps) {
  return (
    <EmailLayout previewText={`Next steps for ${className}`}>
      <Heading size={48}>Next steps</Heading>
      <BodyText align="left">
        <BodyLine>Hello {studentName},</BodyLine>
        <BodyLine>
          You&apos;re registered for your {className}. Before your spot is fully confirmed, we
          need a few things from you.
        </BodyLine>
      </BodyText>

      <Section style={{ padding: '0 64px 32px' }}>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: EMAIL_COLORS.background,
                  borderLeft: `4px solid ${EMAIL_COLORS.eyebrow}`,
                  borderRadius: 4,
                  padding: 16,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: EMAIL_FONTS.body,
                    fontSize: 14,
                    lineHeight: 1.4,
                    color: EMAIL_COLORS.cardText,
                  }}
                >
                  <strong>Outstanding:</strong> {outstandingList}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <BodyText align="left">
        Once we&apos;ve reviewed and approved everything, we&apos;ll email you again to confirm.
      </BodyText>

      <PrimaryButton href={actionUrl} align="left">
        Complete my requirements
      </PrimaryButton>
    </EmailLayout>
  );
}

PrerequisitePendingReview.PreviewProps = {
  studentName: 'Jane Smith',
  className: 'Advanced Cardiovascular Life Support (ACLS)',
  outstandingList: 'CPR Certification, Orientation Acknowledgment',
  actionUrl: 'https://midwestea.com/student/prerequisites/ACLS?from=profile',
} satisfies PrerequisitePendingReviewProps;
