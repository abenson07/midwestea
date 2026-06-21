/**
 * Generate auth.users + auth.identities import SQL for a new Supabase project.
 *
 * Usage:
 *   npm run generate:auth-import-sql
 *   tsx scripts/generate-auth-import-sql.ts backups/auth-users-export.json backups/auth-identities-export.json
 *   tsx scripts/generate-auth-import-sql.ts --combined backups/auth-export-combined.json
 */

import fs from 'fs';
import path from 'path';

type AuthUser = Record<string, unknown>;
type AuthIdentity = Record<string, unknown>;

function normalizeUser(raw: AuthUser): AuthUser {
  return {
    ...raw,
    raw_app_meta_data:
      raw.raw_app_meta_data ?? raw.app_metadata ?? { provider: 'email', providers: ['email'] },
    raw_user_meta_data: raw.raw_user_meta_data ?? raw.user_metadata ?? {},
    encrypted_password: raw.encrypted_password ?? '',
    aud: raw.aud ?? 'authenticated',
    role: raw.role ?? 'authenticated',
  };
}

function sqlString(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  const s = String(value);
  if (s === '') return "''";
  return `'${s.replace(/'/g, "''")}'`;
}

function sqlTimestamp(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'::timestamptz`;
}

function emptyToNull(value: unknown): unknown {
  if (value === '') return null;
  return value;
}

function buildUserInsert(user: AuthUser): string {
  const id = user.id;
  const email = user.email;

  // GoTrue v2 on hosted Supabase queries instance_id = uuid.Nil, not auth.instances.id.
  // Token columns must be '' not NULL or user lookups fail silently.
  return `INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  ${sqlString(id)},
  ${sqlString(user.aud ?? 'authenticated')},
  ${sqlString(user.role ?? 'authenticated')},
  ${sqlString(email)},
  ${sqlString(user.encrypted_password ?? '')},
  ${sqlTimestamp(user.email_confirmed_at)},
  ${sqlTimestamp(emptyToNull(user.invited_at))},
  ${sqlString(user.confirmation_token ?? '')},
  ${sqlTimestamp(emptyToNull(user.confirmation_sent_at))},
  ${sqlString(user.recovery_token ?? '')},
  ${sqlTimestamp(emptyToNull(user.recovery_sent_at))},
  ${sqlString(user.email_change_token_new ?? '')},
  ${sqlString(user.email_change ?? '')},
  ${sqlTimestamp(emptyToNull(user.email_change_sent_at))},
  ${sqlTimestamp(emptyToNull(user.last_sign_in_at))},
  ${sqlString(user.raw_app_meta_data ?? { provider: 'email', providers: ['email'] })},
  ${sqlString(user.raw_user_meta_data ?? {})},
  ${user.is_super_admin === null ? 'NULL' : sqlString(user.is_super_admin)},
  ${sqlTimestamp(user.created_at)},
  ${sqlTimestamp(user.updated_at)},
  ${user.phone ? sqlString(user.phone) : 'NULL'},
  ${sqlTimestamp(emptyToNull(user.phone_confirmed_at))},
  ${sqlString(user.phone_change ?? '')},
  ${sqlString(user.phone_change_token ?? '')},
  ${sqlTimestamp(emptyToNull(user.phone_change_sent_at))},
  ${sqlString(user.email_change_token_current ?? '')},
  ${sqlString(user.email_change_confirm_status ?? 0)},
  ${sqlTimestamp(emptyToNull(user.banned_until))},
  ${sqlString(user.reauthentication_token ?? '')},
  ${sqlTimestamp(emptyToNull(user.reauthentication_sent_at))},
  ${sqlString(user.is_sso_user ?? false)},
  ${sqlTimestamp(emptyToNull(user.deleted_at))},
  ${sqlString(user.is_anonymous ?? false)}
)
ON CONFLICT (id) DO NOTHING;`;
}

function buildIdentityInsert(identity: AuthIdentity): string {
  return `INSERT INTO auth.identities (
  id,
  user_id,
  provider,
  provider_id,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  ${sqlString(identity.id)},
  ${sqlString(identity.user_id)},
  ${sqlString(identity.provider)},
  ${sqlString(identity.provider_id)},
  ${sqlString(identity.identity_data)},
  ${sqlTimestamp(identity.last_sign_in_at)},
  ${sqlTimestamp(identity.created_at)},
  ${sqlTimestamp(identity.updated_at)}
)
ON CONFLICT (provider_id, provider) DO NOTHING;`;
}

function emailVerified(user: AuthUser): boolean {
  const meta = user.raw_user_meta_data as Record<string, unknown> | undefined;
  if (typeof meta?.email_verified === 'boolean') return meta.email_verified;
  return user.email_confirmed_at != null && user.email_confirmed_at !== '';
}

function buildSyntheticIdentityInsert(user: AuthUser): string {
  const id = String(user.id);
  const identityData = {
    sub: id,
    email: user.email,
    email_verified: emailVerified(user),
    phone_verified: false,
  };

  return `INSERT INTO auth.identities (
  id,
  user_id,
  provider,
  provider_id,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  ${sqlString(id)},
  'email',
  ${sqlString(id)},
  ${sqlString(identityData)},
  ${sqlTimestamp(emptyToNull(user.last_sign_in_at))},
  ${sqlTimestamp(user.created_at)},
  ${sqlTimestamp(user.updated_at)}
)
ON CONFLICT (provider_id, provider) DO NOTHING;`;
}

function main() {
  const args = process.argv.slice(2);
  let usersPath: string | undefined;
  let identitiesPath: string | undefined;
  let outPath = path.resolve(__dirname, '../backups/import-auth-users.sql');

  let users: AuthUser[];
  let identities: AuthIdentity[];

  if (args[0] === '--combined') {
    const combinedPath = args[1];
    if (!combinedPath) {
      console.error('Usage: tsx scripts/generate-auth-import-sql.ts --combined <export.json>');
      process.exit(1);
    }
    const combined = JSON.parse(fs.readFileSync(combinedPath, 'utf8')) as {
      users: AuthUser[];
      identities: AuthIdentity[];
    };
    users = combined.users.map(normalizeUser);
    identities = combined.identities;
    if (args[2]) outPath = path.resolve(args[2]);
  } else {
    usersPath = args[0];
    identitiesPath = args[1];
    if (args[2]) outPath = path.resolve(args[2]);

    if (!usersPath || !identitiesPath) {
      console.error(
        'Usage: tsx scripts/generate-auth-import-sql.ts <users.json> <identities.json> [output.sql]'
      );
      console.error(
        '   or: tsx scripts/generate-auth-import-sql.ts --combined <export.json> [output.sql]'
      );
      process.exit(1);
    }

    users = (JSON.parse(fs.readFileSync(usersPath, 'utf8')) as AuthUser[]).map(
      normalizeUser
    );
    identities = JSON.parse(
      fs.readFileSync(identitiesPath, 'utf8')
    ) as AuthIdentity[];
  }

  const identityUserIds = new Set(
    identities.map((i) => String(i.user_id))
  );

  const missingIdentityUsers = users.filter(
    (u) => u.email && !identityUserIds.has(String(u.id))
  );

  const lines: string[] = [
    '-- Import auth.users + auth.identities into NEW Supabase project',
    '-- Run in SQL Editor. INSERT-only; skips rows that already exist (ON CONFLICT DO NOTHING).',
    `-- ${users.length} users, ${identities.length} exported identities, ${missingIdentityUsers.length} synthetic identities`,
    '',
    'BEGIN;',
    '',
    '-- auth.users',
  ];

  for (const user of users) {
    lines.push(buildUserInsert(user));
    lines.push('');
  }

  lines.push('-- auth.identities (exported)');
  for (const identity of identities) {
    lines.push(buildIdentityInsert(identity));
    lines.push('');
  }

  if (missingIdentityUsers.length > 0) {
    lines.push('-- auth.identities for users missing an email identity (bulk-import rows)');
    for (const user of missingIdentityUsers) {
      lines.push(buildSyntheticIdentityInsert(user));
      lines.push('');
    }
  }

  lines.push('COMMIT;');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  console.log(`Wrote ${outPath}`);
  console.log(
    `  ${users.length} users, ${identities.length} identities, ${missingIdentityUsers.length} synthetic identities`
  );
}

main();
