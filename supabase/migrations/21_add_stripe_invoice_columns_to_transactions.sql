-- Add Stripe Invoice tracking columns to transactions table
-- Populated for tuition_a/tuition_b (and, from BEN-1180 forward, custom/pay_in_full)
-- rows, which are real Stripe Invoice objects created at registration or
-- void-and-reissue time. Never populated for registration_fee rows, which stay a
-- plain one-time Checkout Session payment.
-- Both nullable; NULL means "no Stripe Invoice exists for this row" (registration_fee
-- rows, or historical tuition rows created before this migration).
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS stripe_hosted_invoice_url TEXT;

-- Looked up by the invoice.paid webhook handler to resolve which transaction a
-- Stripe Invoice event belongs to.
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_invoice_id ON transactions(stripe_invoice_id);
