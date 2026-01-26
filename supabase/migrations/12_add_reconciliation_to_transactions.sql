-- Add reconciliation columns to transactions table
-- These columns track whether a transaction has been reconciled with its payout
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT FALSE NOT NULL;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS reconciliation_date TIMESTAMPTZ;

-- Create index on reconciled column for efficient querying
CREATE INDEX IF NOT EXISTS idx_transactions_reconciled ON transactions(reconciled);

-- Create index on reconciliation_date for sorting reconciled transactions
CREATE INDEX IF NOT EXISTS idx_transactions_reconciliation_date ON transactions(reconciliation_date DESC);

-- Set existing transactions to reconciled = false (they haven't been reconciled yet)
UPDATE transactions SET reconciled = FALSE WHERE reconciled IS NULL;
