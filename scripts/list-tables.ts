/**
 * List all tables in Supabase database
 * 
 * Usage:
 *   npm run list-tables
 * 
 * Environment variables needed:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for admin access
 * 
 * This script:
 *   - Lists all tables in your database
 *   - Shows table schemas (public, auth, etc.)
 *   - Optionally shows column information
 *   - Shows row counts for each table
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

interface TableInfo {
  schema: string;
  table_name: string;
  table_type: string;
  row_count?: number;
  columns?: ColumnInfo[];
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}


/**
 * Get project reference from Supabase URL
 */
function getProjectRef(url: string): string {
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error('Could not extract project reference from Supabase URL');
}

/**
 * Get tables using Management API (direct SQL query)
 */
async function getTablesViaManagementAPI(url: string, accessToken: string): Promise<TableInfo[]> {
  const projectRef = getProjectRef(url);
  const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  const query = `
    SELECT 
      table_schema as schema,
      table_name,
      table_type
    FROM information_schema.tables
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      AND table_schema NOT LIKE 'pg_temp_%'
      AND table_schema NOT LIKE 'pg_toast_temp_%'
    ORDER BY table_schema, table_name;
  `;
  
  const response = await fetch(managementApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });
  
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
  
  const result = await response.json();
  
  // Management API returns results in different formats, handle both
  if (Array.isArray(result)) {
    return result.map((row: any) => ({
      schema: row.schema || row.table_schema,
      table_name: row.table_name,
      table_type: row.table_type,
    }));
  } else if (result.data && Array.isArray(result.data)) {
    return result.data.map((row: any) => ({
      schema: row.schema || row.table_schema,
      table_name: row.table_name,
      table_type: row.table_type,
    }));
  }
  
  return [];
}

/**
 * Get tables using a helper RPC function (requires exec_sql)
 */
async function getTablesViaRPC(supabase: any, url: string, serviceRoleKey: string): Promise<TableInfo[]> {
  // Create a helper function that returns table info as JSON
  const createHelperFunction = `
    CREATE OR REPLACE FUNCTION list_tables()
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result json;
    BEGIN
      SELECT json_agg(
        json_build_object(
          'schema', table_schema,
          'table_name', table_name,
          'table_type', table_type
        )
        ORDER BY table_schema, table_name
      )
      INTO result
      FROM information_schema.tables
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        AND table_schema NOT LIKE 'pg_temp_%'
        AND table_schema NOT LIKE 'pg_toast_temp_%';
      
      RETURN COALESCE(result, '[]'::json);
    END;
    $$;
  `;
  
  // Create the helper function using exec_sql
  const createResponse = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: createHelperFunction }),
  });
  
  if (createResponse.status === 404) {
    throw new Error('exec_sql function not found. Please use Management API or set up exec_sql first.');
  }
  
  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    // Function might already exist, which is fine
    if (!errorText.includes('already exists') && !errorText.includes('duplicate')) {
      console.warn(`⚠️  Warning creating helper function: ${errorText}`);
    }
  }
  
  // Now call the helper function
  const { data, error } = await supabase.rpc('list_tables');
  
  if (error) {
    throw new Error(`Failed to call list_tables function: ${error.message}`);
  }
  
  if (!data) {
    return [];
  }
  
  return data.map((row: any) => ({
    schema: row.schema,
    table_name: row.table_name,
    table_type: row.table_type,
  }));
}


/**
 * Get row count for a table
 */
async function getRowCount(supabase: any, schema: string, tableName: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      // Table might not be accessible or might be a view
      return -1;
    }
    
    return count || 0;
  } catch (error) {
    return -1;
  }
}

/**
 * Get columns for a table
 */
async function getColumns(supabase: any, schema: string, tableName: string): Promise<ColumnInfo[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceRoleKey) {
    return [];
  }
  
  // Create a function to get columns
  const createColumnsFunction = `
    CREATE OR REPLACE FUNCTION get_table_columns(p_schema text, p_table text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result json;
    BEGIN
      SELECT json_agg(
        json_build_object(
          'column_name', column_name,
          'data_type', data_type,
          'is_nullable', is_nullable,
          'column_default', column_default
        )
      )
      INTO result
      FROM information_schema.columns
      WHERE table_schema = p_schema
        AND table_name = p_table
      ORDER BY ordinal_position;
      
      RETURN COALESCE(result, '[]'::json);
    END;
    $$;
  `;
  
  try {
    await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: createColumnsFunction }),
    });
  } catch (error) {
    // Might already exist
  }
  
  try {
    const { data, error } = await supabase.rpc('get_table_columns', {
      p_schema: schema,
      p_table: tableName,
    });
    
    if (error) {
      return [];
    }
    
    return data || [];
  } catch (error) {
    return [];
  }
}

/**
 * Main function to list tables
 */
async function listTables() {
  console.log('🔍 Listing tables in Supabase database...\n');
  
  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  console.log('📋 Environment variables check:');
  console.log(`  SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL): ${url ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_ACCESS_TOKEN: ${accessToken ? '✅ Set' : '❌ Missing'}\n`);
  
  if (!url) {
    console.error('❌ Missing SUPABASE_URL. Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) in .env.local');
    process.exit(1);
  }
  
  // Get tables - prefer Management API if available, otherwise try RPC
  console.log('📊 Fetching table information...\n');
  let tables: TableInfo[];
  
  if (accessToken) {
    // Use Management API (simplest, no setup required)
    try {
      console.log('   Using Management API...');
      tables = await getTablesViaManagementAPI(url, accessToken);
      console.log('   ✅ Successfully fetched tables via Management API\n');
    } catch (error: any) {
      console.error(`❌ Failed to fetch tables via Management API: ${error.message}`);
      if (serviceRoleKey) {
        console.log('   Trying alternative method with service role key...\n');
        try {
          const supabase = createSupabaseAdminClient();
          tables = await getTablesViaRPC(supabase, url, serviceRoleKey);
        } catch (rpcError: any) {
          console.error(`❌ Also failed with RPC method: ${rpcError.message}\n`);
          throw error; // Throw original error
        }
      } else {
        throw error;
      }
    }
  } else if (serviceRoleKey) {
    // Try RPC method (requires exec_sql function)
    try {
      const supabase = createSupabaseAdminClient();
      console.log('   Using RPC method (requires exec_sql function)...');
      tables = await getTablesViaRPC(supabase, url, serviceRoleKey);
      console.log('   ✅ Successfully fetched tables via RPC\n');
    } catch (error: any) {
      console.error(`❌ Failed to fetch tables: ${error.message}`);
      console.error('\n💡 To fix this, you have two options:');
      console.error('   ');
      console.error('   Option 1: Use Management API (Recommended)');
      console.error('   -------------------------------------');
      console.error('   Add SUPABASE_ACCESS_TOKEN to .env.local');
      console.error('   Get token from: https://supabase.com/dashboard/account/tokens');
      console.error('   ');
      console.error('   Option 2: Set up exec_sql function');
      console.error('   -------------------------------------');
      console.error('   1. Go to your Supabase dashboard → SQL Editor');
      console.error('   2. Run the SQL from: supabase/migrations/00_setup_exec_sql.sql\n');
      throw error;
    }
  } else {
    console.error('❌ Missing required environment variables.');
    console.error('   Please set either:');
    console.error('   - SUPABASE_ACCESS_TOKEN (recommended), OR');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY (requires exec_sql function setup)');
    console.error('   in .env.local\n');
    process.exit(1);
  }
  
  if (tables.length === 0) {
    console.log('ℹ️  No tables found in the database.\n');
    return;
  }
  
  // Group tables by schema
  const tablesBySchema: Record<string, TableInfo[]> = {};
  for (const table of tables) {
    if (!tablesBySchema[table.schema]) {
      tablesBySchema[table.schema] = [];
    }
    tablesBySchema[table.schema].push(table);
  }
  
  // Display tables
  console.log(`📋 Found ${tables.length} table(s) across ${Object.keys(tablesBySchema).length} schema(s):\n`);
  
  for (const [schema, schemaTables] of Object.entries(tablesBySchema)) {
    console.log(`📁 Schema: ${schema}`);
    console.log('─'.repeat(60));
    
    for (const table of schemaTables) {
      // Try to get row count
      let rowCountText = '';
      if (table.table_type === 'BASE TABLE') {
        try {
          const count = await getRowCount(supabase, table.schema, table.table_name);
          if (count >= 0) {
            rowCountText = ` (${count.toLocaleString()} rows)`;
          }
        } catch (error) {
          // Ignore errors getting row count
        }
      }
      
      const typeIcon = table.table_type === 'VIEW' ? '👁️ ' : '📊 ';
      console.log(`  ${typeIcon}${table.table_name}${rowCountText}`);
      
      // Optionally show columns (uncomment to enable)
      // try {
      //   const columns = await getColumns(supabase, table.schema, table.table_name);
      //   if (columns.length > 0) {
      //     for (const col of columns) {
      //       const nullable = col.is_nullable === 'YES' ? 'nullable' : 'not null';
      //       const defaultVal = col.column_default ? ` default ${col.column_default}` : '';
      //       console.log(`      - ${col.column_name}: ${col.data_type} (${nullable}${defaultVal})`);
      //     }
      //   }
      // } catch (error) {
      //   // Ignore column fetch errors
      // }
    }
    
    console.log('');
  }
  
  console.log('✨ Table listing completed!\n');
}

// Run the script
listTables().catch((error) => {
  console.error('\n❌ Failed to list tables:', error.message);
  console.error(error.stack);
  process.exit(1);
});

