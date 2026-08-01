import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Copy a template's prerequisite assignments onto a newly created class.
 * Idempotent: safe to call twice for the same class.
 * Returns the number of rows snapshotted.
 */
export async function snapshotClassPrerequisites(
  supabase: SupabaseClient,
  classId: string,
  courseUuid: string
): Promise<{ count: number; error: string | null }> {
  const { data, error } = await supabase
    .from('template_prerequisites')
    .select('prerequisite_type_id, is_required, sort_order')
    .eq('course_uuid', courseUuid)
    .order('sort_order', { ascending: true });

  if (error) {
    return { count: 0, error: error.message };
  }

  if (!data || data.length === 0) {
    return { count: 0, error: null };
  }

  const rows = data.map((row: { prerequisite_type_id: string; is_required: boolean; sort_order: number }) => ({
    class_id: classId,
    prerequisite_type_id: row.prerequisite_type_id,
    is_required: row.is_required,
    sort_order: row.sort_order,
    source_course_uuid: courseUuid,
  }));

  const { error: upsertError } = await supabase
    .from('class_prerequisites')
    .upsert(rows, { onConflict: 'class_id,prerequisite_type_id', ignoreDuplicates: true });

  if (upsertError) {
    return { count: 0, error: upsertError.message };
  }

  return { count: rows.length, error: null };
}
