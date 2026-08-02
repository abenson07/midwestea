import type { SupabaseClient } from '@supabase/supabase-js';
import type { EvaluatedPrerequisite } from '@midwestea/types';
import { evaluateClassPrerequisites } from './prerequisite-evaluation';

export type ClassAccessReason =
  | 'granted'
  | 'not_enrolled'
  | 'prerequisites_incomplete'
  | 'no_materials';

export interface ClassAccessResult {
  granted: boolean;
  reason: ClassAccessReason;
  /** Required items still blocking access. Empty unless reason is 'prerequisites_incomplete'. */
  blockingItems: EvaluatedPrerequisite[];
  /** The materials URL. Non-null ONLY when granted is true. */
  materialsUrl: string | null;
}

/**
 * Single source of truth for class-material access.
 * Decides on enrollment and prerequisite approval only -- no other state.
 */
export async function assertClassMaterialAccess(
  supabase: SupabaseClient,
  studentId: string,
  classId: string
): Promise<{ access: ClassAccessResult | null; error: string | null }> {
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id, enrollment_status')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .maybeSingle();

  if (enrollmentError) {
    return { access: null, error: enrollmentError.message };
  }

  if (!enrollment || enrollment.enrollment_status === 'removed') {
    return {
      access: { granted: false, reason: 'not_enrolled', blockingItems: [], materialsUrl: null },
      error: null,
    };
  }

  const { evaluation, error: evaluationError } = await evaluateClassPrerequisites(supabase, studentId, classId);

  if (evaluationError) {
    return { access: null, error: evaluationError };
  }

  if (!evaluation || !evaluation.allRequiredSatisfied) {
    const blockingItems = (evaluation?.items ?? []).filter(
      (item) => item.is_required && item.status !== 'satisfied'
    );
    return {
      access: { granted: false, reason: 'prerequisites_incomplete', blockingItems, materialsUrl: null },
      error: null,
    };
  }

  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('wf_class_link')
    .eq('id', classId)
    .maybeSingle();

  if (classError) {
    return { access: null, error: classError.message };
  }

  if (!classRow || !classRow.wf_class_link) {
    return {
      access: { granted: false, reason: 'no_materials', blockingItems: [], materialsUrl: null },
      error: null,
    };
  }

  return {
    access: { granted: true, reason: 'granted', blockingItems: [], materialsUrl: classRow.wf_class_link },
    error: null,
  };
}
