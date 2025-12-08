-- Create admins table for admin user management
-- Admins are linked to auth.users via id (UUID FK)

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  admin_level TEXT DEFAULT 'standard',
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_deleted_at ON admins(deleted_at) WHERE deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read admins (for getting current admin)
CREATE POLICY "Authenticated users can read admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Policy: Allow service role full access
CREATE POLICY "Service role can manage admins"
  ON admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


