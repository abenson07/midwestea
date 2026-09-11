import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * Dev-only helper for the email preview tool — lists a class's real required
 * prerequisites (class_prerequisites joined to prerequisite_types), so the
 * Enrollment Successful preview/test-send can show real requirement names
 * instead of hand-typed placeholders. Mirrors app/api/dev/classes.
 */
export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get('classId');
  if (!classId) {
    return NextResponse.json({ error: 'classId is required' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('class_prerequisites')
    .select('is_required, sort_order, prerequisite_type:prerequisite_types(name, description)')
    .eq('class_id', classId)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    prerequisites: (data || [])
      .filter((row: any) => row.is_required)
      .map((row: any) => ({
        title: row.prerequisite_type?.name || 'Requirement',
        details: row.prerequisite_type?.description || 'Details go here',
      })),
  });
}
