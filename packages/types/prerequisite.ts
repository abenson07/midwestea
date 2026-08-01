// Prerequisite type definitions

export type PrerequisiteInputType = 'file_upload' | 'date' | 'text' | 'checkbox';

export const PREREQUISITE_INPUT_TYPES: PrerequisiteInputType[] = [
  'file_upload',
  'date',
  'text',
  'checkbox',
];

export const PREREQUISITE_INPUT_TYPE_LABELS: Record<PrerequisiteInputType, string> = {
  file_upload: 'File upload',
  date: 'Date',
  text: 'Text',
  checkbox: 'Checkbox',
};

export type PrerequisiteExpirationRule = 'none' | 'fixed_date' | 'duration_from_issue';

export const PREREQUISITE_EXPIRATION_RULES: PrerequisiteExpirationRule[] = [
  'none',
  'fixed_date',
  'duration_from_issue',
];

export const PREREQUISITE_EXPIRATION_RULE_LABELS: Record<PrerequisiteExpirationRule, string> = {
  none: 'Never expires',
  fixed_date: 'Expiration date provided by student',
  duration_from_issue: 'Expires a set number of months after the issue date',
};

export type PrerequisiteType = {
  id: string; // UUID
  name: string;
  input_type: PrerequisiteInputType;
  description: string | null;
  required_by_default: boolean;
  expiration_rule: PrerequisiteExpirationRule;
  expiration_duration_months: number | null;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TemplatePrerequisite = {
  id: string; // UUID
  course_uuid: string; // UUID -> courses.id (a program OR a course template)
  prerequisite_type_id: string; // UUID -> prerequisite_types.id
  is_required: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
};

// Assignment joined to its catalog type, as read by the admin UI.
export type TemplatePrerequisiteWithType = TemplatePrerequisite & {
  prerequisite_type: PrerequisiteType;
};

export type ClassPrerequisite = {
  id: string; // UUID
  class_id: string; // UUID -> classes.id
  prerequisite_type_id: string; // UUID -> prerequisite_types.id
  is_required: boolean;
  sort_order: number;
  source_course_uuid: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ClassPrerequisiteWithType = ClassPrerequisite & {
  prerequisite_type: PrerequisiteType;
};

export type CredentialReviewStatus = 'pending' | 'approved' | 'rejected' | 'superseded';

export const CREDENTIAL_REVIEW_STATUS_LABELS: Record<CredentialReviewStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  superseded: 'Replaced',
};

export type StudentCredential = {
  id: string; // UUID
  student_id: string; // UUID -> students.id
  prerequisite_type_id: string; // UUID -> prerequisite_types.id
  submitted_for_class_id: string | null; // UUID -> classes.id
  value_text: string | null;
  value_date: string | null; // date
  value_boolean: boolean | null;
  file_url: string | null; // storage object path, NOT a URL
  review_status: CredentialReviewStatus;
  reviewed_by: string | null; // UUID -> admins.id
  reviewed_at: string | null;
  rejection_reason: string | null;
  issued_at: string | null; // date, written by BEN-871
  expires_at: string | null; // date, written by BEN-871
  submitted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type StudentCredentialWithType = StudentCredential & {
  prerequisite_type: PrerequisiteType;
};

export type PrerequisiteStatus =
  | 'satisfied'
  | 'expired'
  | 'pending_review'
  | 'rejected'
  | 'missing'
  | 'not_required';

export const PREREQUISITE_STATUS_LABELS: Record<PrerequisiteStatus, string> = {
  satisfied: 'Approved',
  expired: 'Expired',
  pending_review: 'Pending review',
  rejected: 'Needs resubmission',
  missing: 'Not started',
  not_required: 'Optional',
};

export type EvaluatedPrerequisite = {
  class_prerequisite_id: string;
  prerequisite_type_id: string;
  prerequisite_type: PrerequisiteType;
  is_required: boolean;
  sort_order: number;
  status: PrerequisiteStatus;
  /** The latest credential for this type, or null when none exists. */
  credential: StudentCredential | null;
};

export type PrerequisiteEvaluation = {
  class_id: string;
  student_id: string;
  items: EvaluatedPrerequisite[]; // every class prerequisite, sort_order ASC
  outstanding: EvaluatedPrerequisite[]; // required AND missing/rejected/expired
  allRequiredSatisfied: boolean;
};
