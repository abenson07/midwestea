/**
 * Insert a daily log entry into the logs table
 * 
 * Usage:
 *   npm run insert-daily-log
 * 
 * Environment variables needed:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for admin access
 * 
 * This script:
 *   - Inserts a new log entry with the message "standard chron job to keep db active"
 *   - Can be run manually for testing
 *   - Used by the Cloudflare Cron Worker
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createSupabaseAdminClient } from '../packages/utils/supabaseClient';

// Load environment variables from .env.local and .env (in order of precedence)
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function insertDailyLog() {
  console.log('📝 Inserting daily log entry...\n');

  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment variables check:');
  console.log(`  SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL): ${url ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}\n`);

  if (!url || !serviceRoleKey) {
    console.error('❌ Missing required environment variables.');
    console.error('   Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  // Create Supabase admin client
  let supabase;
  try {
    supabase = createSupabaseAdminClient();
    console.log('✅ Supabase admin client created\n');
  } catch (error: any) {
    console.error(`❌ Failed to create Supabase client: ${error.message}`);
    process.exit(1);
  }

  // Insert log entry
  const message = 'standard chron job to keep db active';
  console.log(`📝 Inserting log entry with message: "${message}"`);

  try {
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
      throw error;
    }

    console.log('✅ Log entry inserted successfully!');
    console.log(`   ID: ${data.id}`);
    console.log(`   Message: ${data.message}`);
    console.log(`   Created at: ${data.created_at}\n`);
  } catch (error: any) {
    console.error('❌ Failed to insert log entry:');
    
    // Check if it's a table not found error
    const errorMsg = (error?.message || '').toLowerCase();
    if (errorMsg.includes('could not find the table') || 
        errorMsg.includes('does not exist') ||
        error?.code === 'PGRST116') {
      console.error('   The logs table does not exist.');
      console.error('   Please run migrations first: npm run apply-migrations');
    } else {
      console.error(`   ${error.message}`);
    }
    
    process.exit(1);
  }

  console.log('✨ Daily log insertion completed successfully!\n');
}

// Run the script
insertDailyLog().catch((error) => {
  console.error('\n❌ Script execution failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});













