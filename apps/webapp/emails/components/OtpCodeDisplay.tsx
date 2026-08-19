import { Section } from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EMAIL_FONTS } from './constants';

interface OtpCodeDisplayProps {
  code: string;
}

/**
 * Bordered box with the code, spaced digit-by-digit, matching the Figma OTP frame.
 * Figma specifies 72px for the code text; reduced to 44px here so an 8-digit
 * space-separated code fits inside the 472px content column without wrapping/overflow —
 * flag if you'd rather keep 72px and accept wrapping on longer codes.
 */
export function OtpCodeDisplay({ code }: OtpCodeDisplayProps) {
  const spacedCode = code.split('').join(' ');

  return (
    <Section style={{ padding: '32px 64px' }}>
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          border: `1px solid ${EMAIL_COLORS.border}`,
          borderRadius: 8,
          backgroundColor: EMAIL_COLORS.white,
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: '16px 24px', textAlign: 'center' }}>
              <span
                style={{
                  fontFamily: EMAIL_FONTS.subheading,
                  fontWeight: 700,
                  fontSize: 44,
                  textTransform: 'uppercase',
                  color: EMAIL_COLORS.text,
                }}
              >
                {spacedCode}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
