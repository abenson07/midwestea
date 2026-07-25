-- Migration: Automatically create a placeholder certificate for every
-- enrollment, so "coming soon" certificate entries (BEN-848) don't depend
-- on a manual/admin step.

CREATE OR REPLACE FUNCTION create_placeholder_certificate()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO certificates (student_id, enrollment_id, status)
  VALUES (NEW.student_id, NEW.id, 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_placeholder_certificate ON enrollments;

CREATE TRIGGER trg_create_placeholder_certificate
  AFTER INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION create_placeholder_certificate();

-- Backfill: create a pending certificate for any existing enrollment that
-- doesn't already have one.
INSERT INTO certificates (student_id, enrollment_id, status)
SELECT e.student_id, e.id, 'pending'
FROM enrollments e
WHERE NOT EXISTS (
  SELECT 1 FROM certificates c WHERE c.enrollment_id = e.id
);
