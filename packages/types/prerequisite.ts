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

export type PrerequisiteType = {
  id: string; // UUID
  name: string;
  input_type: PrerequisiteInputType;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};
