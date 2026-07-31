import { Section } from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EMAIL_FONTS } from './constants';
import { DetailItem, EyebrowLabel } from './DetailItem';

export interface PrerequisiteItem {
  title: string;
  details: string;
}

interface PrerequisiteGridProps {
  eyebrow: string;
  dueDateLabel: string;
  items: PrerequisiteItem[];
}

/**
 * 2-column table of prerequisite DetailItems. Built as a real <table> (not flexbox/grid)
 * since Outlook desktop doesn't support either.
 *
 * Prerequisites aren't modeled in the database today — items are hardcoded per-course by
 * the caller. Keeping literal Figma placeholder wording ("PRERESQUISITE TITLE HERE" /
 * "Details go here") is a deliberate choice per product decision, not a bug — swap via
 * prompt-edit once real content or real data is ready.
 */
export function PrerequisiteGrid({ eyebrow, dueDateLabel, items }: PrerequisiteGridProps) {
  if (items.length === 0) return null;

  const rows: PrerequisiteItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <Section style={{ padding: '24px 64px 48px' }}>
      <EyebrowLabel>{eyebrow}</EyebrowLabel>
      <p
        style={{
          margin: '0 0 16px 0',
          fontFamily: EMAIL_FONTS.body,
          fontSize: 14,
          lineHeight: 1.4,
          color: EMAIL_COLORS.text,
        }}
      >
        If you haven&apos;t yet, be sure to upload the following items before{' '}
        <strong>{dueDateLabel}.</strong> These are required for participation in the class.
      </p>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((item, colIndex) => (
                <td
                  key={colIndex}
                  width="50%"
                  valign="top"
                  style={{
                    paddingRight: colIndex === 0 ? 16 : 0,
                    paddingBottom: rowIndex === rows.length - 1 ? 0 : 16,
                  }}
                >
                  <DetailItem title={item.title} description={item.details} />
                </td>
              ))}
              {row.length === 1 && <td width="50%" />}
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}
