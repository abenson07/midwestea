-- Migration 43: capture browser/device context and reporter identity on
-- error_logs, for both automatic error capture and admin-submitted
-- bug/feature reports. browser_info bundles viewport/screen/language/etc as
-- jsonb (like `context`) rather than one column per field, since this is
-- diagnostic detail, not something queried on directly.

ALTER TABLE public.error_logs
  ADD COLUMN IF NOT EXISTS browser_info jsonb,
  ADD COLUMN IF NOT EXISTS reported_by_name text,
  ADD COLUMN IF NOT EXISTS reported_by_email text;
