import type { SupabaseClient } from '@supabase/supabase-js';
import type { PrerequisiteEvaluation, StudentCredential } from '@midwestea/types';
import { evaluateClassPrerequisites } from './prerequisite-evaluation';

export interface PendingReviewRow {
  credential_id: string;
  student_id: string;
  student_name: string;
  class_id: string | null; // classes.id UUID
  class_name: string | null;
  prerequisite_type_id: string;
  prerequisite_type_name: string;
  submitted_at: string | null;
}

/**
 * All credentials awaiting review, newest first.
 *
 * Reads from student_credentials directly (not the evaluator) because the
 * queue is inherently cross-student and cross-class.
 */
export async function getPendingReviewQueue(
  supabase: SupabaseClient
): Promise<{ rows: PendingReviewRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('student_credentials')
    .select(
      `
      id,
      student_id,
      submitted_for_class_id,
      prerequisite_type_id,
      submitted_at,
      prerequisite_type:prerequisite_types(name),
      class:classes(id, class_name)
      `
    )
    .eq('review_status', 'pending')
    .order('submitted_at', { ascending: false });

  if (error) {
    return { rows: [], error: error.message };
  }

  const rowsRaw = (data || []) as any[];

  const studentIds = Array.from(new Set(rowsRaw.map((r) => r.student_id)));
  const studentNameById = new Map<string, string>();

  if (studentIds.length > 0) {
    const { data: students } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .in('id', studentIds);

    for (const s of (students || []) as { id: string; first_name: string | null; last_name: string | null }[]) {
      const name = `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim();
      studentNameById.set(s.id, name);
    }
  }

  // Resolve email fallback only for students missing both name parts.
  await Promise.all(
    studentIds
      .filter((id) => !studentNameById.get(id))
      .map(async (id) => {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(id);
          if (userData?.user?.email) {
            studentNameById.set(id, userData.user.email);
          }
        } catch {
          // Non-fatal: leave the name unresolved for this row.
        }
      })
  );

  const rows: PendingReviewRow[] = rowsRaw.map((r) => ({
    credential_id: r.id,
    student_id: r.student_id,
    student_name: studentNameById.get(r.student_id) || 'Unknown student',
    class_id: r.class?.id ?? null,
    class_name: r.class?.class_name ?? null,
    prerequisite_type_id: r.prerequisite_type_id,
    prerequisite_type_name: r.prerequisite_type?.name ?? 'Unknown prerequisite',
    submitted_at: r.submitted_at,
  }));

  return { rows, error: null };
}

/**
 * Every submission for one student + prerequisite type, newest first,
 * including superseded rows. Used to render "Show earlier submissions".
 */
export async function getCredentialHistory(
  supabase: SupabaseClient,
  studentId: string,
  prerequisiteTypeId: string
): Promise<{ credentials: StudentCredential[]; error: string | null }> {
  const { data, error } = await supabase
    .from('student_credentials')
    .select('*')
    .eq('student_id', studentId)
    .eq('prerequisite_type_id', prerequisiteTypeId)
    .order('submitted_at', { ascending: false });

  if (error) {
    return { credentials: [], error: error.message };
  }

  return { credentials: (data || []) as StudentCredential[], error: null };
}

export interface ReviewDecisionInput {
  credentialId: string;
  decision: 'approved' | 'rejected';
  rejectionReason?: string | null;
  reviewerAdminId: string;
}

/**
 * Approve or reject a submitted credential.
 *
 * Only `pending` credentials are normally reviewable; staff may also
 * correct an already-decided (`approved`/`rejected`) row to the other
 * outcome. A `superseded` row can never be reviewed. Approval always
 * clears `rejection_reason` to null. Rejection requires a non-empty
 * reason and populates `rejectionContext` for BEN-866 to consume -- this
 * function never sends email itself.
 */
export async function reviewCredential(
  supabase: SupabaseClient,
  input: ReviewDecisionInput
): Promise<{
  success: boolean;
  credential?: StudentCredential;
  rejectionContext?: {
    studentId: string;
    prerequisiteTypeId: string;
    prerequisiteTypeName: string;
    classId: string | null;
    rejectionReason: string;
  };
  error?: string;
  status?: number;
}> {
  const { data: existing, error: loadError } = await supabase
    .from('student_credentials')
    .select('*, prerequisite_type:prerequisite_types(name)')
    .eq('id', input.credentialId)
    .single();

  if (loadError || !existing) {
    return { success: false, error: 'Credential not found.', status: 404 };
  }

  if (existing.review_status === 'superseded') {
    return { success: false, error: 'This submission was replaced by a newer one.', status: 409 };
  }

  const trimmedReason = input.rejectionReason?.trim() ?? '';

  if (input.decision === 'rejected' && trimmedReason === '') {
    return { success: false, error: 'A rejection reason is required.', status: 400 };
  }

  const { data: updated, error: updateError } = await supabase
    .from('student_credentials')
    .update({
      review_status: input.decision,
      reviewed_by: input.reviewerAdminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: input.decision === 'rejected' ? trimmedReason : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.credentialId)
    .select()
    .single();

  if (updateError || !updated) {
    return { success: false, error: updateError?.message || 'Failed to update credential.', status: 500 };
  }

  const credential = updated as StudentCredential;

  if (input.decision === 'rejected') {
    return {
      success: true,
      credential,
      rejectionContext: {
        studentId: existing.student_id,
        prerequisiteTypeId: existing.prerequisite_type_id,
        prerequisiteTypeName: existing.prerequisite_type?.name ?? 'this prerequisite',
        classId: existing.submitted_for_class_id ?? null,
        rejectionReason: trimmedReason,
      },
    };
  }

  return { success: true, credential };
}

// ============================================================================
// Class prerequisite matrix (BEN-869)
// ============================================================================

export interface ClassMatrixStudentRow {
  student_id: string;
  student_name: string;
  student_email: string | null;
  evaluation: PrerequisiteEvaluation;
}

export interface ClassMatrixPayload {
  class_id: string;
  class_name: string | null;
  class_start_date: string | null;
  /** Column definitions, in class_prerequisites.sort_order. */
  columns: Array<{
    prerequisite_type_id: string;
    name: string;
    is_required: boolean;
  }>;
  rows: ClassMatrixStudentRow[];
  summary: {
    fully_approved: number;
    awaiting_review: number;
    outstanding: number;
  };
}

/**
 * Class-wide roster view of prerequisite state -- one row per enrolled
 * student, one column per class prerequisite. Runs one evaluation per
 * student via Promise.all so the client issues a single request.
 */
export async function getClassPrerequisiteMatrix(
  supabase: SupabaseClient,
  classId: string
): Promise<{ payload: ClassMatrixPayload | null; error: string | null }> {
  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('id, class_name, class_start_date')
    .eq('id', classId)
    .maybeSingle();

  if (classError) {
    return { payload: null, error: classError.message };
  }

  if (!classRow) {
    return { payload: null, error: 'Class not found.' };
  }

  const { data: classPrereqs, error: classPrereqsError } = await supabase
    .from('class_prerequisites')
    .select('prerequisite_type_id, is_required, sort_order, prerequisite_type:prerequisite_types(name)')
    .eq('class_id', classId)
    .order('sort_order', { ascending: true });

  if (classPrereqsError) {
    return { payload: null, error: classPrereqsError.message };
  }

  const columns = ((classPrereqs || []) as any[]).map((row) => ({
    prerequisite_type_id: row.prerequisite_type_id,
    name: row.prerequisite_type?.name ?? 'Unknown prerequisite',
    is_required: row.is_required,
  }));

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('student_id, students(first_name, last_name)')
    .eq('class_id', classId)
    .neq('enrollment_status', 'removed');

  if (enrollmentsError) {
    return { payload: null, error: enrollmentsError.message };
  }

  const enrollmentRows = (enrollments || []) as any[];

  const studentNameById = new Map<string, string>();
  for (const row of enrollmentRows) {
    const name = `${row.students?.first_name ?? ''} ${row.students?.last_name ?? ''}`.trim();
    if (name) {
      studentNameById.set(row.student_id, name);
    }
  }

  // Resolve email fallback only for students missing both name parts.
  const emailById = new Map<string, string | null>();
  await Promise.all(
    enrollmentRows
      .filter((row) => !studentNameById.get(row.student_id))
      .map(async (row) => {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(row.student_id);
          if (userData?.user?.email) {
            emailById.set(row.student_id, userData.user.email);
          }
        } catch {
          // Non-fatal: leave the name unresolved for this row.
        }
      })
  );

  const rows: ClassMatrixStudentRow[] = await Promise.all(
    enrollmentRows.map(async (row): Promise<ClassMatrixStudentRow> => {
      const { evaluation } = await evaluateClassPrerequisites(supabase, row.student_id, classId);
      return {
        student_id: row.student_id,
        student_name: studentNameById.get(row.student_id) || emailById.get(row.student_id) || 'Unknown student',
        student_email: emailById.get(row.student_id) ?? null,
        evaluation: evaluation ?? { class_id: classId, student_id: row.student_id, items: [], outstanding: [], allRequiredSatisfied: true },
      };
    })
  );

  let fully_approved = 0;
  let awaiting_review = 0;
  let outstanding = 0;
  for (const row of rows) {
    if (row.evaluation.allRequiredSatisfied) {
      fully_approved += 1;
    } else if (row.evaluation.outstanding.length === 0) {
      awaiting_review += 1;
    } else {
      outstanding += 1;
    }
  }

  return {
    payload: {
      class_id: classId,
      class_name: classRow.class_name ?? null,
      class_start_date: classRow.class_start_date ?? null,
      columns,
      rows,
      summary: { fully_approved, awaiting_review, outstanding },
    },
    error: null,
  };
}
