-- Add 'webflow_synced' action type to logs table
-- This allows logging when classes are synced to Webflow CMS

ALTER TABLE logs 
  DROP CONSTRAINT IF EXISTS logs_action_type_check;

ALTER TABLE logs 
  ADD CONSTRAINT logs_action_type_check 
  CHECK (action_type IN (
    'detail_updated', 
    'class_created', 
    'class_deleted', 
    'student_added', 
    'student_removed', 
    'student_registered', 
    'payment_success',
    'webflow_synced'
  ));

