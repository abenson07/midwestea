/**
 * Indexes, constraints, functions, views, and RLS for tables added after
 * scripts/lib/table-extras.ts was written (migrations 17-19, 24-30, 38).
 * Sourced verbatim from supabase/migrations/. Used only by
 * scripts/generate-demo-sql.ts — the Plan 10 migration tool
 * (generate-migration-sql.ts) doesn't need these until its own TABLE_ORDER
 * is updated to include them.
 */

export function getDemoTableExtras(tableName: string): string {
  switch (tableName) {
    case 'prerequisite_types':
      return `
CREATE UNIQUE INDEX IF NOT EXISTS prerequisite_types_name_input_type_key
  ON public.prerequisite_types (lower(btrim(name)), input_type);
CREATE INDEX IF NOT EXISTS prerequisite_types_archived_at_idx ON public.prerequisite_types (archived_at);

ALTER TABLE public.prerequisite_types
  ADD CONSTRAINT prerequisite_types_expiration_rule_check CHECK (
    (expiration_rule = 'none'                AND expiration_duration_months IS NULL)
    OR (expiration_rule = 'fixed_date'          AND expiration_duration_months IS NULL)
    OR (expiration_rule = 'duration_from_issue' AND expiration_duration_months IS NOT NULL
                                                AND expiration_duration_months > 0)
  );

ALTER TABLE public.prerequisite_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage prerequisite types"
  ON public.prerequisite_types FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read prerequisite types"
  ON public.prerequisite_types FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Admins can manage prerequisite types"
  ON public.prerequisite_types FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL));

GRANT SELECT, INSERT, UPDATE ON public.prerequisite_types TO authenticated;

-- Used by student_credentials' expiry computation (migration 29).
CREATE OR REPLACE FUNCTION compute_credential_expiry(
  issued date, rule text, months integer
) RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN rule = 'duration_from_issue' AND issued IS NOT NULL AND months IS NOT NULL
      THEN (issued + (months || ' months')::interval)::date
    ELSE NULL
  END;
$$;
GRANT EXECUTE ON FUNCTION compute_credential_expiry(date, text, integer) TO authenticated, service_role;
`;

    case 'template_prerequisites':
      return `
ALTER TABLE public.template_prerequisites
  ADD CONSTRAINT template_prerequisites_course_type_key UNIQUE (course_uuid, prerequisite_type_id);

CREATE INDEX IF NOT EXISTS template_prerequisites_course_uuid_idx
  ON public.template_prerequisites (course_uuid, sort_order);

ALTER TABLE public.template_prerequisites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage template prerequisites"
  ON public.template_prerequisites FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read template prerequisites"
  ON public.template_prerequisites FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Admins can manage template prerequisites"
  ON public.template_prerequisites FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.template_prerequisites TO authenticated;
`;

    case 'class_prerequisites':
      return `
ALTER TABLE public.class_prerequisites
  ADD CONSTRAINT class_prerequisites_class_type_key UNIQUE (class_id, prerequisite_type_id);

CREATE INDEX IF NOT EXISTS class_prerequisites_class_id_idx
  ON public.class_prerequisites (class_id, sort_order);

ALTER TABLE public.class_prerequisites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage class prerequisites"
  ON public.class_prerequisites FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read class prerequisites"
  ON public.class_prerequisites FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Admins can manage class prerequisites"
  ON public.class_prerequisites FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_prerequisites TO authenticated;
`;

    case 'student_credentials':
      return `
ALTER TABLE public.student_credentials
  ADD CONSTRAINT student_credentials_value_present_check CHECK (
    value_text IS NOT NULL OR value_date IS NOT NULL
    OR value_boolean IS NOT NULL OR file_url IS NOT NULL
  );

CREATE INDEX IF NOT EXISTS student_credentials_student_type_idx
  ON public.student_credentials (student_id, prerequisite_type_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS student_credentials_review_status_idx ON public.student_credentials (review_status);
CREATE INDEX IF NOT EXISTS student_credentials_expires_at_idx ON public.student_credentials (expires_at);
CREATE INDEX IF NOT EXISTS student_credentials_submitted_for_class_idx ON public.student_credentials (submitted_for_class_id);

CREATE OR REPLACE VIEW latest_student_credentials AS
SELECT DISTINCT ON (student_id, prerequisite_type_id) *
FROM public.student_credentials
ORDER BY student_id, prerequisite_type_id, submitted_at DESC, created_at DESC;

ALTER TABLE public.student_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage student credentials"
  ON public.student_credentials FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Students can read own credentials"
  ON public.student_credentials FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage student credentials"
  ON public.student_credentials FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL));

GRANT SELECT ON public.student_credentials TO authenticated;
GRANT SELECT ON latest_student_credentials TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('student-credentials', 'student-credentials', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Service role manages credential files"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'student-credentials')
  WITH CHECK (bucket_id = 'student-credentials');
CREATE POLICY "Students read own credential files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'student-credentials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins read credential files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-credentials'
    AND EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL)
  );
`;

    case 'certificates':
      return `
CREATE INDEX IF NOT EXISTS certificates_student_id_idx ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS certificates_enrollment_id_idx ON public.certificates(enrollment_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage certificates"
  ON public.certificates FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read own certificates"
  ON public.certificates FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

GRANT SELECT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

-- Auto-provision a 'pending' certificate row for every new enrollment
-- (migration 18) -- issuance (BEN-1155/1156) flips it to 'issued'.
CREATE OR REPLACE FUNCTION create_placeholder_certificate()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO certificates (student_id, enrollment_id, status)
  VALUES (NEW.student_id, NEW.id, 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_placeholder_certificate ON enrollments;
CREATE TRIGGER trg_create_placeholder_certificate
  AFTER INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION create_placeholder_certificate();

-- Private bucket for generated certificate PDFs (migration 38).
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Service role manages certificate files"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'certificates')
  WITH CHECK (bucket_id = 'certificates');
CREATE POLICY "Students read own certificate files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins read certificate files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'certificates'
    AND EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL)
  );
`;

    default:
      return '';
  }
}
