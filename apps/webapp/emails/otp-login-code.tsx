import * as React from 'react';
import { BodyText } from './components/BodyText';
import { EmailLayout } from './components/EmailLayout';
import { Heading } from './components/Heading';
import { OtpCodeDisplay } from './components/OtpCodeDisplay';

export interface OtpLoginCodeProps {
  code: string;
}

/**
 * One-time login code email. Today the only real integration point is the
 * Supabase-Auth admin login flow (lib/email-templates/admin-otp.html, pasted
 * into the Supabase Auth dashboard as SMTP template — Supabase substitutes the
 * code, our app code never renders this one at send time).
 *
 * There is no Stripe OTP integration anywhere in this codebase or, as far as
 * research turned up, in Stripe's own product line that would let a merchant
 * send a fully custom-HTML OTP email through Stripe — do not build new Stripe
 * integration against this without confirming which Stripe feature is meant.
 *
 * No CTA button — a "copy the code" button can't actually copy to clipboard
 * (email clients strip JavaScript/onclick entirely), so it was dropped rather
 * than ship a button that goes nowhere. The code itself is selectable text.
 *
 * Figma: node 9959-11367 ("Here's your login code").
 */
export default function OtpLoginCode({ code }: OtpLoginCodeProps) {
  return (
    <EmailLayout previewText="Here's your login code">
      <Heading size={48}>Here&apos;s your login code</Heading>
      <BodyText paddingY={16}>
        To keep your account secure, we&apos;re providing you with a code to login to your
        account. Copy the code below and paste it where you logged in.
      </BodyText>
      <OtpCodeDisplay code={code} />
    </EmailLayout>
  );
}

OtpLoginCode.PreviewProps = {
  code: '04204205',
} satisfies OtpLoginCodeProps;
