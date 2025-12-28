/**
 * Setup exec_sql function and apply logs migration
 * 
 * This script:
 * 1. Creates the exec_sql function if it doesn't exist
 * 2. Applies the logs table migration
 * 
 * Uses Supabase REST API to execute SQL statements
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSQL(sql: string, description: string): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  console.log(`📝 ${description}...`);

  // Try to execute via exec_sql RPC function
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (response.status === 404) {
    throw new Error('exec_sql function not found. Please create it first.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  console.log(`   ✅ ${description} completed`);
}

async function setupAndApplyMigration() {
  console.log('🚀 Setting up exec_sql function and applying logs migration...\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables.');
    console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Read the setup SQL
  const setupSqlPath = path.resolve(__dirname, '../supabase/migrations/00_setup_exec_sql.sql');
  const setupSql = fs.readFileSync(setupSqlPath, 'utf-8');

  // Read the logs migration SQL
  const logsSqlPath = path.resolve(__dirname, '../supabase/migrations/01_create_logs_table.sql');
  const logsSql = fs.readFileSync(logsSqlPath, 'utf-8');

  try {
    // First, try to create/verify exec_sql function exists
    // We'll try to use it, and if it fails, we need to create it manually
    console.log('🔍 Checking if exec_sql function exists...\n');

    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: 'SELECT 1' }),
    });

    if (testResponse.status === 404) {
      console.log('⚠️  exec_sql function not found.');
      console.log('   You need to create it first. Here are your options:\n');
      console.log('   Option 1: Run this SQL in Supabase SQL Editor:');
      console.log('   ' + '='.repeat(60));
      console.log(setupSql);
      console.log('   ' + '='.repeat(60) + '\n');
      console.log('   Option 2: After creating exec_sql, run: npm run apply-migrations\n');
      console.log('   Then run: npm run insert-daily-log\n');
      process.exit(1);
    }

    // exec_sql exists, proceed with migration
    console.log('✅ exec_sql function found\n');

    // Split and execute each statement from the logs migration
    const statements = logsSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.match(/^\s*--/));

    console.log(`📄 Found ${statements.length} SQL statement(s) to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      await executeSQL(statement + ';', `Executing statement ${i + 1}/${statements.length}`);
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('📊 Logs table is now ready.\n');
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}\n`);
    console.error('💡 You may need to:');
    console.error('   1. Create the exec_sql function manually in Supabase SQL Editor');
    console.error('   2. Or use the Management API with SUPABASE_ACCESS_TOKEN\n');
    process.exit(1);
  }
}

setupAndApplyMigration().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});











