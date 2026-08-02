import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ClassPrerequisiteWithType,
  EvaluatedPrerequisite,
  PrerequisiteEvaluation,
  PrerequisiteStatus,
  StudentCredential,
} from '@midwestea/types';

// Prerequisite state and payment state are independent by design.
// This module must never read transactions, invoices, or balances --
// enforced by scripts/verify-prerequisite-payment-separation.ts (BEN-858).

/**
 * True when `expiresAt` (a 'YYYY-MM-DD' date string) is strictly before `asOf`.
 * A null expiry never expires. Compared date-only in UTC to avoid the
 * off-by-one that local-timezone parsing of bare dates causes.
 */
export function isExpired(expiresAt: string | null, asOf: Date = new Date()): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiryMs = Date.parse(`${expiresAt}T00:00:00Z`);
  const asOfMidnightMs = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());

  return expiryMs < asOfMidnightMs;
}

function computeStatus(
  isRequired: boolean,
  credential: StudentCredential | null,
  classStartDate: string | null
): PrerequisiteStatus {
  let status: PrerequisiteStatus;

  if (!credential) {
    status = 'missing';
  } else if (credential.review_status === 'pending') {
    status = 'pending_review';
  } else if (credential.review_status === 'rejected') {
    status = 'rejected';
  } else if (credential.review_status === 'approved' && isExpired(credential.expires_at)) {
    status = 'expired';
  } else if (
    credential.review_status === 'approved' &&
    classStartDate !== null &&
    credential.expires_at !== null &&
    isExpired(credential.expires_at, new Date(`${classStartDate}T00:00:00Z`))
  ) {
    status = 'expiring_before_class';
  } else {
    status = 'satisfied';
  }

  if (!isRequired && (status === 'missing' || status === 'rejected' || status === 'expiring_before_class')) {
    status = 'not_required';
  }

  return status;
}

/**
 * Evaluate a class's prerequisite snapshot against a student's approved and
 * unexpired credentials. Returns one item per class_prerequisites row,
 * including satisfied ones -- callers that want only unmet work read
 * `outstanding`.
 */
export async function evaluateClassPrerequisites(
  supabase: SupabaseClient,
  studentId: string,
  classId: string
): Promise<{ evaluation: PrerequisiteEvaluation | null; error: string | null }> {
  const { data: classPrereqs, error: classPrereqsError } = await supabase
    .from('class_prerequisites')
    .select('*, prerequisite_type:prerequisite_types(*)')
    .eq('class_id', classId)
    .order('sort_order', { ascending: true });

  if (classPrereqsError) {
    return { evaluation: null, error: classPrereqsError.message };
  }

  // A failed lookup or a NULL value means "no class-timing comparison"; this
  // must never error the evaluation.
  const { data: classRow } = await supabase
    .from('classes')
    .select('class_start_date')
    .eq('id', classId)
    .single();
  const classStartDate: string | null = classRow?.class_start_date ?? null;

  if (!classPrereqs || classPrereqs.length === 0) {
    return {
      evaluation: {
        class_id: classId,
        student_id: studentId,
        items: [],
        outstanding: [],
        allRequiredSatisfied: true,
      },
      error: null,
    };
  }

  const rows = classPrereqs as ClassPrerequisiteWithType[];
  const prerequisiteTypeIds = Array.from(new Set(rows.map((row) => row.prerequisite_type_id)));

  const { data: credentials, error: credentialsError } = await supabase
    .from('latest_student_credentials')
    .select('*')
    .eq('student_id', studentId)
    .in('prerequisite_type_id', prerequisiteTypeIds);

  if (credentialsError) {
    return { evaluation: null, error: credentialsError.message };
  }

  const credentialByType = new Map<string, StudentCredential>();
  for (const credential of (credentials || []) as StudentCredential[]) {
    credentialByType.set(credential.prerequisite_type_id, credential);
  }

  const items: EvaluatedPrerequisite[] = rows.map((row) => {
    const credential = credentialByType.get(row.prerequisite_type_id) || null;
    const status = computeStatus(row.is_required, credential, classStartDate);

    return {
      class_prerequisite_id: row.id,
      prerequisite_type_id: row.prerequisite_type_id,
      prerequisite_type: row.prerequisite_type,
      is_required: row.is_required,
      sort_order: row.sort_order,
      status,
      credential,
      expires_at: credential?.expires_at ?? null,
    };
  });

  const outstanding = items.filter(
    (item) =>
      item.is_required &&
      (item.status === 'missing' ||
        item.status === 'rejected' ||
        item.status === 'expired' ||
        item.status === 'expiring_before_class')
  );

  const allRequiredSatisfied = items
    .filter((item) => item.is_required)
    .every((item) => item.status === 'satisfied');

  return {
    evaluation: {
      class_id: classId,
      student_id: studentId,
      items,
      outstanding,
      allRequiredSatisfied,
    },
    error: null,
  };
}

/** Days until `expiresAt`, or null when it never expires. Negative when already past. */
export function daysUntilExpiry(expiresAt: string | null, asOf: Date = new Date()): number | null {
  if (!expiresAt) {
    return null;
  }

  const expiryMs = Date.parse(`${expiresAt}T00:00:00Z`);
  const asOfMidnightMs = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());

  return Math.round((expiryMs - asOfMidnightMs) / (24 * 60 * 60 * 1000));
}
