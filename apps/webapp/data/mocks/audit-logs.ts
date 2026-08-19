export type AuditLogRow = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
};

/**
 * Empty on purpose — held 8 hardcoded fake entries in the source app, and
 * LogsPage reads this unconditionally (no live/demo gate), so those would
 * have rendered as real data. midwestea already has a real `logs` table
 * (see PR #15 / migration 33's RLS policy on it) — wiring this page to that
 * table is a real follow-up, not done here.
 */
export const AUDIT_LOG_ROWS: AuditLogRow[] = [];
