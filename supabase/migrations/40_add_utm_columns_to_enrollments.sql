-- Migration 40: UTM attribution capture on enrollments
-- First-touch campaign attribution — captured client-side from the landing
-- page into sessionStorage, carried through checkout, and persisted here
-- when the enrollment is created. No admin UI reads this yet; the point is
-- that real registrations from a tagged campaign link get real attribution
-- data, not that there's a screen to view it (that's future work).

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text;
