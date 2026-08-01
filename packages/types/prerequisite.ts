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
