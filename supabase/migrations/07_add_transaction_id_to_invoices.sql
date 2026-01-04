-- Add transaction_id column to invoices_to_import table to track Stripe payment intent IDs
ALTER TABLE invoices_to_import
  ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Create index on transaction_id for efficient querying
CREATE INDEX IF NOT EXISTS idx_invoices_to_import_transaction_id ON invoices_to_import(transaction_id);

-- Add comment to explain the column
COMMENT ON COLUMN invoices_to_import.transaction_id IS 'Stripe payment intent ID to prevent duplicate imports';




