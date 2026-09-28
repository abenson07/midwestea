-- Migration 16: Add student self update policy
-- The "Authenticated users can update own student data" policy from
-- 11_setup_rls_for_all_tables.sql was never actually applied to the live
-- database (only the SELECT and service_role policies exist there), so a
-- student's own token could never write to their own students row — the
-- PATCH /api/students/me route's update silently matched zero rows under
-- RLS instead of erroring. This re-adds the missing policy.

DROP POLICY IF EXISTS "Authenticated users can update own student data" ON students;

CREATE POLICY "Authenticated users can update own student data"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
