import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, escapeHtml } from '@/lib/email';
import { getCurrentAdmin } from '@/lib/logging';
import {
  RECOMMENDATION_COURSES,
  validateRecommendationAnswers,
  type RecommendationAnswers,
} from '@/lib/course-recommendations-data';

export const runtime = 'nodejs';

const RESULTS_RECIPIENT = 'alex@midwesternoriginals.com';

function buildEmailHtml(answers: RecommendationAnswers, respondentLabel: string): string {
  const rows = RECOMMENDATION_COURSES.map((course) => {
    const picks = answers[course.code] || [];
    const pickNames = picks
      .map((code) => RECOMMENDATION_COURSES.find((c) => c.code === code)?.name || code)
      .join(', ');
    return `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;">${escapeHtml(course.name)} (${escapeHtml(course.code)})</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${escapeHtml(pickNames)}</td></tr>`;
  }).join('');

  const jsonPretty = escapeHtml(JSON.stringify(answers, null, 2));

  return `
    <h2>Course Recommendation Quiz Results</h2>
    <p>Submitted by: ${escapeHtml(respondentLabel)}</p>
    <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
      <thead>
        <tr><th style="text-align:left;padding:6px 12px;border-bottom:2px solid #333;">Course</th><th style="text-align:left;padding:6px 12px;border-bottom:2px solid #333;">Recommended next</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Raw JSON:</p>
    <pre style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:12px;">${jsonPretty}</pre>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { createSupabaseAdminClient } = await import('@midwestea/utils');
    const supabase = createSupabaseAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const answers = body?.answers;

    if (!validateRecommendationAnswers(answers)) {
      return NextResponse.json(
        { error: 'Invalid or incomplete answers' },
        { status: 400 }
      );
    }

    const respondentLabel = user.email || admin.display_name || 'Unknown admin';

    const result = await sendEmail({
      from: process.env.EMAIL_FROM || 'noreply@midwestea.com',
      to: RESULTS_RECIPIENT,
      subject: `Course Recommendation Quiz Results - ${respondentLabel}`,
      html: buildEmailHtml(answers as RecommendationAnswers, respondentLabel),
      tags: [{ name: 'email_type', value: 'course_recommendation_quiz' }],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: `Failed to send results email: ${result.error}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[admin/recommend-courses] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit recommendations', details: error.message },
      { status: 500 }
    );
  }
}
