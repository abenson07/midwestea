-- Add manual refund tracking columns to transactions table
-- Both are nullable; NULL means "not refunded". No backfill needed.
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS refund_percentage NUMERIC(5, 2);

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS refund_amount INTEGER;
