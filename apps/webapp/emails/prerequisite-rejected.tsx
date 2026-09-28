import { Section } from '@react-email/components';
import * as React from 'react';
import { BodyText, BodyLine } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { PrimaryButton } from './components/PrimaryButton';
import { EMAIL_COLORS, EMAIL_FONTS } from './components/constants';

export interface PrerequisiteRejectedProps {
  studentName: string;
  prerequisiteTypeName: string;
  className: string;
  rejectionReason: string;
  resubmitUrl: string;
  resubmitLabel: string;
}

/**
 * Sent when staff sends a prerequisite submission back for another look
 * (BEN-865). Replaces lib/email-templates/prerequisite-rejected.html, which
 * predates the branded React Email system — see apps/webapp/emails/EMAILS-GUIDE.md.
 */
export default function PrerequisiteRejected({
  studentName,
  prerequisiteTypeName,
  className,
  rejectionReason,
  resubmitUrl,
  resubmitLabel,
}: PrerequisiteRejectedProps) {
  return (
    <EmailLayout previewText={`Action needed: ${prerequisiteTypeName}`}>
      <Heading size={48}>Action needed</Heading>
      <BodyText align="left">
        <BodyLine>Hello {studentName},</BodyLine>
        <BodyLine>
          We reviewed your submission for <strong>{prerequisiteTypeName}</strong> and it needs
          another look before we can approve it.
        </BodyLine>
      </BodyText>

      <Section style={{ padding: '0 64px 32px' }}>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: EMAIL_COLORS.background,
                  borderLeft: `4px solid ${EMAIL_COLORS.text}`,
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
                  <strong>Reason:</strong> {rejectionReason}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <BodyText align="left">
        This requirement is still outstanding for {className}. You can submit a replacement any
        time — your earlier submission stays on file.
      </BodyText>

      <PrimaryButton href={resubmitUrl} align="left">
        {resubmitLabel}
      </PrimaryButton>
    </EmailLayout>
  );
}

PrerequisiteRejected.PreviewProps = {
  studentName: 'Jane Smith',
  prerequisiteTypeName: 'CPR Certification',
  className: 'Advanced Cardiovascular Life Support (ACLS)',
  rejectionReason: 'Card photo is blurry, please resubmit a clearer copy.',
  resubmitUrl: 'https://midwestea.com/student/prerequisites/ACLS?from=profile',
  resubmitLabel: 'Resubmit now',
} satisfies PrerequisiteRejectedProps;
