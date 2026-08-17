import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * Browser client for `/new-admin-migrate` only. Uses the public anon key.
 * Do not import this from `/admin-preview` — that tree stays on the stubbed
 * `supabaseClient`.
 */
export function createStagingBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy them from apps/webapp/.env.local into updated-admin-migrate/.env.local.",
    );
  }

  browserClient = createBrowserClient(url, key);
  return browserClient;
}
