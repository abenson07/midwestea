-- Migration 39: Certificate expiration reminder setting on courses
-- Setting only — nothing reads this to actually send a reminder yet. Lets
-- an admin configure "how many months before expiration to warn a student"
-- per program/course, ready to wire up sending later.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS certificate_reminder_months integer;
