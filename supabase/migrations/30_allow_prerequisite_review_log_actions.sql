-- Allow prerequisite review outcomes in logs.action_type (BEN-868)
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
    'student_deleted',
    'payment_success',
    'prerequisite_approved',
    'prerequisite_rejected'
  ));
