import { Button, Section } from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EMAIL_FONTS } from './constants';

interface PrimaryButtonProps {
  href: string;
  children: React.ReactNode;
  align?: 'left' | 'center';
}

/** Solid mea-yellow CTA — the one primary action per email. */
export function PrimaryButton({ href, children, align = 'center' }: PrimaryButtonProps) {
  return (
    <Section style={{ padding: '0 64px 32px', textAlign: align }}>
      <Button
        href={href}
        style={{
          backgroundColor: EMAIL_COLORS.primaryButtonBg,
          border: `1px solid ${EMAIL_COLORS.primaryButtonBg}`,
          borderRadius: 4,
          color: EMAIL_COLORS.primaryButtonText,
          fontFamily: EMAIL_FONTS.body,
          fontWeight: 600,
          fontSize: 12,
          padding: '8px 16px',
          textDecoration: 'none',
        }}
      >
        {children}
      </Button>
    </Section>
  );
}
