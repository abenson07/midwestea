import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { sendClassReminderEmail } from '@/lib/email';
import { logServerError } from '@/lib/error-reporting/log-server-error';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Send the reminder this many days before the class start date. */
const REMINDER_LEAD_DAYS = 14;
/**
 * A run also covers classes that started counting down up to this many days
 * ago (i.e. 13..9 days out), so students missed by a failed or capped run are
 * picked up on the next daily run instead of never being reminded.
 */
const CATCH_UP_DAYS = 5;
/**
 * Upper bound per run. sendEmail() refuses after 100 sends per process
 * (lib/email.ts RESEND_RATE_LIMITS) and the route must finish within
 * maxDuration; anyone beyond the cap is picked up by the next daily run.
 */
const MAX_SENDS_PER_RUN = 60;
/** Pause between sends to stay under Resend's per-second rate limit. */
const SEND_DELAY_MS = 500;
const CHUNK_SIZE = 100;

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Today's calendar date in the school's timezone (class_start_date is a DATE). */
function todayInChicago(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Daily cron (see vercel.json): emails students enrolled in a class that starts
 * in REMINDER_LEAD_DAYS days. Vercel calls this with `Authorization: Bearer
 * $CRON_SECRET`.
 *
 * GET /api/cron/class-reminders?dryRun=1 lists who would be emailed without sending.
 *
 * Only enrollments made at least REMINDER_LEAD_DAYS before the start get a
 * reminder -- later registrants were just sent the enrollment confirmation.
 * Dedup is against successful 'class_reminder' rows in email_logs.
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

    const today = todayInChicago();
    const latestStart = addDays(today, REMINDER_LEAD_DAYS);
    const earliestStart = addDays(today, REMINDER_LEAD_DAYS - CATCH_UP_DAYS);

    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, class_name, class_image, class_start_date')
      .gte('class_start_date', earliestStart)
      .lte('class_start_date', latestStart);

    if (classesError) throw new Error(`Failed to query classes: ${classesError.message}`);
    if (!classes || classes.length === 0) {
      return NextResponse.json({ success: true, dryRun, window: [earliestStart, latestStart], classes: 0, due: 0, sent: 0 });
    }

    const classById = new Map(classes.map((c) => [c.id as string, c]));

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('id, student_id, class_id, enrolled_at')
      .in('class_id', Array.from(classById.keys()))
      .or('enrollment_status.is.null,enrollment_status.neq.removed');

    if (enrollmentsError) throw new Error(`Failed to query enrollments: ${enrollmentsError.message}`);

    // Enrolled at least REMINDER_LEAD_DAYS before the class start.
    const candidates = (enrollments ?? []).filter((enrollment) => {
      const startDate = classById.get(enrollment.class_id)?.class_start_date as string | null | undefined;
      if (!startDate || !enrollment.enrolled_at) return false;
      return enrollment.enrolled_at.slice(0, 10) <= addDays(startDate, -REMINDER_LEAD_DAYS);
    });

    const alreadySent = new Set<string>();
    for (const ids of chunk(candidates.map((e) => e.id as string), CHUNK_SIZE)) {
      const { data: logs, error: logsError } = await supabase
        .from('email_logs')
        .select('enrollment_id')
        .eq('email_type', 'class_reminder')
        .eq('success', true)
        .in('enrollment_id', ids);
      if (logsError) throw new Error(`Failed to query email_logs: ${logsError.message}`);
      for (const log of logs ?? []) alreadySent.add(log.enrollment_id as string);
    }

    const due = candidates.filter((e) => !alreadySent.has(e.id as string));
    const batch = due.slice(0, MAX_SENDS_PER_RUN);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun,
        window: [earliestStart, latestStart],
        classes: classes.length,
        due: due.length,
        wouldSend: batch.map((e) => ({
          enrollment_id: e.id,
          class: classById.get(e.class_id)?.class_name,
          class_start_date: classById.get(e.class_id)?.class_start_date,
        })),
      });
    }

    let sent = 0;
    const failures: Array<{ enrollment_id: string; error?: string }> = [];

    for (const enrollment of batch) {
      const classRecord = classById.get(enrollment.class_id)!;
      const result = await sendClassReminderEmail({
        studentId: enrollment.student_id,
        enrollmentId: enrollment.id,
        classId: classRecord.id as string,
        className: classRecord.class_name as string,
        classStartDate: classRecord.class_start_date as string,
        classImage: classRecord.class_image as string | null,
      });

      if (result.success) {
        sent += 1;
      } else {
        failures.push({ enrollment_id: enrollment.id, error: result.error });
      }
      await sleep(SEND_DELAY_MS);
    }

    if (failures.length > 0) {
      console.error('[cron/class-reminders] Some reminders failed to send:', failures);
    }
    console.log('[cron/class-reminders] Run complete:', { classes: classes.length, due: due.length, sent, failed: failures.length });

    return NextResponse.json({
      success: true,
      dryRun,
      window: [earliestStart, latestStart],
      classes: classes.length,
      due: due.length,
      sent,
      failed: failures.length,
      deferredToNextRun: Math.max(0, due.length - batch.length),
    });
  } catch (error: any) {
    console.error('[cron/class-reminders] Error:', error);
    void logServerError({
      message: error.message,
      stack: error.stack,
      requestUrl: '/api/cron/class-reminders',
      statusCode: 500,
      context: { route: 'cron/class-reminders' },
    });
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
