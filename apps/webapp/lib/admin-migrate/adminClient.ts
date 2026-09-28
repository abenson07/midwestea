import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only admin client for `/new-admin-migrate` API routes.
 * Uses the service role so privileged reads (e.g. listing students) work
 * the same way as `apps/webapp`. Never import this from client components.
 */
export function createStagingAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy them from apps/webapp/.env.local into updated-admin-migrate/.env.local.",
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
