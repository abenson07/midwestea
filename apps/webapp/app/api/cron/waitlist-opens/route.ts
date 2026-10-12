import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { logServerError } from '@/lib/error-reporting/log-server-error';
import {
  WAITLIST_CLASS_COLUMNS,
  isEnrollmentOpen,
  notifyWaitlistForClass,
  type NotifyWaitlistResult,
  type WaitlistClass,
} from '@/lib/waitlist-notifications';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Upper bound per run. sendEmail() refuses after 100 sends per process
 * (lib/email.ts RESEND_RATE_LIMITS) and the route must finish within
 * maxDuration; anyone beyond the cap is picked up by the next daily run.
 */
const MAX_SENDS_PER_RUN = 60;

/**
 * Daily cron (see vercel.json): for every class whose enrollment is open,
 * emails that course's waitlist that registration is open. Catches classes
 * whose enrollment opens after the day they were created (class creation
 * itself notifies right away when enrollment is already open). Vercel calls
 * this with `Authorization: Bearer $CRON_SECRET`.
 *
 * GET /api/cron/waitlist-opens?dryRun=1 lists who would be emailed without sending.
 *
 * Dedup is per student per class against email_logs (see notifyWaitlistForClass).
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ success: false, error: 'CRON_SECRET is not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  try {
    const supabase = createSupabaseAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // Online classes are always open and never send students to a waitlist.
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select(WAITLIST_CLASS_COLUMNS)
      .lte('enrollment_start', today)
      .gte('enrollment_close', today)
      .or('is_online.is.null,is_online.eq.false');

    if (classesError) throw new Error(`Failed to query classes: ${classesError.message}`);

    const openClasses = ((classes ?? []) as WaitlistClass[]).filter((c) => isEnrollmentOpen(c, today));

    let remaining = MAX_SENDS_PER_RUN;
    const results: NotifyWaitlistResult[] = [];

    for (const classRecord of openClasses) {
      if (!dryRun && remaining <= 0) break;
      const result = await notifyWaitlistForClass(classRecord, { dryRun, maxSends: remaining });
      results.push(result);
      if (!dryRun) remaining -= result.sent + result.failed;
    }

    const due = results.reduce((sum, r) => sum + r.due, 0);
    const sent = results.reduce((sum, r) => sum + r.sent, 0);
    const failed = results.reduce((sum, r) => sum + r.failed, 0);

    console.log('[cron/waitlist-opens] Run complete:', { openClasses: openClasses.length, due, sent, failed });

    return NextResponse.json({
      success: true,
      dryRun,
      openClasses: openClasses.length,
      due,
      sent,
      failed,
      classes: results.filter((r) => r.due > 0),
    });
  } catch (error: any) {
    console.error('[cron/waitlist-opens] Error:', error);
    void logServerError({
      message: error.message,
      stack: error.stack,
      requestUrl: '/api/cron/waitlist-opens',
      statusCode: 500,
      context: { route: 'cron/waitlist-opens' },
    });
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
