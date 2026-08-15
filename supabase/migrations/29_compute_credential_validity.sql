-- Migration 29: Stored expiration dates on student credential records (BEN-871)
-- Month arithmetic lives in Postgres so month-end clamping (31 Jan + 1 month
-- = 28 Feb) is identical for every caller. Expiry is computed at write time
-- and stored; it is never recomputed on read.

CREATE OR REPLACE FUNCTION compute_credential_expiry(
  issued date,
  rule text,
  months integer
) RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN rule = 'duration_from_issue' AND issued IS NOT NULL AND months IS NOT NULL
      THEN (issued + (months || ' months')::interval)::date
    ELSE NULL
  END;
$$;

GRANT EXECUTE ON FUNCTION compute_credential_expiry(date, text, integer)
  TO authenticated, service_role;

-- Backfill rows written between migrations 28 and 29, which have a NULL
-- expires_at only because this computation did not exist yet.
UPDATE student_credentials sc
SET expires_at = compute_credential_expiry(
      sc.issued_at, pt.expiration_rule, pt.expiration_duration_months
    ),
    updated_at = now()
FROM prerequisite_types pt
WHERE pt.id = sc.prerequisite_type_id
  AND pt.expiration_rule = 'duration_from_issue'
  AND sc.issued_at IS NOT NULL
  AND sc.expires_at IS NULL;
