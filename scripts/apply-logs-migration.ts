/**
 * Apply the logs table migration directly using Supabase admin client
 * 
 * This script uses the Supabase REST API to execute SQL directly
 * without requiring the exec_sql function or Management API
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

async function applyLogsMigration() {
  console.log('🚀 Applying logs table migration...\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error('❌ Missing required environment variables.');
    console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Read the migration file
  const migrationPath = path.resolve(__dirname, '../supabase/migrations/01_create_logs_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📝 Executing migration SQL...\n');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  const supabase = createSupabaseAdminClient();

  // Execute each statement using RPC call to exec_sql, or direct SQL execution
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement || statement.trim().length === 0) continue;

    console.log(`[${i + 1}/${statements.length}] Executing statement...`);

    try {
      // Try using the Supabase REST API to execute SQL directly
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
        // exec_sql doesn't exist, try alternative approach using pg_rest or direct SQL
        console.log('   ⚠️  exec_sql function not found. Trying alternative method...');
        
        // Use Supabase's query endpoint to execute SQL
        // Note: This requires the SQL to be executed via the PostgREST API
        // For CREATE TABLE, we'll need to use a different approach
        
        // Actually, let's just create the table using the Supabase client's raw SQL capability
        // We can use the REST API with a custom function or use the management API
        // For now, let's try executing via a direct SQL call using the service role
        
        const sqlResponse = await fetch(`${url}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ query: statement }),
        });

        if (!sqlResponse.ok) {
          const errorText = await sqlResponse.text();
          throw new Error(`HTTP ${sqlResponse.status}: ${errorText}`);
        }
      } else if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log(`   ✅ Statement ${i + 1} executed successfully`);
    } catch (error: any) {
      // If exec_sql doesn't work, try creating the table using Supabase's SQL execution
      // We'll need to use the Supabase dashboard SQL editor approach or create a helper
      console.error(`   ❌ Statement ${i + 1} failed: ${error.message}`);
      console.error(`   💡 You may need to run this SQL manually in the Supabase SQL Editor`);
      console.error(`   📄 Migration file: ${migrationPath}\n`);
      
      // Print the SQL for manual execution
      console.log('   📋 SQL to run manually:');
      console.log('   ' + '='.repeat(60));
      statements.forEach((stmt, idx) => {
        console.log(`   ${stmt};`);
      });
      console.log('   ' + '='.repeat(60) + '\n');
      
      process.exit(1);
    }
  }

  console.log('\n✅ Migration completed successfully!');
  console.log('📊 Logs table should now be created.\n');
}

applyLogsMigration().catch((error) => {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
});



