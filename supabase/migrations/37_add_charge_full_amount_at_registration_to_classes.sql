ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS charge_full_amount_at_registration boolean NOT NULL DEFAULT false;
