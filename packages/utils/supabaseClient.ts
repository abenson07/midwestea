import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance for client-side
let supabaseClientInstance: SupabaseClient | null = null;

// Client-side/client connection (uses ANON key)
export const createSupabaseClient = (): SupabaseClient => {
  // Return existing instance if available
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Supabase Client Error: Missing environment variables');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', url ? 'Set' : 'Missing');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? 'Set' : 'Missing');
    throw new Error('Missing Supabase URL or ANON key. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }

  // Create and cache the client instance
  supabaseClientInstance = createClient(url, key);
  return supabaseClientInstance;
};

// Server-side/admin connection (uses SERVICE_ROLE key - bypasses RLS)
export const createSupabaseAdminClient = (env?: {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}): SupabaseClient => {
  const url = env?.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase URL or SERVICE_ROLE key. Please set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

