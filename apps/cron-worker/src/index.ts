/**
 * Cloudflare Worker for daily log insertion cron job
 * 
 * This worker runs on a schedule (configured in wrangler.jsonc)
 * and inserts a log entry into the Supabase logs table.
 * 
 * Cron schedule: Runs daily at midnight UTC (00:00 UTC)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create Supabase admin client (for Cloudflare Worker)
function createSupabaseAdminClient(env: {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(insertDailyLog(env));
  },

  // Also allow manual invocation via HTTP for testing
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only allow POST requests for manual triggers
    if (request.method !== 'POST') {
      return new Response('Method not allowed. Use POST to trigger manually.', { 
        status: 405 
      });
    }

    try {
      await insertDailyLog(env);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Log entry inserted successfully' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  },
};

async function insertDailyLog(env: Env): Promise<void> {
  // Create Supabase admin client with environment variables
  const supabase = createSupabaseAdminClient({
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  });

  const message = 'standard chron job to keep db active';

  const { data, error } = await supabase
    .from('logs')
    .insert([
      {
        message: message,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert log entry: ${error.message}`);
  }

  console.log(`✅ Log entry inserted: ${data.id} at ${data.created_at}`);
}

