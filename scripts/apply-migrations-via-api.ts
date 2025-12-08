/**
 * Apply Supabase SQL migrations via Management API
 * 
 * Usage:
 *   npm run apply-migrations:api
 * 
 * Environment variables needed:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) - Supabase project URL
 *   SUPABASE_ACCESS_TOKEN - Supabase Management API access token
 * 
 * This script:
 *   - Uses the Supabase Management API to execute SQL migrations
 *   - Reads all .sql files from supabase/migrations/ directory
 *   - Executes each SQL statement sequentially
 *   - Provides progress feedback and error handling
 * 
 * Note: This approach uses the Management API which requires an access token.
 *       For most use cases, apply-migrations.ts (using service role key) is preferred.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

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
 * Get project reference from Supabase URL
 */
function getProjectRef(url: string): string {
  // Extract project ref from URL
  // URL format: https://<project-ref>.supabase.co
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error('Could not extract project reference from Supabase URL');
}

/**
 * Execute SQL via Supabase Management API
 */
async function executeSqlViaManagementAPI(
  projectRef: string,
  accessToken: string,
  sql: string
): Promise<void> {
  const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  const response = await fetch(managementApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: sql }),
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
  return result;
}

/**
 * Main migration execution function
 */
async function applyMigrations() {
  console.log('🚀 Starting Supabase migration execution via Management API...\n');
  
  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  console.log('📋 Environment variables check:');
  console.log(`  SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL): ${url ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_ACCESS_TOKEN: ${accessToken ? '✅ Set' : '❌ Missing'}\n`);
  
  if (!url || !accessToken) {
    console.error('❌ Missing required environment variables.');
    console.error('   Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_ACCESS_TOKEN in .env.local');
    console.error('   Note: You can get an access token from https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }
  
  // Extract project reference
  let projectRef: string;
  try {
    projectRef = getProjectRef(url);
    console.log(`✅ Project reference: ${projectRef}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to extract project reference: ${error.message}`);
    process.exit(1);
  }
  
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
          await executeSqlViaManagementAPI(projectRef, accessToken, statement);
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









