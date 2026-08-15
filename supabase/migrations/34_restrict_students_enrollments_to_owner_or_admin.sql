-- Migration 34: Restrict students/enrollments SELECT to row owner or admin
--
-- Live production had diverged from what migration 11 defines: the SELECT
-- policies on `students` and `enrollments` had been replaced at some point
-- with "Authenticated users read students" / "Authenticated users read
-- enrollments", both USING (true) - granting any authenticated user (any
-- student) read access to every student's name/email and every enrollment
-- record, not just their own. This was never captured in a migration, so
-- nothing in the repo's history shows how or when it happened.
--
-- Discovered while investigating the AdminShell auth gap (see migration 33
-- and the fix/admin-auth-gap branch): a student session was able to see
-- other students' names/emails on an admin class roster, which shouldn't
-- have been possible even accounting for that bug, given migration 11's
-- SELECT policies. Checking pg_policies directly against production
-- confirmed the drift described above.
--
-- This was applied directly to production via the SQL editor ahead of this
-- migration/PR, since it was a live, actively-exploitable data exposure
-- (readable from any page via the browser console, not just admin routes -
-- no admin UI involved at all). This file exists so the fix is tracked and
-- reproducible for other environments, not because it's still pending.
--
-- Not a plain revert to migration 11's original owner-only predicate:
-- admin pages (e.g. the class roster on /admin/classes/[id], via
-- getStudentsByClassId in lib/students.ts) read these tables through the
-- anon-key client directly, with no protected API route in front of them
-- (unlike the prerequisite matrix widget). A pure owner-scoped policy would
-- silently empty out that roster for real admins too. So the replacement
-- policies allow either the row's own student, or anyone present in
-- `admins`, matching the same admin-membership check used everywhere else
-- (getCurrentAdmin, migration 33's is_admin()).

DROP POLICY IF EXISTS "Authenticated users read students" ON students;
DROP POLICY IF EXISTS "Authenticated users read enrollments" ON enrollments;

CREATE POLICY "Students can read own data, admins can read all"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL)
  );

CREATE POLICY "Students can read own enrollments, admins can read all"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = enrollments.student_id
      AND students.id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL)
  );

-- ============================================================================
-- VERIFY (run manually in the Supabase SQL editor)
-- ============================================================================
-- select tablename, policyname, cmd, roles, qual
-- from pg_policies
-- where tablename in ('students','enrollments')
-- order by tablename, cmd;
