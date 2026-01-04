-- Add stripe_payment_link column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT;

-- Update courses with Stripe payment links by course_code
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/14A4gzffF399fo10I26Vq0D' WHERE course_code = 'PALS';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/cNicN5c3tgZZgs50I26Vq0B' WHERE course_code = 'EPI';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/bJe6oHd7xdNNejXaiC6Vq0A' WHERE course_code = 'ATCC';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/5kQcN54B17ppejX4Yi6Vq0z' WHERE course_code = 'CCT';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/9B65kD8Rh8ttgs52Qa6Vq0x' WHERE course_code = 'EMT';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/6oUeVdebBgZZcbP4Yi6Vq0w' WHERE course_code = 'EMR';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/28E28r9VldNNa3HeyS6Vq0v' WHERE course_code = 'PARA';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/cNicN57NdgZZ5Nr0I26Vq0m' WHERE course_code = 'BLS';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/eVqeVd9Vl8ttdfT0I26Vq0l' WHERE course_code = 'AVERT';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/eVqfZh2sT255cbPbmG6Vq0k' WHERE course_code = 'ACLS';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/5kQbJ13wX6llejX76q6Vq0j' WHERE course_code = 'PATH';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/9B6fZh7Nd111dfT2Qa6Vq0i' WHERE course_code = 'CABS';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/5kQ14naZp6ll3Fj3Ue6Vq0h' WHERE course_code = 'CPR';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/7sYbJ10kL5hh5NrbmG6Vq0g' WHERE course_code = 'OXY';
UPDATE courses SET stripe_payment_link = 'https://buy.stripe.com/cNi9AT5F5cJJfo14Yi6Vq0f' WHERE course_code = 'PEDS';



