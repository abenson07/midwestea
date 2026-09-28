-- Migration 41: error_logs table for runtime error capture
-- Captures client (uncaught JS, unhandled rejections, failed fetches) and
-- server (API route catch blocks) errors so they can be triaged in bulk
-- instead of only surfacing as one-off Linear issues or console output.

CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL CHECK (source IN ('client', 'server')),
  kind text NOT NULL,
  message text NOT NULL,
  stack text,
  page_url text,
  request_url text,
  method text,
  status_code int,
  response_body text,
  fingerprint text NOT NULL,
  environment text NOT NULL,
  context jsonb,
  resolved boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS error_logs_fingerprint_idx ON public.error_logs (fingerprint);
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON public.error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_resolved_idx ON public.error_logs (resolved) WHERE resolved = false;

-- Enable Row Level Security so the anon/authenticated PostgREST roles can't
-- read or write this table directly; all writes go through the service-role
-- admin client (see lib/error-reporting/log-to-supabase.ts), which bypasses RLS.
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert error logs"
  ON public.error_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read error logs"
  ON public.error_logs
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update error logs"
  ON public.error_logs
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read error logs"
  ON public.error_logs
  FOR SELECT
  TO authenticated
  USING (true);
