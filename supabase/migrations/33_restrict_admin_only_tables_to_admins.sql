-- Migration 33: Restrict admin-only tables to admin SELECT (and INSERT for logs)
--
-- Migrations 03/04/05/10 gave blanket SELECT access to any `authenticated`
-- user on tables that should only ever be readable by staff: admins, logs,
-- email_logs, invoices_to_import. This was exploitable via the AdminShell
-- auth gap fixed alongside this migration (any logged-in student could load
-- admin pages that read these tables client-side with the anon key, relying
-- entirely on RLS that in practice allowed it).
--
-- classes, courses, locations, class_prerequisites, template_prerequisites,
-- and prerequisite_types are intentionally NOT touched here -- they're
-- genuinely read by student-facing booking/checkout/prerequisite flows and
-- are meant to be readable by any authenticated user.
--
-- Numbering note: main's last migration was 15. Migrations 16-32 are
-- reserved (per WEEKEND_STATUS.md's migration map) for several long-running
-- feature branches that haven't merged yet. This is numbered 33 -
-- deliberately past all of those reservations - so it can't collide with
-- any of them when they eventually land. That leaves an intentional gap
-- (16-32) in main's sequence until those branches merge.
--
-- admins needs a SECURITY DEFINER helper rather than a bare
-- EXISTS (SELECT 1 FROM admins ...) predicate: a policy ON admins that
-- subqueries admins directly trips Postgres's self-reference guard
-- ("infinite recursion detected in policy for relation admins"). The helper
-- runs as its owner (bypassing RLS internally), so the recursion never
-- happens. logs/email_logs/invoices_to_import reuse it too, for consistency.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid() AND admins.deleted_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================================
-- ADMINS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can read admins" ON admins;

CREATE POLICY "Admins can read admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL AND public.is_admin());

-- ============================================================================
-- LOGS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can read logs" ON logs;
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON logs;

CREATE POLICY "Admins can read logs"
  ON logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert logs"
  ON logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- ============================================================================
-- EMAIL_LOGS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can read email logs" ON email_logs;

CREATE POLICY "Admins can read email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- INVOICES_TO_IMPORT TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can read invoices" ON invoices_to_import;

CREATE POLICY "Admins can read invoices"
  ON invoices_to_import
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- VERIFY (run manually in the Supabase SQL editor after applying)
-- ============================================================================
-- select tablename, policyname, cmd, roles, qual
-- from pg_policies
-- where tablename in ('admins','logs','email_logs','invoices_to_import')
-- order by tablename, cmd;
