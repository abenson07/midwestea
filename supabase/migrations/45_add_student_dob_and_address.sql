-- Migration 45: Collect date of birth and mailing address at registration
-- Captured on the checkout details step and saved to the student by the Stripe webhook.
-- Nullable so existing students are unaffected.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT;
