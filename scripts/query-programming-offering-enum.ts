/**
 * Query programming_offering enum values from courses table
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

async function queryProgrammingOfferingEnum() {
  console.log('🔍 Querying programming_offering enum values...\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error('❌ Missing required environment variables.');
    console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createSupabaseAdminClient();

  try {
    // First, try to get enum values from information_schema
    const enumQuery = `
      SELECT 
        t.typname as enum_name,
        e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'programming_offering'
      ORDER BY e.enumsortorder;
    `;

    // Try to execute via exec_sql if available
    try {
      const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: enumQuery }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.length > 0) {
          console.log('✅ Found enum values:');
          result.forEach((row: any) => {
            console.log(`   - ${row.enum_value}`);
          });
          return;
        }
      }
    } catch (error) {
      console.log('⚠️  Could not query via exec_sql, trying alternative method...');
    }

    // Alternative: Query distinct values from the courses table
    const { data, error } = await supabase
      .from('courses')
      .select('programming_offering')
      .not('programming_offering', 'is', null);

    if (error) {
      console.error('❌ Error querying courses table:', error.message);
      console.log('\n💡 The programming_offering column might not exist yet.');
      process.exit(1);
    }

    if (data && data.length > 0) {
      const uniqueValues = [...new Set(data.map((row: any) => row.programming_offering))];
      console.log('✅ Found distinct values in courses table:');
      uniqueValues.forEach((value) => {
        console.log(`   - ${value}`);
      });
    } else {
      console.log('⚠️  No values found in courses table. Column may be empty or not exist.');
    }

    // Also check the column definition
    const columnQuery = `
      SELECT 
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'courses'
        AND column_name = 'programming_offering';
    `;

    try {
      const colResponse = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: columnQuery }),
      });

      if (colResponse.ok) {
        const colResult = await colResponse.json();
        if (colResult && colResult.length > 0) {
          console.log('\n📋 Column definition:');
          console.log(`   Type: ${colResult[0].data_type}`);
          console.log(`   UDT: ${colResult[0].udt_name}`);
        }
      }
    } catch (error) {
      // Ignore if exec_sql not available
    }

  } catch (err: any) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

queryProgrammingOfferingEnum();







