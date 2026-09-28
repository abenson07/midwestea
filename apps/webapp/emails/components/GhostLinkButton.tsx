import { Link } from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EMAIL_FONTS } from './constants';

interface GhostLinkButtonProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Secondary text link with a trailing arrow, e.g. "See invoices ->", "Log in to account ->".
 * Uses a unicode arrow rather than Figma's SVG icon — simpler and more reliable across
 * email clients than inline SVG.
 */
export function GhostLinkButton({ href, children }: GhostLinkButtonProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        fontFamily: EMAIL_FONTS.body,
        fontWeight: 600,
        fontSize: 12,
        color: EMAIL_COLORS.text,
        textDecoration: 'none',
      }}
    >
      {children} &rarr;
    </Link>
  );
}
