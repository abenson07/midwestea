-- Migration: Class-owned prerequisite snapshots (BEN-853)
-- Copied from template_prerequisites at class-creation time so later template
-- edits never rewrite classes that already exist. Intentionally no backfill:
-- classes created before this migration have no snapshot.

CREATE TABLE class_prerequisites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  prerequisite_type_id uuid NOT NULL REFERENCES prerequisite_types(id),
  is_required boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  source_course_uuid uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_prerequisites_class_type_key UNIQUE (class_id, prerequisite_type_id)
);

CREATE INDEX class_prerequisites_class_id_idx
  ON class_prerequisites (class_id, sort_order);

ALTER TABLE class_prerequisites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage class prerequisites" ON class_prerequisites;
DROP POLICY IF EXISTS "Authenticated users can read class prerequisites" ON class_prerequisites;
DROP POLICY IF EXISTS "Admins can manage class prerequisites" ON class_prerequisites;

CREATE POLICY "Service role can manage class prerequisites"
  ON class_prerequisites FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Students must read their class's prerequisite list to complete it.
CREATE POLICY "Authenticated users can read class prerequisites"
  ON class_prerequisites FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage class prerequisites"
  ON class_prerequisites FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
  ));

GRANT SELECT, INSERT, UPDATE, DELETE ON class_prerequisites TO authenticated;
