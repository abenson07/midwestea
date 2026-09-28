import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import * as React from 'react';
import fs from 'fs';
import path from 'path';
import { getTemplate } from '../../../../emails/dev-preview-registry';
import { sendEmail } from '../../../../lib/email';

const DEFAULT_TEST_RECIPIENT = 'alex@midwesternoriginals.com';

/**
 * Dev-only: swap same-origin `/images/...` assets (the site logo, mainly) for
 * `cid:` references and return matching Resend inline attachments.
 *
 * In local dev, NEXT_PUBLIC_SITE_URL is `http://localhost:...`, so lib/email.ts's
 * normal absolutizeEmailAssetUrls rewrite produces a URL Gmail can't reach.
 * A first attempt at fixing this inlined the images as base64 `data:` URIs
 * instead — that rendered fine in the react-email preview tool but Gmail's
 * webmail client strips/blocks `data:` image sources, so the logo still came
 * through broken in a real inbox. `cid:` inline attachments are the
 * mail-client-reliable way to do this (what every real ESP uses for embedded
 * logos), so we switched to that.
 *
 * Production sends aren't affected: SITE_URL there is a real public domain,
 * so the ordinary rewrite already works and this function is never in that path.
 */
function extractLocalImagesAsAttachments(
  html: string
): { html: string; attachments: Array<{ filename: string; content: Buffer; contentId: string }> } {
  const attachments: Array<{ filename: string; content: Buffer; contentId: string }> = [];
  const cidByFilename = new Map<string, string>();

  const rewritten = html.replace(/src="\/images\/([^"?]+)(\?[^"]*)?"/g, (match, filename: string) => {
    try {
      let cid = cidByFilename.get(filename);
      if (!cid) {
        const filePath = path.join(process.cwd(), 'public', 'images', filename);
        if (!fs.existsSync(filePath)) return match;

        cid = `${filename.replace(/[^a-zA-Z0-9]/g, '-')}-${attachments.length}`;
        attachments.push({ filename, content: fs.readFileSync(filePath), contentId: cid });
        cidByFilename.set(filename, cid);
      }
      return `src="cid:${cid}"`;
    } catch {
      return match;
    }
  });

  return { html: rewritten, attachments };
}

/**
 * Dev-only helper for the email preview tool — sends the currently-configured
 * email (with whatever variables are in the form) to a real inbox for review.
 * Requires RESEND_API_KEY to be set in apps/webapp/.env.local.
 */
export async function POST(request: NextRequest) {
  const { template: templateKey, props, to } = await request.json();

  const def = getTemplate(templateKey);
  if (!def) {
    return NextResponse.json({ error: `Unknown template: ${templateKey}` }, { status: 400 });
  }

  try {
    const renderedHtml = await render(React.createElement(def.component, props));
    const { html, attachments } = extractLocalImagesAsAttachments(renderedHtml);

    const result = await sendEmail({
      from: process.env.EMAIL_FROM || 'noreply@midwestea.com',
      to: to || DEFAULT_TEST_RECIPIENT,
      subject: `[Test] ${def.label}`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
      tags: [{ name: 'email_type', value: `test_${def.key}` }],
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
