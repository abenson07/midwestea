-- Fix GoTrue visibility for SQL-imported auth users (Plan 10)
--
-- Symptom: OTP / magic link returns 500 with
--   duplicate key value violates unique constraint "users_email_partial_key"
--   AND Authentication → Users shows 0 users
--
-- Root causes (common after SQL import):
--   1) instance_id is NULL or a real auth.instances UUID — GoTrue queries uuid.Nil
--   2) Token columns are NULL instead of '' — GoTrue scan errors when loading users
--   3) Missing auth.identities rows (less common if import included them)
--
-- Run in Supabase Dashboard → SQL Editor on the NEW project.
-- Safe to re-run.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) instance_id — use nil UUID (modern hosted Supabase / GoTrue v2)
--    Do NOT point at auth.instances; that table is deprecated on hosted projects.
-- ---------------------------------------------------------------------------

UPDATE auth.users
SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  updated_at = timezone('utc', now())
WHERE deleted_at IS NULL
  AND (
    instance_id IS NULL
    OR instance_id <> '00000000-0000-0000-0000-000000000000'::uuid
  );

-- ---------------------------------------------------------------------------
-- 2) NULL → '' on token/string columns GoTrue expects as non-null strings
--    (NULL here causes "Database error finding user" / invisible users)
-- ---------------------------------------------------------------------------

UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  updated_at = timezone('utc', now())
WHERE deleted_at IS NULL
  AND email IS NOT NULL
  AND (
    confirmation_token IS NULL
    OR recovery_token IS NULL
    OR email_change_token_new IS NULL
    OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL
    OR phone_change_token IS NULL
    OR reauthentication_token IS NULL
  );

-- ---------------------------------------------------------------------------
-- 3) Normalize aud/role
-- ---------------------------------------------------------------------------

UPDATE auth.users
SET
  aud = 'authenticated',
  role = 'authenticated',
  updated_at = timezone('utc', now())
WHERE deleted_at IS NULL
  AND email IS NOT NULL
  AND (aud IS DISTINCT FROM 'authenticated' OR role IS DISTINCT FROM 'authenticated');

-- ---------------------------------------------------------------------------
-- 4) Ensure email provider metadata exists
-- ---------------------------------------------------------------------------

UPDATE auth.users u
SET
  raw_app_meta_data = jsonb_set(
    jsonb_set(
      COALESCE(u.raw_app_meta_data, '{}'::jsonb),
      '{provider}',
      '"email"'::jsonb,
      true
    ),
    '{providers}',
    '["email"]'::jsonb,
    true
  ),
  updated_at = timezone('utc', now())
WHERE u.deleted_at IS NULL
  AND u.email IS NOT NULL
  AND (
    u.raw_app_meta_data IS NULL
    OR u.raw_app_meta_data->>'provider' IS DISTINCT FROM 'email'
    OR NOT (COALESCE(u.raw_app_meta_data->'providers', '[]'::jsonb) ? 'email')
  );

-- ---------------------------------------------------------------------------
-- 5) Backfill missing auth.identities + fix NULL identity timestamps
-- ---------------------------------------------------------------------------

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', (u.email_confirmed_at IS NOT NULL),
    'phone_verified', false
  ),
  'email',
  u.id::text,
  u.last_sign_in_at,
  COALESCE(u.created_at, timezone('utc', now())),
  COALESCE(u.updated_at, timezone('utc', now()))
FROM auth.users u
WHERE u.email IS NOT NULL
  AND u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM auth.identities i
    WHERE i.user_id = u.id
      AND i.provider = 'email'
  );

UPDATE auth.identities i
SET
  created_at = COALESCE(i.created_at, timezone('utc', now())),
  updated_at = COALESCE(i.updated_at, timezone('utc', now()))
WHERE i.created_at IS NULL
   OR i.updated_at IS NULL;

COMMIT;

-- ---------------------------------------------------------------------------
-- 6) Post-fix verification (run after COMMIT)
-- ---------------------------------------------------------------------------

SELECT
  (SELECT COUNT(*) FROM auth.users WHERE deleted_at IS NULL) AS total_users,
  (SELECT COUNT(*)
   FROM auth.users u
   WHERE u.deleted_at IS NULL
     AND u.instance_id IS DISTINCT FROM '00000000-0000-0000-0000-000000000000'::uuid
  ) AS users_with_wrong_instance_id,
  (SELECT COUNT(*)
   FROM auth.users u
   WHERE u.deleted_at IS NULL
     AND u.email IS NOT NULL
     AND (
       u.confirmation_token IS NULL
       OR u.recovery_token IS NULL
       OR u.email_change IS NULL
     )
  ) AS users_with_null_token_columns,
  (SELECT COUNT(*)
   FROM auth.users u
   WHERE u.email IS NOT NULL
     AND u.deleted_at IS NULL
     AND NOT EXISTS (
       SELECT 1 FROM auth.identities i
       WHERE i.user_id = u.id AND i.provider = 'email'
     )) AS users_missing_email_identity;
