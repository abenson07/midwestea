/**
 * Apply Supabase SQL migrations
 * 
 * Usage:
 *   npm run apply-migrations
 * 
 * Environment variables needed:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for admin access
 * 
 * This script:
 *   - Reads all .sql files from supabase/migrations/ directory
 *   - Executes each SQL statement sequentially
 *   - Provides progress feedback and error handling
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

/**
 * Remove SQL comments from a string
 */
function removeComments(sql: string): string {
  let result = '';
  let i = 0;
  const len = sql.length;
  
  while (i < len) {
    // Check for single-line comment (--)
    if (i < len - 1 && sql[i] === '-' && sql[i + 1] === '-') {
      // Skip until end of line
      while (i < len && sql[i] !== '\n') {
        i++;
      }
      if (i < len) i++; // Include the newline
      continue;
    }
    
    // Check for multi-line comment (/* */)
    if (i < len - 1 && sql[i] === '/' && sql[i + 1] === '*') {
      i += 2;
      while (i < len - 1) {
        if (sql[i] === '*' && sql[i + 1] === '/') {
          i += 2;
          break;
        }
        i++;
      }
      continue;
    }
    
    result += sql[i];
    i++;
  }
  
  return result;
}

/**
 * Check if a character is a valid identifier character for dollar-quoted strings
 */
function isDollarTagChar(char: string): boolean {
  return /[a-zA-Z0-9_]/.test(char);
}

/**
 * Find dollar-quoted string boundaries
 */
function findDollarQuote(sql: string, startPos: number): { endPos: number; tag: string } | null {
  if (sql[startPos] !== '$') return null;
  
  let i = startPos + 1;
  let tag = '';
  
  // Read the tag (can be empty or contain identifier chars)
  while (i < sql.length && isDollarTagChar(sql[i])) {
    tag += sql[i];
    i++;
  }
  
  // Must end with $ to be a valid dollar quote
  if (i >= sql.length || sql[i] !== '$') return null;
  
  const startTag = '$' + tag + '$';
  const endTag = '$' + tag + '$';
  i++; // Skip the closing $ of start tag
  
  // Find the matching end tag
  while (i < sql.length) {
    if (sql[i] === '$') {
      let j = i + 1;
      let potentialTag = '';
      while (j < sql.length && isDollarTagChar(sql[j])) {
        potentialTag += sql[j];
        j++;
      }
      if (j < sql.length && sql[j] === '$') {
        const foundTag = '$' + potentialTag + '$';
        if (foundTag === endTag) {
          return { endPos: j + 1, tag: startTag };
        }
      }
    }
    i++;
  }
  
  return null; // No matching end tag found
}

/**
 * Split SQL into individual statements, handling DO blocks and dollar-quoted strings
 */
function splitSqlStatements(sql: string): string[] {
  // Remove comments first
  sql = removeComments(sql);
  
  const statements: string[] = [];
  let currentStatement = '';
  let i = 0;
  const len = sql.length;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inDollarQuote: string | null = null;
  let dollarQuoteStart = -1;
  
  while (i < len) {
    const char = sql[i];
    const nextChar = i < len - 1 ? sql[i + 1] : '';
    
    // Handle dollar-quoted strings (like $$ or $tag$)
    if (char === '$' && !inSingleQuote && !inDoubleQuote && inDollarQuote === null) {
      const dollarQuote = findDollarQuote(sql, i);
      if (dollarQuote) {
        inDollarQuote = dollarQuote.tag;
        dollarQuoteStart = i;
        currentStatement += sql.substring(i, dollarQuote.endPos);
        i = dollarQuote.endPos;
        continue;
      }
    }
    
    // Check if we're ending a dollar quote
    if (inDollarQuote !== null) {
      if (char === '$') {
        const dollarQuote = findDollarQuote(sql, dollarQuoteStart);
        if (dollarQuote && dollarQuote.endPos === i + dollarQuote.tag.length) {
          inDollarQuote = null;
          dollarQuoteStart = -1;
        }
      }
      currentStatement += char;
      i++;
      continue;
    }
    
    // Handle single quotes
    if (char === "'" && !inDoubleQuote && inDollarQuote === null) {
      inSingleQuote = !inSingleQuote;
      currentStatement += char;
      i++;
      continue;
    }
    
    // Handle double quotes
    if (char === '"' && !inSingleQuote && inDollarQuote === null) {
      inDoubleQuote = !inDoubleQuote;
      currentStatement += char;
      i++;
      continue;
    }
    
    // Handle escaped quotes
    if ((inSingleQuote || inDoubleQuote) && char === '\\') {
      currentStatement += char;
      if (i < len - 1) {
        currentStatement += sql[i + 1];
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    
    // Check for statement terminator (semicolon) outside of quotes
    if (char === ';' && !inSingleQuote && !inDoubleQuote && inDollarQuote === null) {
      const trimmed = currentStatement.trim();
      if (trimmed) {
        statements.push(trimmed);
      }
      currentStatement = '';
      i++;
      // Skip whitespace after semicolon
      while (i < len && /\s/.test(sql[i])) {
        i++;
      }
      continue;
    }
    
    currentStatement += char;
    i++;
  }
  
  // Add the last statement if there's any remaining content
  const trimmed = currentStatement.trim();
  if (trimmed) {
    statements.push(trimmed);
  }
  
  return statements.filter(stmt => stmt.length > 0);
}

/**
 * Get all SQL migration files from the migrations directory
 */
function getMigrationFiles(migrationsDir: string): string[] {
  if (!fs.existsSync(migrationsDir)) {
    console.warn(`⚠️  Migrations directory does not exist: ${migrationsDir}`);
    console.warn(`   Creating directory...`);
    fs.mkdirSync(migrationsDir, { recursive: true });
    return [];
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort alphabetically to ensure consistent execution order
  
  return files;
}

/**
 * Verify the exec_sql helper function exists
 */
async function ensureExecSqlFunction(supabase: any): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  
  // Check if the function exists by trying to call it with a simple query
  try {
    const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: 'SELECT 1' }),
    });
    
    // If we get 404, the function doesn't exist
    // Any other status (including errors) means the function exists
    if (response.status === 404) {
      return false;
    }
    
    // Function exists (even if the query itself failed)
    return true;
  } catch (error) {
    // Network error or other issue - assume function doesn't exist
    return false;
  }
}

/**
 * Execute a single SQL statement using the exec_sql RPC function
 */
async function executeStatement(
  supabase: any,
  statement: string,
  file: string,
  statementIndex: number
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  
  // Use the exec_sql RPC function to execute the SQL
  const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: statement }),
  });
  
  if (response.status === 404) {
    throw new Error('exec_sql function not found. Please create it first (see instructions above).');
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
}

/**
 * Main migration execution function
 */
async function applyMigrations() {
  console.log('🚀 Starting Supabase migration execution...\n');
  
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
  
  // Ensure exec_sql function exists
  console.log('🔍 Checking for exec_sql helper function...');
  const hasExecSql = await ensureExecSqlFunction(supabase);
  if (!hasExecSql) {
    console.error('\n❌ exec_sql function not found in your database.');
    console.error('   ');
    console.error('   To fix this, you have two options:');
    console.error('   ');
    console.error('   Option 1: Create the function manually');
    console.error('   -------------------------------------');
    console.error('   1. Go to your Supabase dashboard → SQL Editor');
    console.error('   2. Run the SQL from: supabase/migrations/00_setup_exec_sql.sql');
    console.error('   3. Or run this SQL:');
    console.error('   ');
    console.error('      CREATE OR REPLACE FUNCTION exec_sql(query text)');
    console.error('      RETURNS void');
    console.error('      LANGUAGE plpgsql');
    console.error('      SECURITY DEFINER');
    console.error('      AS $$');
    console.error('      BEGIN');
    console.error('        EXECUTE query;');
    console.error('      END;');
    console.error('      $$;');
    console.error('   ');
    console.error('   Option 2: Use Management API instead');
    console.error('   ------------------------------------');
    console.error('   Run: npm run apply-migrations:api');
    console.error('   (Requires SUPABASE_ACCESS_TOKEN in .env.local)');
    console.error('   ');
    process.exit(1);
  }
  console.log('✅ exec_sql function found\n');
  
  // Get migrations directory
  const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
  console.log(`📁 Reading migrations from: ${migrationsDir}\n`);
  
  // Get all migration files
  const migrationFiles = getMigrationFiles(migrationsDir);
  
  if (migrationFiles.length === 0) {
    console.log('ℹ️  No migration files found in supabase/migrations/');
    console.log('   Add .sql files to this directory to run migrations.\n');
    return;
  }
  
  console.log(`📄 Found ${migrationFiles.length} migration file(s):`);
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log('');
  
  // Execute each migration file
  let totalStatements = 0;
  let executedStatements = 0;
  let failedStatements = 0;
  
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    console.log(`📝 Processing: ${file}`);
    
    try {
      const sql = fs.readFileSync(filePath, 'utf-8');
      const statements = splitSqlStatements(sql);
      
      console.log(`   Found ${statements.length} SQL statement(s)`);
      totalStatements += statements.length;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        const statementNum = i + 1;
        
        try {
          console.log(`   [${statementNum}/${statements.length}] Executing statement...`);
          await executeStatement(supabase, statement, file, statementNum);
          executedStatements++;
          console.log(`   ✅ Statement ${statementNum} executed successfully`);
        } catch (error: any) {
          failedStatements++;
          console.error(`   ❌ Statement ${statementNum} failed: ${error.message}`);
          console.error(`   Statement preview: ${statement.substring(0, 200)}...`);
          console.error(`   ⚠️  Continuing with next statement...\n`);
        }
      }
      
      console.log(`   ✅ Completed: ${file}\n`);
    } catch (error: any) {
      console.error(`   ❌ Failed to process ${file}: ${error.message}\n`);
      failedStatements++;
    }
  }
  
  // Summary
  console.log('📊 Migration Summary:');
  console.log(`   Total files: ${migrationFiles.length}`);
  console.log(`   Total statements: ${totalStatements}`);
  console.log(`   Executed: ${executedStatements}`);
  console.log(`   Failed: ${failedStatements}`);
  
  if (failedStatements > 0) {
    console.log('\n⚠️  Some migrations failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('\n✨ All migrations completed successfully!');
  }
}

// Run migrations
applyMigrations().catch((error) => {
  console.error('\n❌ Migration execution failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

