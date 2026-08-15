-- Migration 30: Allow prerequisite review log actions
-- Allow prerequisite review outcomes in logs.action_type (BEN-868)
--
-- The prior rebuild of this constraint (migration 13) dropped 'webflow_synced'
-- by mistake when it added 'student_deleted' -- it wrote a fresh list instead
-- of extending the existing one. This migration corrects that in passing by
-- re-adding 'webflow_synced' alongside the two new prerequisite values, so
-- Webflow-sync logging isn't silently broken by whichever of 13/30 lands last.
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
    'webflow_synced',
    'prerequisite_approved',
    'prerequisite_rejected'
  ));
