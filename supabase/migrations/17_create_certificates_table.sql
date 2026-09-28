-- Migration 17: Create certificates table for student certificate history
-- Certificates start as 'pending' placeholders (BEN-848 wires up automatic
-- creation on enrollment) and move to 'issued' once a file is attached.
-- expires_at is set explicitly at issuance time; it is not derived from
-- classes.certification_length (that column's unit is undocumented).

CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id),
  enrollment_id uuid NOT NULL REFERENCES enrollments(id),
  status text NOT NULL DEFAULT 'pending', -- 'pending' | 'issued'
  issued_at timestamptz,
  expires_at timestamptz,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX certificates_student_id_idx ON certificates(student_id);
CREATE INDEX certificates_enrollment_id_idx ON certificates(enrollment_id);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage certificates" ON certificates;
DROP POLICY IF EXISTS "Authenticated users can read own certificates" ON certificates;

CREATE POLICY "Service role can manage certificates"
  ON certificates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read own certificates"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);
