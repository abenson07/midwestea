import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * Dev-only helper for the email preview tool (app/(platform)/dev/email-preview) —
 * lists real classes so the "linked to a class" fields (hero image, course name,
 * start date, registration close date) can be populated from real data instead of
 * hand-typed placeholders.
 */
export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data: classes, error } = await supabase
    .from('classes')
    .select(
      'id, class_id, class_name, course_code, class_image, class_start_date, enrollment_close'
    )
    .order('class_start_date', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    classes: (classes || []).map((c) => ({
      id: c.id,
      label: `${c.class_id || c.course_code} — ${c.class_name}`,
      courseCode: c.course_code,
      courseName: c.class_name,
      classImage: c.class_image,
      classStartDate: c.class_start_date,
      enrollmentClose: c.enrollment_close,
    })),
  });
}
