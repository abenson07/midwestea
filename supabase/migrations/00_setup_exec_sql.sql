-- Setup helper function for executing SQL migrations
-- This function is required for the apply-migrations.ts script to work
-- Run this migration first, or execute it manually in your Supabase SQL editor

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Grant execute permission to authenticated users (adjust as needed)
-- GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
-- GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;






