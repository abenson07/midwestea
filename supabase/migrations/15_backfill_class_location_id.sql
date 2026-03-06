-- One-time backfill: set classes.location_id where classes.location matches locations.location_name
UPDATE classes
SET location_id = (SELECT id FROM locations WHERE locations.location_name = TRIM(classes.location) LIMIT 1)
WHERE location_id IS NULL
  AND location IS NOT NULL
  AND TRIM(location) != ''
  AND EXISTS (SELECT 1 FROM locations WHERE locations.location_name = TRIM(classes.location));
