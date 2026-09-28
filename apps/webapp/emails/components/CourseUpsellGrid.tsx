import { Img, Section } from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EMAIL_FONTS } from './constants';
import { EyebrowLabel } from './DetailItem';
import { GhostLinkButton } from './GhostLinkButton';

export interface UpsellCourse {
  title: string;
  description: string;
  imageUrl?: string;
  href: string;
}

interface CourseUpsellGridProps {
  eyebrow: string;
  courses: UpsellCourse[]; // max 4, pre-filtered by the caller
}

const CARD_WIDTH = 220; // (600 - 128 padding - 16 gap) / 2, rounded

/** 2x2 table of upsell-course cards. Real <table> layout, not flexbox/grid. */
export function CourseUpsellGrid({ eyebrow, courses }: CourseUpsellGridProps) {
  if (courses.length === 0) return null;

  const rows: UpsellCourse[][] = [];
  for (let i = 0; i < courses.length; i += 2) {
    rows.push(courses.slice(i, i + 2));
  }

  return (
    <Section style={{ padding: '24px 64px 48px' }}>
      <EyebrowLabel>{eyebrow}</EyebrowLabel>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((course, colIndex) => (
                <td
                  key={colIndex}
                  width="50%"
                  valign="top"
                  style={{
                    paddingRight: colIndex === 0 ? 16 : 0,
                    paddingBottom: rowIndex === rows.length - 1 ? 0 : 16,
                  }}
                >
                  {course.imageUrl ? (
                    <Img
                      src={course.imageUrl}
                      width={CARD_WIDTH}
                      height={124}
                      alt={course.title}
                      style={{
                        width: '100%',
                        maxWidth: CARD_WIDTH,
                        height: 124,
                        objectFit: 'cover',
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        maxWidth: CARD_WIDTH,
                        height: 124,
                        backgroundColor: EMAIL_COLORS.placeholderGray,
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                  )}
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
                    {course.title}
                  </p>
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontFamily: EMAIL_FONTS.body,
                      fontSize: 14,
                      lineHeight: 1.4,
                      color: EMAIL_COLORS.cardText,
                    }}
                  >
                    {course.description}
                  </p>
                  <GhostLinkButton href={course.href}>Learn more</GhostLinkButton>
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
