-- Migration 26: Prerequisite assignment on program and course templates (BEN-851)
-- `courses` holds both programs (program_type = 'program') and course templates
-- (program_type = 'course' or NULL), so one table serves both surfaces.

CREATE TABLE template_prerequisites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_uuid uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_type_id uuid NOT NULL REFERENCES prerequisite_types(id),
  is_required boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT template_prerequisites_course_type_key UNIQUE (course_uuid, prerequisite_type_id)
);

CREATE INDEX template_prerequisites_course_uuid_idx
  ON template_prerequisites (course_uuid, sort_order);

ALTER TABLE template_prerequisites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage template prerequisites"
  ON template_prerequisites FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read template prerequisites"
  ON template_prerequisites FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage template prerequisites"
  ON template_prerequisites FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
  ));

GRANT SELECT, INSERT, UPDATE, DELETE ON template_prerequisites TO authenticated;
