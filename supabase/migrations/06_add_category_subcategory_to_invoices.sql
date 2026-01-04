-- Add category and subcategory columns to invoices_to_import table
ALTER TABLE invoices_to_import
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_invoices_to_import_category ON invoices_to_import(category);

-- Create index on subcategory for filtering
CREATE INDEX IF NOT EXISTS idx_invoices_to_import_subcategory ON invoices_to_import(subcategory);



