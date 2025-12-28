# Supabase Migrations

This directory contains SQL migration files that are executed against your Supabase database.

## Usage

### Using Service Role Key (Recommended)

```bash
npm run apply-migrations
```

This script uses the `SUPABASE_SERVICE_ROLE_KEY` to execute migrations directly via the Supabase REST API.

**Requirements:**
- `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) in `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- The `exec_sql` function must exist in your database (see `00_setup_exec_sql.sql`)

### Using Management API

```bash
npm run apply-migrations:api
```

This script uses the Supabase Management API to execute migrations.

**Requirements:**
- `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) in `.env.local`
- `SUPABASE_ACCESS_TOKEN` in `.env.local` (get from https://supabase.com/dashboard/account/tokens)

## Migration Files

- Migration files should be named with a numeric prefix (e.g., `001_initial_schema.sql`, `002_add_users_table.sql`)
- Files are executed in alphabetical order
- Each file can contain multiple SQL statements separated by semicolons
- Comments (`--` and `/* */`) are automatically stripped
- DO blocks and dollar-quoted strings are properly handled

## Example Migration File

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## Setup

1. Ensure the `exec_sql` function exists in your database:
   - Run `00_setup_exec_sql.sql` manually in your Supabase SQL editor, OR
   - The first time you run `apply-migrations`, it will provide instructions

2. Add your migration files to this directory

3. Run migrations:
   ```bash
   npm run apply-migrations
   ```

## Notes

- Migrations are executed sequentially
- If a statement fails, the script will continue with the next statement
- Review the output carefully for any errors
- Always test migrations in a development environment first











