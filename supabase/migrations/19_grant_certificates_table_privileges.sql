-- Migration 19: Grant base table privileges on certificates
-- RLS policies (migration 17) control *row* access, but Postgres also
-- requires a table-level GRANT before a role can query it at all — without
-- this, `authenticated` gets "permission denied for table certificates"
-- regardless of RLS. Other tables (students, enrollments, ...) already had
-- this from the project's original setup; certificates is a brand-new
-- table and never got it.

GRANT SELECT ON certificates TO authenticated;
GRANT ALL ON certificates TO service_role;
