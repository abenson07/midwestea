-- Add webflow_item_id column to classes table for storing Webflow CMS collection item IDs
ALTER TABLE classes ADD COLUMN IF NOT EXISTS webflow_item_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_classes_webflow_item_id ON classes(webflow_item_id);











