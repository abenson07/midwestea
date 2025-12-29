-- Create invoices_to_import table for CSV export to QuickBooks
CREATE TABLE IF NOT EXISTS invoices_to_import (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number INTEGER NOT NULL,
  customer_email TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  item TEXT NOT NULL,
  memo TEXT,
  item_amount INTEGER NOT NULL, -- Amount in cents
  item_quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  item_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.5,
  payment_id UUID REFERENCES payments(id),
  class_id UUID REFERENCES classes(id),
  invoice_sequence INTEGER NOT NULL, -- 1 or 2 (for the two invoices created)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on invoice_number for efficient querying
CREATE INDEX IF NOT EXISTS idx_invoices_to_import_invoice_number ON invoices_to_import(invoice_number DESC);

-- Create index on payment_id for linking
CREATE INDEX IF NOT EXISTS idx_invoices_to_import_payment_id ON invoices_to_import(payment_id);

-- Create index on class_id for filtering
CREATE INDEX IF NOT EXISTS idx_invoices_to_import_class_id ON invoices_to_import(class_id);

-- Enable Row Level Security (RLS)
ALTER TABLE invoices_to_import ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert (for webhooks)
CREATE POLICY "Service role can insert invoices"
  ON invoices_to_import
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow authenticated users to read invoices
CREATE POLICY "Authenticated users can read invoices"
  ON invoices_to_import
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a sequence for invoice numbers starting at 100001
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 100001;

