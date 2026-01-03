-- Create email_logs table for tracking email delivery status
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'course_enrollment', 'program_enrollment', etc.
  enrollment_id UUID REFERENCES enrollments(id),
  student_id UUID REFERENCES students(id),
  success BOOLEAN NOT NULL DEFAULT false,
  email_id TEXT, -- Resend API email ID
  error TEXT,
  retries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_enrollment_id ON email_logs(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_student_id ON email_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_success ON email_logs(success);

-- Enable Row Level Security (RLS)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert (for email sending)
CREATE POLICY "Service role can insert email logs"
  ON email_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow service role to read email logs
CREATE POLICY "Service role can read email logs"
  ON email_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Allow authenticated users to read email logs
CREATE POLICY "Authenticated users can read email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (true);

