import * as React from 'react';
import { EMAIL_COLORS, EMAIL_FONTS } from './constants';

interface DetailItemProps {
  title: string;
  description: React.ReactNode;
}

/** Oswald Bold uppercase title + DM Sans description — one "card" of detail/prerequisite copy. */
export function DetailItem({ title, description }: DetailItemProps) {
  return (
    <div>
      <p
        style={{
          margin: '0 0 8px 0',
          fontFamily: EMAIL_FONTS.subheading,
          fontWeight: 700,
          fontSize: 16,
          lineHeight: 0.9,
          textTransform: 'uppercase',
          color: EMAIL_COLORS.cardText,
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: EMAIL_FONTS.body,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.4,
          color: EMAIL_COLORS.cardText,
        }}
      >
        {description}
      </p>
    </div>
  );
}

/** Small tracked-uppercase eyebrow label, e.g. "Class Details", "Pre-requisites". */
export function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 16px 0',
        fontFamily: EMAIL_FONTS.heading,
        fontWeight: 700,
        fontSize: 12,
        lineHeight: '24px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: EMAIL_COLORS.eyebrow,
      }}
    >
      {children}
    </p>
  );
}
