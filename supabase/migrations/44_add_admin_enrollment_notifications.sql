-- Migration 44: Per-admin opt-in for new-enrollment notification emails
-- Admins with notify_new_enrollment = true receive an email whenever a student enrolls.

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS notify_new_enrollment BOOLEAN NOT NULL DEFAULT false;

-- Turn on for Kyle, Gabe and Sarah:
UPDATE admins SET notify_new_enrollment = true
WHERE email IN ('kbrower@midwestea.com', 'ghajmohammad@midwestea.com', 'sbrooks@midwestea.com');
