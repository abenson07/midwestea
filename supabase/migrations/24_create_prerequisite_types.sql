-- Migration 24: Global prerequisite type catalog (BEN-854)
-- Reusable prerequisite definitions that programs, course templates, classes,
-- and student credential records all key off of. Additional detail columns
-- (description, required_by_default, expiration rules) are added in BEN-870.

CREATE TABLE prerequisite_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  input_type text NOT NULL CHECK (input_type IN ('file_upload', 'date', 'text', 'checkbox')),
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Normalized uniqueness: same name (case/whitespace-insensitive) may not repeat
-- for the same input type. Different input types may share a name.
CREATE UNIQUE INDEX prerequisite_types_name_input_type_key
  ON prerequisite_types (lower(btrim(name)), input_type);

CREATE INDEX prerequisite_types_archived_at_idx ON prerequisite_types (archived_at);

ALTER TABLE prerequisite_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage prerequisite types"
  ON prerequisite_types FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Students need read access so their own prerequisite steps can show the
-- type name and input shape.
CREATE POLICY "Authenticated users can read prerequisite types"
  ON prerequisite_types FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage prerequisite types"
  ON prerequisite_types FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
  ));

GRANT SELECT, INSERT, UPDATE ON prerequisite_types TO authenticated;
