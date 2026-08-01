-- Migration: Prerequisite type detail + expiration rule metadata (BEN-870)
-- Additive to migration 24. Existing rows take the column defaults.

ALTER TABLE prerequisite_types
  ADD COLUMN description text,
  ADD COLUMN required_by_default boolean NOT NULL DEFAULT true,
  ADD COLUMN expiration_rule text NOT NULL DEFAULT 'none',
  ADD COLUMN expiration_duration_months integer;

-- Expiration rule and its duration must agree:
--   none                -> no duration
--   fixed_date          -> no duration (student supplies the date)
--   duration_from_issue -> positive duration in months
ALTER TABLE prerequisite_types
  ADD CONSTRAINT prerequisite_types_expiration_rule_check CHECK (
    (expiration_rule = 'none'                AND expiration_duration_months IS NULL)
    OR (expiration_rule = 'fixed_date'          AND expiration_duration_months IS NULL)
    OR (expiration_rule = 'duration_from_issue' AND expiration_duration_months IS NOT NULL
                                                AND expiration_duration_months > 0)
  );
