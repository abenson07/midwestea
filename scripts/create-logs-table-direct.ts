/**
 * Create logs table directly using Supabase REST API
 * 
 * This script attempts to create the logs table by executing SQL
 * via the Supabase REST API using a direct approach
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createSupabaseAdminClient } from '../packages/utils/supabaseClient';

// Load environment variables
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function createLogsTable() {
  console.log('🚀 Creating logs table...\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error('❌ Missing required environment variables.');
    console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createSupabaseAdminClient();

  // First, try to check if the table already exists
  console.log('🔍 Checking if logs table exists...');
  const { data: existingData, error: checkError } = await supabase
    .from('logs')
    .select('id')
    .limit(1);

  if (!checkError) {
    console.log('✅ Logs table already exists!\n');
    return;
  }

  // Table doesn't exist, we need to create it
  // Since we can't execute DDL via PostgREST, we'll use the REST API with exec_sql
  // or provide instructions
  console.log('📝 Logs table does not exist. Creating it...\n');

  // Read the migration SQL
  const migrationPath = path.resolve(__dirname, '../supabase/migrations/01_create_logs_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Try to execute via exec_sql RPC
  console.log('🔄 Attempting to create table via exec_sql function...\n');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.match(/^\s*--/));

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    try {
      const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: statement + ';' }),
      });

      if (response.status === 404) {
        throw new Error('exec_sql function not found');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log(`   ✅ Statement ${i + 1}/${statements.length} executed`);
    } catch (error: any) {
      if (error.message.includes('exec_sql function not found')) {
        console.error('\n❌ exec_sql function is required but not found.');
        console.error('\n📋 Please run this SQL in your Supabase SQL Editor first:');
        console.error('   ' + '='.repeat(60));
        const setupSql = fs.readFileSync(
          path.resolve(__dirname, '../supabase/migrations/00_setup_exec_sql.sql'),
          'utf-8'
        );
        console.error(setupSql);
        console.error('   ' + '='.repeat(60));
        console.error('\n   Then run this script again: npm run create-logs-table\n');
        process.exit(1);
      }
      throw error;
    }
  }

  // Verify the table was created
  console.log('\n🔍 Verifying table creation...');
  const { error: verifyError } = await supabase
    .from('logs')
    .select('id')
    .limit(1);

  if (verifyError) {
    console.error('❌ Table creation may have failed:', verifyError.message);
    process.exit(1);
  }

  console.log('✅ Logs table created successfully!\n');
}

createLogsTable().catch((error) => {
  console.error('\n❌ Failed:', error.message);
  process.exit(1);
});




