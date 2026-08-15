-- Migration 28: Student-owned credential records (BEN-893)
-- Keyed by (student_id, prerequisite_type_id) so one approved credential can
-- satisfy any class that requires that prerequisite type. History is preserved
-- by inserting a new row per submission and marking the prior row 'superseded',
-- so there is deliberately NO unique constraint on that pair.

CREATE TABLE student_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  prerequisite_type_id uuid NOT NULL REFERENCES prerequisite_types(id),

  -- The class the student was working through when they submitted. Context
  -- for staff review only; it does NOT scope who the credential satisfies.
  submitted_for_class_id uuid REFERENCES classes(id) ON DELETE SET NULL,

  -- Typed values. Exactly one is populated, matching the prerequisite type's
  -- input_type. The type lives on another table, so the column-to-input_type
  -- match is enforced in application code, not here.
  value_text text,
  value_date date,
  value_boolean boolean,
  file_url text, -- Storage OBJECT PATH in the 'student-credentials' bucket.

  review_status text NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected', 'superseded')),
  reviewed_by uuid REFERENCES admins(id),
  reviewed_at timestamptz,
  rejection_reason text,

  -- Written by BEN-871. Left NULL by this migration's callers.
  issued_at date,
  expires_at date,

  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT student_credentials_value_present_check CHECK (
    value_text IS NOT NULL
    OR value_date IS NOT NULL
    OR value_boolean IS NOT NULL
    OR file_url IS NOT NULL
  )
);

CREATE INDEX student_credentials_student_type_idx
  ON student_credentials (student_id, prerequisite_type_id, submitted_at DESC);
CREATE INDEX student_credentials_review_status_idx
  ON student_credentials (review_status);
CREATE INDEX student_credentials_expires_at_idx
  ON student_credentials (expires_at);
CREATE INDEX student_credentials_submitted_for_class_idx
  ON student_credentials (submitted_for_class_id);

-- Single shared definition of "the student's current credential for a type".
-- Every consumer must read through this view rather than re-deriving it.
CREATE VIEW latest_student_credentials AS
SELECT DISTINCT ON (student_id, prerequisite_type_id) *
FROM student_credentials
ORDER BY student_id, prerequisite_type_id, submitted_at DESC, created_at DESC;

ALTER TABLE student_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage student credentials"
  ON student_credentials FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Students read their own records only. All writes go through the
-- service-role API route, so no student INSERT/UPDATE policy is granted.
CREATE POLICY "Students can read own credentials"
  ON student_credentials FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage student credentials"
  ON student_credentials FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
  ));

GRANT SELECT ON student_credentials TO authenticated;
GRANT SELECT ON latest_student_credentials TO authenticated;

-- Private bucket for uploaded credential files. Access is via short-lived
-- signed URLs minted server-side; never public URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-credentials', 'student-credentials', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Service role manages credential files"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'student-credentials')
  WITH CHECK (bucket_id = 'student-credentials');

-- Object paths start with the student's uuid: <student_id>/<type_id>/<file>
CREATE POLICY "Students read own credential files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-credentials'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins read credential files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-credentials'
    AND EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
    )
  );
