-- Migration 38: Enrollment outcome + certificates storage bucket (BEN-1155/1156)
-- Adds the "Graduated/Failed/Dropped" outcome to enrollments, written by the new
-- certificate-generation flow (sets 'Graduated'; 'Failed'/'Dropped' are reserved
-- for future manual use, nothing writes them yet). Also creates the private
-- storage bucket the generated certificate PDFs are uploaded to — mirrors the
-- student-credentials bucket pattern (migration 28): file_url on `certificates`
-- stores an object path, not a public URL; reads go through short-lived signed
-- URLs minted server-side.

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS outcome text
  CHECK (outcome IS NULL OR outcome IN ('Graduated', 'Failed', 'Dropped'));

INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Service role manages certificate files"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'certificates')
  WITH CHECK (bucket_id = 'certificates');

-- Object paths start with the student's uuid: <student_id>/<certificate_id>.pdf
CREATE POLICY "Students read own certificate files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'certificates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins read certificate files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'certificates'
    AND EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
    )
  );
