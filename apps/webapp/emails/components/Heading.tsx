import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EMAIL_FONTS } from './constants';

interface HeadingProps {
  size: 48 | 64;
  children: React.ReactNode;
  /** Inner horizontal padding — 40px for most headlines (matches Figma headerCenter) */
  paddingX?: number;
}

export function Heading({ size, children, paddingX = 40 }: HeadingProps) {
  return (
    <Section
      style={{
        padding: `16px ${paddingX}px 32px`,
        textAlign: 'center',
      }}
    >
      <Text
        style={{
          margin: 0,
          fontFamily: EMAIL_FONTS.subheading,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 0.9,
          color: EMAIL_COLORS.text,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Text>
    </Section>
  );
}
