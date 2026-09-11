-- Migration 41: Upsell-card image on courses
-- Lets the "Completed Class + Followups" email (apps/webapp/emails/completed-class-followups.tsx)
-- show a real course thumbnail in CourseUpsellGrid instead of the gray placeholder box —
-- there was previously no image field on courses at all.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS image_url text;
