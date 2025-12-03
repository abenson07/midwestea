// Enrollment type definitions

export type Enrollment = {
  id: string; // UUID
  student_id: string; // UUID, references students.id
  class_id: string; // UUID, references classes.id
  enrollment_status: string | null; // default: 'registered'
  onboarding_complete: boolean | null; // default: false
  enrolled_at: string | null; // timestamp with time zone
  updated_at: string | null; // timestamp with time zone
};





