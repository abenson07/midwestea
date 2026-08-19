import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import * as React from 'react';
import { EMAIL_TEMPLATES, getTemplate } from '../../../../emails/dev-preview-registry';

/** GET: list templates + each one's field schema and default (PreviewProps) values. */
export async function GET() {
  const templates = EMAIL_TEMPLATES.map((t) => ({
    key: t.key,
    label: t.label,
    hasClassPicker: t.hasClassPicker,
    fields: t.fields,
    defaultProps: (t.component as any).PreviewProps || {},
  }));

  return NextResponse.json({ templates });
}

/** POST { template, props } -> { html } — renders the requested email with the given props. */
export async function POST(request: NextRequest) {
  const { template, props } = await request.json();

  const def = getTemplate(template);
  if (!def) {
    return NextResponse.json({ error: `Unknown template: ${template}` }, { status: 400 });
  }

  try {
    const html = await render(React.createElement(def.component, props));
    return NextResponse.json({ html });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
