/**
 * Resolve Supabase credentials for Plan 10 migration scripts.
 *
 * - source (default): unprefixed NEXT_PUBLIC_SUPABASE_* / SUPABASE_*
 * - target: MIGRATION_* prefixed vars for the new paid project
 */

export type SupabaseEnvTarget = 'source' | 'target';

export interface SupabaseCredentials {
  url: string;
  anonKey?: string;
  serviceRoleKey: string;
  accessToken?: string;
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function prefixFor(target: SupabaseEnvTarget): string {
  return target === 'target' ? 'MIGRATION_' : '';
}

export function getSupabaseCredentials(
  target: SupabaseEnvTarget = 'source'
): SupabaseCredentials {
  const prefix = prefixFor(target);

  const url =
    readEnv(`${prefix}NEXT_PUBLIC_SUPABASE_URL`) ??
    readEnv(`${prefix}SUPABASE_URL`);

  const anonKey =
    readEnv(`${prefix}NEXT_PUBLIC_SUPABASE_ANON_KEY`) ??
    readEnv(`${prefix}SUPABASE_ANON_KEY`);

  const serviceRoleKey = readEnv(`${prefix}SUPABASE_SERVICE_ROLE_KEY`);
  const accessToken = readEnv(`${prefix}SUPABASE_ACCESS_TOKEN`);

  if (!url || !serviceRoleKey) {
    const label = target === 'target' ? 'migration target' : 'source';
    throw new Error(
      `Missing ${label} Supabase credentials. Set ${prefix}NEXT_PUBLIC_SUPABASE_URL and ${prefix}SUPABASE_SERVICE_ROLE_KEY in .env.local`
    );
  }

  return { url, anonKey, serviceRoleKey, accessToken };
}

export function getProjectRef(url: string): string {
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  if (match?.[1]) {
    return match[1];
  }
  throw new Error(`Could not extract project reference from Supabase URL: ${url}`);
}
