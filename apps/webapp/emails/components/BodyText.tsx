import { Section } from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EMAIL_FONTS } from './constants';

interface BodyTextProps {
  children: React.ReactNode;
  paddingX?: number;
  paddingY?: number;
  align?: 'left' | 'center';
}

/**
 * DM Sans Medium paragraph block. Pass multiple <p>-like lines as children via <BodyLine>
 * (each rendered as its own <p> with spacing) rather than literal blank-line paragraphs.
 */
export function BodyText({ children, paddingX = 64, paddingY = 32, align = 'center' }: BodyTextProps) {
  return (
    <Section style={{ padding: `${paddingY}px ${paddingX}px`, textAlign: align }}>
      <div
        style={{
          fontFamily: EMAIL_FONTS.body,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: 1.4,
          color: EMAIL_COLORS.text,
          textAlign: align,
        }}
      >
        {children}
      </div>
    </Section>
  );
}

/** One line/paragraph inside a BodyText block, with standard spacing below it. */
export function BodyLine({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 20px 0' }}>{children}</p>;
}
