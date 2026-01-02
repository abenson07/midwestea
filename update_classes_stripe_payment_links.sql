-- Add stripe_payment_link column to classes table
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT;

-- Update classes table with stripe_payment_link from courses table by matching course_code
UPDATE classes
SET stripe_payment_link = courses.stripe_payment_link
FROM courses
WHERE classes.course_code = courses.course_code
  AND courses.stripe_payment_link IS NOT NULL;

