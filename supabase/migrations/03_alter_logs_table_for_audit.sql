-- Alter logs table for audit logging system
-- This migration transforms the logs table from a simple message-based table
-- to a comprehensive audit logging system

-- Drop old message column (table is empty per spec)
ALTER TABLE logs DROP COLUMN IF EXISTS message;

-- Rename created_at to timestamp
ALTER TABLE logs RENAME COLUMN created_at TO timestamp;

-- Add new columns for audit logging
ALTER TABLE logs 
  ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES admins(id),
  ADD COLUMN IF NOT EXISTS reference_id UUID NOT NULL,
  ADD COLUMN IF NOT EXISTS reference_type TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS action_type TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS field_name TEXT,
  ADD COLUMN IF NOT EXISTS old_value TEXT,
  ADD COLUMN IF NOT EXISTS new_value TEXT,
  ADD COLUMN IF NOT EXISTS batch_id UUID,
  ADD COLUMN IF NOT EXISTS student_id UUID,
  ADD COLUMN IF NOT EXISTS class_id UUID,
  ADD COLUMN IF NOT EXISTS amount NUMERIC;

-- Add check constraints for reference_type enum
ALTER TABLE logs 
  ADD CONSTRAINT logs_reference_type_check 
  CHECK (reference_type IN ('program', 'course', 'class', 'student'));

-- Add check constraints for action_type enum
ALTER TABLE logs 
  ADD CONSTRAINT logs_action_type_check 
  CHECK (action_type IN (
    'detail_updated', 
    'class_created', 
    'class_deleted', 
    'student_added', 
    'student_removed', 
    'student_registered', 
    'payment_success'
  ));

-- Drop old index on created_at (now timestamp)
DROP INDEX IF EXISTS idx_logs_created_at;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_logs_reference_id ON logs(reference_id);
CREATE INDEX IF NOT EXISTS idx_logs_reference_type ON logs(reference_type);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_admin_user_id ON logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_logs_student_id ON logs(student_id);
CREATE INDEX IF NOT EXISTS idx_logs_class_id ON logs(class_id);
CREATE INDEX IF NOT EXISTS idx_logs_batch_id ON logs(batch_id);

-- Update RLS policies
-- Drop old policies
DROP POLICY IF EXISTS "Service role can insert logs" ON logs;
DROP POLICY IF EXISTS "Authenticated users can read logs" ON logs;

-- Allow service role to insert logs (for webhooks and system actions)
CREATE POLICY "Service role can insert logs"
  ON logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to read logs
CREATE POLICY "Authenticated users can read logs"
  ON logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert logs (for admin actions)
CREATE POLICY "Authenticated users can insert logs"
  ON logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);


