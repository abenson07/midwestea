// Certificate type definitions

export type Certificate = {
  id: string; // UUID
  student_id: string; // UUID, references students.id
  enrollment_id: string; // UUID, references enrollments.id
  status: string; // 'pending' | 'issued', default: 'pending'
  issued_at: string | null; // timestamp with time zone
  expires_at: string | null; // timestamp with time zone
  file_url: string | null;
  created_at: string | null; // timestamp with time zone
  updated_at: string | null; // timestamp with time zone
};
