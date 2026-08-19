import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * Dev-only helper for the email preview tool's "Completed Class + Suggested
 * Followups" course checklist — lists real courses (not class instances) so
 * the upsell cards can be built from real course_name/course_image/course_code
 * instead of hand-typed placeholders.
 */
export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, course_name, course_code, course_image')
    .order('course_name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    courses: (courses || []).map((c) => ({
      id: c.id,
      courseCode: c.course_code,
      courseName: c.course_name,
      courseImage: c.course_image,
    })),
  });
}
