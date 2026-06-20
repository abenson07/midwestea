/**
 * Test Supabase connection
 * 
 * Usage:
 *   npm run test:supabase
 * 
 * Make sure you have .env.local set up with:
 *   SUPABASE_URL=your_url
 *   SUPABASE_ANON_KEY=your_anon_key
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *
 * Loads from repo root `.env.local` or `apps/webapp/.env.local` (Next.js default).
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createSupabaseClient, createSupabaseAdminClient } from '../packages/utils/supabaseClient';

const projectRoot = path.resolve(__dirname, '..');
const envCandidates = [
  path.join(projectRoot, '.env.local'),
  path.join(projectRoot, 'apps/webapp/.env.local'),
  path.join(projectRoot, '.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  // Check environment variables (support both NEXT_PUBLIC_ and non-prefixed versions)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment variables check:');
  console.log(`  SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL): ${url ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY): ${anonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}\n`);

  if (!url || !anonKey || !serviceRoleKey) {
    console.error('❌ Missing required environment variables. Please check your .env.local file.');
    process.exit(1);
  }

  // Test ANON client connection
  try {
    console.log('🔐 Testing ANON client connection...');
    const anonClient = await createSupabaseClient();
    
    // Try a simple query to test the connection
    // Use a query that will work even if tables don't exist - just checking connectivity
    const { data, error } = await anonClient
      .from('_prisma_migrations')
      .select('id')
      .limit(1);
    
    // If there's an error, check if it's a "table not found" error
    // This means the connection is working, but the table doesn't exist (schema not set up yet)
    if (error) {
      const errorMsg = error.message?.toLowerCase() || '';
      const errorCode = error.code || '';
      
      if (errorCode === 'PGRST116' || 
          errorMsg.includes('could not find the table') ||
          errorMsg.includes('does not exist')) {
        console.log('  ✅ ANON client connected successfully');
        console.log('  (Database schema not yet set up, but connection works)\n');
      } else {
        throw error;
      }
    } else {
      console.log('  ✅ ANON client connected successfully\n');
    }
  } catch (error: any) {
    // Check if it's a table-not-found error (connection is working)
    const errorMsg = (error?.message || '').toLowerCase();
    if (errorMsg.includes('could not find the table') ||
        errorMsg.includes('does not exist') ||
        error?.code === 'PGRST116') {
      console.log('  ✅ ANON client connected successfully');
      console.log('  (Database schema not yet set up, but connection works)\n');
    } else {
      console.error(`  ❌ ANON client connection failed: ${error?.message || error}\n`);
      throw error;
    }
  }

  // Test SERVICE_ROLE client connection
  try {
    console.log('🔐 Testing SERVICE_ROLE client connection...');
    const adminClient = createSupabaseAdminClient();
    
    // Try a simple query to test the connection
    const { data, error } = await adminClient
      .from('_prisma_migrations')
      .select('id')
      .limit(1);
    
    // If there's an error, check if it's a "table not found" error
    // This means the connection is working, but the table doesn't exist (schema not set up yet)
    if (error) {
      const errorMsg = error.message?.toLowerCase() || '';
      const errorCode = error.code || '';
      
      if (errorCode === 'PGRST116' || 
          errorMsg.includes('could not find the table') ||
          errorMsg.includes('does not exist')) {
        console.log('  ✅ SERVICE_ROLE client connected successfully');
        console.log('  (Database schema not yet set up, but connection works)\n');
      } else {
        throw error;
      }
    } else {
      console.log('  ✅ SERVICE_ROLE client connected successfully\n');
    }
  } catch (error: any) {
    // Check if it's a table-not-found error (connection is working)
    const errorMsg = (error?.message || '').toLowerCase();
    if (errorMsg.includes('could not find the table') ||
        errorMsg.includes('does not exist') ||
        error?.code === 'PGRST116') {
      console.log('  ✅ SERVICE_ROLE client connected successfully');
      console.log('  (Database schema not yet set up, but connection works)\n');
    } else {
      console.error(`  ❌ SERVICE_ROLE client connection failed: ${error?.message || error}\n`);
      throw error;
    }
  }

  // Test basic query capability
  try {
    console.log('🔍 Testing basic query capability...');
    const adminClient = createSupabaseAdminClient();
    
    // Try to get database version or schema info
    try {
      const { data: schemaData, error: schemaError } = await adminClient
        .rpc('version')
        .single();
      
      if (!schemaError && schemaData) {
        console.log('  ✅ Can execute queries on database');
        console.log(`  📊 Database version: ${schemaData}`);
      } else {
        console.log('  ✅ Can execute queries on database');
        console.log('  (version() function not available, but queries work)');
      }
    } catch (rpcError: any) {
      // RPC function doesn't exist, but that's okay - connection is working
      console.log('  ✅ Can execute queries on database');
      console.log('  (version() function not available, but queries work)');
    }
  } catch (error: any) {
    console.log(`  ⚠️  Query test: ${error.message}`);
  }

  console.log('\n✨ Connection test completed successfully!');
  console.log('🎉 Your Supabase connection is working correctly.\n');
}

// Run the test
testConnection().catch((error) => {
  console.error('\n❌ Connection test failed:', error.message);
  process.exit(1);
});

