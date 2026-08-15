import type { SupabaseClient } from '@supabase/supabase-js';
import type { StudentCredential } from '@midwestea/types';

export interface SubmitCredentialInput {
  studentId: string;
  prerequisiteTypeId: string;
  submittedForClassId?: string | null;
  valueText?: string | null;
  valueDate?: string | null; // 'YYYY-MM-DD'
  valueBoolean?: boolean | null;
  fileUrl?: string | null; // storage object path
  issuedAt?: string | null; // 'YYYY-MM-DD'
  expiresAt?: string | null; // 'YYYY-MM-DD'
}

/**
 * Submit a new credential for a student against a prerequisite type.
 * Validates the supplied value against the type's input_type, supersedes any
 * prior rows for the same (student_id, prerequisite_type_id), and inserts a
 * new 'pending' row. History is never overwritten.
 */
export async function submitStudentCredential(
  supabase: SupabaseClient,
  input: SubmitCredentialInput
): Promise<{ success: boolean; credential?: StudentCredential; error?: string }> {
  const { data: type, error: typeError } = await supabase
    .from('prerequisite_types')
    .select('input_type, expiration_rule, expiration_duration_months')
    .eq('id', input.prerequisiteTypeId)
    .single();

  if (typeError || !type) {
    return { success: false, error: 'Prerequisite type not found.' };
  }

  const row: {
    value_text: string | null;
    value_date: string | null;
    value_boolean: boolean | null;
    file_url: string | null;
  } = {
    value_text: null,
    value_date: null,
    value_boolean: null,
    file_url: null,
  };

  switch (type.input_type) {
    case 'text':
      if (!input.valueText || input.valueText.trim() === '') {
        return { success: false, error: 'A text value is required.' };
      }
      row.value_text = input.valueText;
      break;
    case 'date':
      if (!input.valueDate) {
        return { success: false, error: 'A date is required.' };
      }
      row.value_date = input.valueDate;
      break;
    case 'checkbox':
      if (input.valueBoolean !== true) {
        return { success: false, error: 'This must be checked to continue.' };
      }
      row.value_boolean = true;
      break;
    case 'file_upload':
      if (!input.fileUrl || input.fileUrl.trim() === '') {
        return { success: false, error: 'A file is required.' };
      }
      row.file_url = input.fileUrl;
      break;
    default:
      return { success: false, error: 'Prerequisite type not found.' };
  }

  // Resolve issued_at / expires_at per the type's expiration_rule. Computed
  // once here, at write time, and stored -- never recomputed on read.
  const resolvedIssuedAt = input.issuedAt ?? null;
  let resolvedExpiresAt: string | null = null;

  if (type.expiration_rule === 'none') {
    resolvedExpiresAt = null;
  } else if (type.expiration_rule === 'fixed_date') {
    if (input.expiresAt) {
      resolvedExpiresAt = input.expiresAt;
    } else if (type.input_type === 'date') {
      resolvedExpiresAt = input.valueDate ?? null;
    } else {
      resolvedExpiresAt = null;
    }
  } else if (type.expiration_rule === 'duration_from_issue') {
    if (!input.issuedAt) {
      return { success: false, error: 'An issue date is required for this prerequisite.' };
    }

    const { data: computed, error: rpcError } = await supabase.rpc('compute_credential_expiry', {
      issued: input.issuedAt,
      rule: type.expiration_rule,
      months: type.expiration_duration_months,
    });

    if (rpcError) {
      return { success: false, error: 'Could not compute the expiration date.' };
    }

    resolvedExpiresAt = computed as string;
  }

  // Supersede prior rows for this (student, type) BEFORE inserting, so the
  // new row is unambiguously the latest.
  const { error: supersedeError } = await supabase
    .from('student_credentials')
    .update({ review_status: 'superseded', updated_at: new Date().toISOString() })
    .eq('student_id', input.studentId)
    .eq('prerequisite_type_id', input.prerequisiteTypeId)
    .in('review_status', ['pending', 'approved', 'rejected']);

  if (supersedeError) {
    return { success: false, error: supersedeError.message };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('student_credentials')
    .insert({
      student_id: input.studentId,
      prerequisite_type_id: input.prerequisiteTypeId,
      submitted_for_class_id: input.submittedForClassId ?? null,
      ...row,
      review_status: 'pending',
      issued_at: resolvedIssuedAt,
      expires_at: resolvedExpiresAt,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError || !inserted) {
    return { success: false, error: insertError?.message || 'Failed to submit credential.' };
  }

  return { success: true, credential: inserted as StudentCredential };
}

/** Mints a 300-second signed URL for a credential's stored file. */
export async function getCredentialFileSignedUrl(
  supabase: SupabaseClient,
  objectPath: string
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.storage
    .from('student-credentials')
    .createSignedUrl(objectPath, 300);

  if (error || !data) {
    return { url: null, error: error?.message || 'Failed to create signed URL.' };
  }

  return { url: data.signedUrl, error: null };
}
