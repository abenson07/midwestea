-- Create logs table for cron job activity tracking
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert (for cron jobs)
CREATE POLICY "Service role can insert logs"
  ON logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow authenticated users to read logs
CREATE POLICY "Authenticated users can read logs"
  ON logs
  FOR SELECT
  TO authenticated
  USING (true);




