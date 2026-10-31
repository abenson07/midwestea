import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Find an auth user by email across every page of accounts.
 *
 * `auth.admin.listUsers()` with no arguments returns only the first page
 * (50 users), so a plain `.find()` on it misses everyone after that and the
 * caller then fails trying to create a duplicate account.
 */
export async function findAuthUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<{ user: User | null; error: string | null }> {
  const target = email.trim().toLowerCase();
  const perPage = 1000;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) return { user: null, error: error.message };

    const found = data.users.find((user) => user.email?.toLowerCase() === target);
    if (found) return { user: found, error: null };

    if (data.users.length < perPage) break;
  }

  return { user: null, error: null };
}
