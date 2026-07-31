import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import * as React from 'react';
import { getTemplate } from '../../../../emails/dev-preview-registry';
import { sendEmail } from '../../../../lib/email';

const DEFAULT_TEST_RECIPIENT = 'alex@midwesternoriginals.com';

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
    const html = await render(React.createElement(def.component, props));

    const result = await sendEmail({
      from: process.env.EMAIL_FROM || 'noreply@midwestea.com',
      to: to || DEFAULT_TEST_RECIPIENT,
      subject: `[Test] ${def.label}`,
      html,
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
