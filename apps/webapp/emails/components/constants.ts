/**
 * Shared design tokens for the transactional email system.
 * See apps/webapp/emails/EMAILS-GUIDE.md for the reasoning behind each flagged value.
 */

export const EMAIL_COLORS = {
  text: '#191920', // mea.text — intro/closing paragraphs, headings
  cardText: '#333436', // Figma-specified softer gray for Detail/Prerequisite card copy (not a
  // site token — kept because it's what the Figma literally specifies)
  background: '#f7f6f3', // mea.background (Figma had #f8f7f3, normalized to the real site token)
  border: '#c3c3c0', // neutral.light — matches the OTP code-box border exactly
  eyebrow: '#a4610a', // "Class Details" / "Additional Courses" eyebrow label color. Figma had two
  // close-but-different values (#a4610a and #a06313) — picked the former as canonical.
  primaryButtonBg: '#ffb452', // mea.yellow — exact match, real site token
  primaryButtonText: '#191920',
  white: '#fffffe',
  placeholderGray: '#d9d9d9', // upsell card image placeholder
} as const;

export const EMAIL_FONTS = {
  heading: `'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`,
  subheading: `'Oswald', Impact, 'Arial Narrow', Arial, sans-serif`,
  body: `'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`,
  monospace: `'Courier New', Courier, monospace`,
} as const;

export const FOOTER_INFO = {
  companyName: 'MidwestEA',
  supportEmail: 'support@midwestea.com',
  address: '8108 Pleasant Valley Rd, Pleasant Valley, MO, United States',
  facebookUrl:
    'https://www.facebook.com/p/Midwest-Emergency-Academy-61571290473533/',
  privacyUrl: 'https://midwestea.com/privacy-policy',
} as const;

export const EMAIL_CONTENT_WIDTH = 600;

/** Base URL for hosted assets (logo, fallback hero images) referenced by <img> in emails. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://midwestea.com';
