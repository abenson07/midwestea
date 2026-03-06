-- Create locations table with structured address for class locations
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name TEXT NOT NULL,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  google_maps_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for name lookups (e.g. backfill matching)
CREATE INDEX IF NOT EXISTS idx_locations_location_name ON locations(location_name);

-- Add location_id to classes
ALTER TABLE classes ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_classes_location_id ON classes(location_id);

-- Seed four locations (address fields nullable initially); only when table is empty
INSERT INTO locations (location_name, street, city, state, zip, google_maps_url)
SELECT v.location_name, v.street, v.city, v.state, v.zip, v.google_maps_url
FROM (VALUES
  ('Raytown, MO'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT),
  ('Pleasant Valley, MO'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT),
  ('Topeka, KS'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT),
  ('Eudora, KS'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT)
) AS v(location_name, street, city, state, zip, google_maps_url)
WHERE (SELECT COUNT(*) FROM locations) = 0;

-- RLS for locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage locations"
  ON locations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);
