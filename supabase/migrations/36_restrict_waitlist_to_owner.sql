-- Migration 36: Restrict waitlist SELECT back to row owner
--
-- Same drift pattern found on every other table in this audit: production's
-- SELECT policy on `waitlist` was "Authenticated users read waitlist",
-- USING (true) - any authenticated user could read every waitlist entry
-- for every course, including other people's names (via the students join)
-- and, through GET /api/waitlist/by-course-code/[courseCode], their emails.
--
-- Note the real severity here was actually the API route, not this policy:
-- GET /api/waitlist/by-course-code/[courseCode]/route.ts used the
-- service-role client with NO auth check at all, so it leaked names+emails
-- to anyone, logged in or not, bypassing RLS entirely regardless of what
-- this policy said. Fixed separately, same PR, by adding the same
-- bearer-token + getCurrentAdmin check already used elsewhere (that route
-- is only ever called from admin/courses/[id] and admin/programs/[id], so
-- it should always have been admin-gated). This migration is the RLS
-- defense-in-depth layer on top of that.
--
-- Migration 11 already defined the intended policy for this table, but
-- conditionally: it only creates a scoped policy if `waitlist` has a
-- `student_id` column, which suggests uncertainty at authoring time about
-- whether the table (or that column) existed yet. Confirmed via
-- app/api/waitlist/submit/route.ts and the by-course-code route that
-- `student_id` does exist and is exactly what both routes key on, so the
-- conditional branch's intended policy is correct and used verbatim here.
-- No admin OR-clause needed (unlike students/enrollments): the only admin
-- consumer of this table (the by-course-code route, above) already reads
-- via the service-role client, not the anon-key path this policy governs.
--
-- Applied directly to production via the SQL editor ahead of this
-- migration/PR, for the same reason as migrations 34 and 35: live,
-- actively-exploitable exposure. This file exists so the fix is tracked
-- and reproducible for other environments, not because it's still pending.

DROP POLICY IF EXISTS "Authenticated users read waitlist" ON waitlist;

CREATE POLICY "Authenticated users can read own waitlist entries"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = waitlist.student_id
      AND students.id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFY (run manually in the Supabase SQL editor)
-- ============================================================================
-- select tablename, policyname, cmd, roles, qual
-- from pg_policies
-- where tablename = 'waitlist'
-- order by cmd;
