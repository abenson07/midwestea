import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { logErrorReport } from '@/lib/error-reporting/log-to-supabase';
import { computeFingerprint } from '@/lib/error-reporting/fingerprint';
import { scrubAndTruncate } from '@/lib/error-reporting/scrub';
import { getDeploymentEnvironment } from '@/lib/error-reporting/config';
import type { BrowserInfo } from '@/lib/error-reporting/types';

export const runtime = 'nodejs';

const ISSUE_TYPES = ['bug', 'feature'] as const;
type IssueType = (typeof ISSUE_TYPES)[number];

function isIssueType(value: unknown): value is IssueType {
  return typeof value === 'string' && ISSUE_TYPES.includes(value as IssueType);
}

/**
 * POST /api/admin/report-issue
 *
 * Backs the sidebar "Report bug or request feature" modal. Writes into the
 * same error_logs table as automatic error capture (kind: bug_report |
 * feature_request) so both flow through one place for bulk triage.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Invalid session' }, { status: 401 });
    }
    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json({ success: false, error: 'Admin not found. Please ensure you are registered as an admin.' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;
    const type = payload.type;
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    const description = typeof payload.description === 'string' ? payload.description : '';
    const pageContext = payload.pageContext && typeof payload.pageContext === 'object'
      ? (payload.pageContext as Record<string, unknown>)
      : undefined;
    const browserInfo = payload.browserInfo && typeof payload.browserInfo === 'object'
      ? (payload.browserInfo as BrowserInfo)
      : undefined;

    if (!isIssueType(type)) {
      return NextResponse.json({ success: false, error: "type must be 'bug' or 'feature'" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const kind = type === 'bug' ? 'bug_report' : 'feature_request';
    const message = scrubAndTruncate(description) ?? '';
    const fingerprint = computeFingerprint({ kind: 'http', message: title, stack: message });

    await logErrorReport({
      source: 'client',
      kind,
      title,
      message,
      fingerprint,
      environment: getDeploymentEnvironment(),
      timestamp: new Date().toISOString(),
      reportedByAdminId: admin.id,
      reportedByName: admin.display_name,
      reportedByEmail: user.email,
      context: pageContext,
      browserInfo,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[admin/report-issue] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
