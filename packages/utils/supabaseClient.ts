import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance for client-side
let supabaseClientInstance: SupabaseClient | null = null;
let configPromise: Promise<{ supabaseUrl: string; supabaseAnonKey: string }> | null = null;

// Fetch config from API route (runtime config for Webflow Cloud)
async function fetchConfig(): Promise<{ supabaseUrl: string; supabaseAnonKey: string }> {
  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      // Determine base path - in production it's /app, in dev it might be empty
      const basePath = typeof window !== 'undefined' 
        ? (window.location.pathname.startsWith('/app') ? '/app' : '')
        : '';
      
      const response = await fetch(`${basePath}/api/config`);
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      const config = await response.json();
      
      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error('Config missing Supabase credentials');
      }
      
      return {
        supabaseUrl: config.supabaseUrl,
        supabaseAnonKey: config.supabaseAnonKey,
      };
    } catch (error) {
      console.error('Error fetching config:', error);
      throw error;
    }
  })();

  return configPromise;
}

// Client-side/client connection (uses ANON key)
export const createSupabaseClient = async (): Promise<SupabaseClient> => {
  // Return existing instance if available
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // Try build-time env vars first
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  // If not available, fetch from API (runtime config)
  if (!url || !key) {
    if (typeof window !== 'undefined') {
      // Client-side: fetch from API
      const config = await fetchConfig();
      url = config.supabaseUrl;
      key = config.supabaseAnonKey;
    } else {
      // Server-side: should have access to env vars
      throw new Error('Missing Supabase URL or ANON key on server side. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }
  }

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

