import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EMAIL_FONTS, FOOTER_INFO, EMAIL_CONTENT_WIDTH, SITE_URL } from './constants';

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

/**
 * Shared shell for every transactional email: logo header, content, social row, footer.
 * Every section sets its own background color (not just <body>) to resist automatic
 * dark-mode inversion in Apple Mail / Outlook.com.
 */
export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        {/* Outlook desktop (Word rendering engine) ignores web fonts; force Arial as a hard fallback */}
        <style>{`
          @media (max-width: 620px) {
            .email-container { width: 100% !important; }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: EMAIL_COLORS.white,
          fontFamily: EMAIL_FONTS.body,
        }}
      >
        {/* MSO conditional: force Arial in Outlook desktop */}
        {/* eslint-disable-next-line react/no-danger */}
        <div
          dangerouslySetInnerHTML={{
            __html:
              '<!--[if mso]><style type="text/css">body, table, td {font-family: Arial, sans-serif !important;}</style><![endif]-->',
          }}
        />
        <Container
          className="email-container"
          style={{
            width: EMAIL_CONTENT_WIDTH,
            maxWidth: EMAIL_CONTENT_WIDTH,
            margin: '0 auto',
            backgroundColor: EMAIL_COLORS.background,
          }}
        >
          {/* Logo header — real lockup asset, public/images/Company-Logo.svg */}
          <Section style={{ padding: '31px 24px 32px', textAlign: 'center' }}>
            <Img
              src={`${SITE_URL}/images/Company-Logo.svg`}
              alt="MidwestEA — Emergency Academy"
              width={153}
              height={49}
              style={{ display: 'inline-block', width: 153, height: 'auto' }}
            />
          </Section>

          {children}

          {/* Social row — Facebook only, matching the real site footer */}
          <Section style={{ padding: '64px 24px 8px', backgroundColor: EMAIL_COLORS.white, textAlign: 'center' }}>
            <Link href={FOOTER_INFO.facebookUrl} style={{ display: 'inline-block' }}>
              <FacebookIcon />
            </Link>
          </Section>

          {/* Footer */}
          <Section style={{ padding: '16px 24px 4px', backgroundColor: EMAIL_COLORS.white, textAlign: 'center' }}>
            <Text
              style={{
                fontFamily: EMAIL_FONTS.heading,
                fontSize: 14,
                lineHeight: '28px',
                color: EMAIL_COLORS.cardText,
                textAlign: 'center',
                margin: 0,
              }}
            >
              {FOOTER_INFO.address}
              <br />
              {`© ${new Date().getFullYear()} ${FOOTER_INFO.companyName}. All rights reserved.`}
            </Text>
          </Section>
          <Section style={{ padding: '8px 24px 64px', backgroundColor: EMAIL_COLORS.white, textAlign: 'center' }}>
            <Row>
              <Column style={{ textAlign: 'center' }}>
                <Link
                  href={FOOTER_INFO.privacyUrl}
                  style={{
                    fontFamily: EMAIL_FONTS.heading,
                    fontSize: 13,
                    color: EMAIL_COLORS.cardText,
                    textDecoration: 'underline',
                    padding: '0 8px',
                  }}
                >
                  Privacy policy
                </Link>
                <Link
                  href={`mailto:${FOOTER_INFO.supportEmail}`}
                  style={{
                    fontFamily: EMAIL_FONTS.heading,
                    fontSize: 13,
                    color: EMAIL_COLORS.cardText,
                    textDecoration: 'underline',
                    padding: '0 8px',
                  }}
                >
                  Customer support
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function FacebookIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="14" fill={EMAIL_COLORS.border} />
      <path
        d="M16.5 9h-1.75c-.69 0-1.25.56-1.25 1.25V12h3l-.4 2.5h-2.6V21h-2.6v-6.5H9V12h1.9v-1.9c0-1.87 1.13-3.1 3.1-3.1H16.5V9z"
        fill="#ffffff"
      />
    </svg>
  );
}
