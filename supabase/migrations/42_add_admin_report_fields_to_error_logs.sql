-- Migration 42: extend error_logs to also hold admin-submitted bug reports
-- and feature requests, so both flow through the same bulk-triage table as
-- captured runtime errors. New rows use kind = 'bug_report' | 'feature_request'
-- (kind has no CHECK constraint, so no migration is needed for that part).

ALTER TABLE public.error_logs
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS reported_by_admin_id uuid REFERENCES public.admins(id);

CREATE INDEX IF NOT EXISTS error_logs_kind_idx ON public.error_logs (kind);
CREATE INDEX IF NOT EXISTS error_logs_reported_by_admin_id_idx ON public.error_logs (reported_by_admin_id);
