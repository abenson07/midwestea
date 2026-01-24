-- Add downloaded column to transactions table
-- This column tracks whether a transaction has been exported to CSV
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS downloaded BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index on downloaded column for efficient querying
CREATE INDEX IF NOT EXISTS idx_transactions_downloaded ON transactions(downloaded);

-- Set existing transactions to downloaded = false (they haven't been exported yet)
UPDATE transactions SET downloaded = FALSE WHERE downloaded IS NULL;







