-- Migration: Setup Row Level Security (RLS) for all tables
-- This migration ensures all tables have RLS enabled with appropriate policies
-- Run this migration to secure your production database

-- ============================================================================
-- STUDENTS TABLE
-- ============================================================================
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage students" ON students;
DROP POLICY IF EXISTS "Authenticated users can read own student data" ON students;
DROP POLICY IF EXISTS "Authenticated users can update own student data" ON students;

-- Service role has full access (for webhooks and admin operations)
CREATE POLICY "Service role can manage students"
  ON students
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read their own student record (matched by auth.users.id)
CREATE POLICY "Authenticated users can read own student data"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Authenticated users can update their own student record
CREATE POLICY "Authenticated users can update own student data"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- ENROLLMENTS TABLE
-- ============================================================================
-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage enrollments" ON enrollments;
DROP POLICY IF EXISTS "Authenticated users can read own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Authenticated users can insert own enrollments" ON enrollments;

-- Service role has full access (for webhooks)
CREATE POLICY "Service role can manage enrollments"
  ON enrollments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read enrollments for their own student record
CREATE POLICY "Authenticated users can read own enrollments"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = enrollments.student_id
      AND students.id = auth.uid()
    )
  );

-- Authenticated users can create enrollments for their own student record
CREATE POLICY "Authenticated users can insert own enrollments"
  ON enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = enrollments.student_id
      AND students.id = auth.uid()
    )
  );

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage payments" ON payments;
DROP POLICY IF EXISTS "Authenticated users can read own payments" ON payments;

-- Service role has full access (for webhooks)
CREATE POLICY "Service role can manage payments"
  ON payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read payments for their own enrollments
CREATE POLICY "Authenticated users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN students ON students.id = enrollments.student_id
      WHERE enrollments.id = payments.enrollment_id
      AND students.id = auth.uid()
    )
  );

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can read own transactions" ON transactions;

-- Service role has full access (for webhooks and admin operations)
CREATE POLICY "Service role can manage transactions"
  ON transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read transactions for their own student record
CREATE POLICY "Authenticated users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    student_id IS NULL OR
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = transactions.student_id
      AND students.id = auth.uid()
    )
  );

-- ============================================================================
-- CLASSES TABLE
-- ============================================================================
-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage classes" ON classes;
DROP POLICY IF EXISTS "Authenticated users can read classes" ON classes;

-- Service role has full access (for admin operations and webhooks)
CREATE POLICY "Service role can manage classes"
  ON classes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read classes (public information)
CREATE POLICY "Authenticated users can read classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- COURSES TABLE
-- ============================================================================
-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can read courses" ON courses;

-- Service role has full access (for admin operations)
CREATE POLICY "Service role can manage courses"
  ON courses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read courses (public information)
CREATE POLICY "Authenticated users can read courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- WAITLIST TABLE (if it exists)
-- ============================================================================
-- Enable RLS (will fail silently if table doesn't exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'waitlist'
  ) THEN
    ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Service role can manage waitlist" ON waitlist;
    DROP POLICY IF EXISTS "Authenticated users can read own waitlist entries" ON waitlist;
    DROP POLICY IF EXISTS "Authenticated users can insert own waitlist entries" ON waitlist;
    
    -- Service role has full access
    EXECUTE 'CREATE POLICY "Service role can manage waitlist"
      ON waitlist
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true)';
    
    -- Authenticated users can read their own waitlist entries
    -- (assuming waitlist has student_id or email column)
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'waitlist' 
      AND column_name = 'student_id'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can read own waitlist entries"
        ON waitlist
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM students
            WHERE students.id = waitlist.student_id
            AND students.id = auth.uid()
          )
        )';
      
      EXECUTE 'CREATE POLICY "Authenticated users can insert own waitlist entries"
        ON waitlist
        FOR INSERT
        TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM students
            WHERE students.id = waitlist.student_id
            AND students.id = auth.uid()
          )
        )';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- VERIFY RLS IS ENABLED ON ALL TABLES
-- ============================================================================
-- This query will show which tables have RLS enabled
-- Run this in Supabase SQL editor to verify:
/*
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
*/

