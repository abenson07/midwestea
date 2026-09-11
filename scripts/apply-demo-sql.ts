/**
 * Apply the generated demo SQL files (docs/demo/generated-sql/*.sql) to the
 * demo Supabase project via the Management API.
 *
 * HARD-CODED to the MIGRATION_* (target) credentials only — this script
 * has no code path that reads the unprefixed/source vars, so it cannot
 * reach the live project even by mistake.
 *
 * Usage:
 *   npm run demo:apply-sql
 *   npm run demo:apply-sql -- --reset       # DROP SCHEMA public CASCADE first —
 *                                            # for a demo/throwaway project only
 *   npm run demo:apply-sql -- --fix-grants  # non-destructive repair: restores
 *                                            # service_role's table/sequence
 *                                            # privileges without touching data
 *
 * Requires in apps/webapp/.env.local (or root .env.local):
 *   MIGRATION_NEXT_PUBLIC_SUPABASE_URL
 *   MIGRATION_SUPABASE_ACCESS_TOKEN   (personal access token — Management API)
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { getSupabaseCredentials, getProjectRef } from './lib/migration-env';

function loadEnv() {
  const candidates = [
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../apps/webapp/.env.local'),
    path.resolve(__dirname, '../.env'),
  ];
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
  }
}

function removeComments(sql: string): string {
  let result = '';
  let i = 0;
  const len = sql.length;
  while (i < len) {
    if (i < len - 1 && sql[i] === '-' && sql[i + 1] === '-') {
      while (i < len && sql[i] !== '\n') i++;
      if (i < len) i++;
      continue;
    }
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

function isDollarTagChar(char: string): boolean {
  return /[a-zA-Z0-9_]/.test(char);
}

function findDollarQuote(sql: string, startPos: number): { endPos: number; tag: string } | null {
  if (sql[startPos] !== '$') return null;
  let i = startPos + 1;
  let tag = '';
  while (i < sql.length && isDollarTagChar(sql[i])) {
    tag += sql[i];
    i++;
  }
  if (i >= sql.length || sql[i] !== '$') return null;
  const endTag = '$' + tag + '$';
  i++;
  while (i < sql.length) {
    if (sql[i] === '$') {
      let j = i + 1;
      let potentialTag = '';
      while (j < sql.length && isDollarTagChar(sql[j])) {
        potentialTag += sql[j];
        j++;
      }
      if (j < sql.length && sql[j] === '$' && '$' + potentialTag + '$' === endTag) {
        return { endPos: j + 1, tag: endTag };
      }
    }
    i++;
  }
  return null;
}

/** Split on top-level semicolons, respecting quotes and $$-quoted function bodies. */
function splitSqlStatements(sql: string): string[] {
  sql = removeComments(sql);
  const statements: string[] = [];
  let current = '';
  let i = 0;
  const len = sql.length;
  let inSingle = false;
  let inDouble = false;
  let inDollar: string | null = null;
  let dollarStart = -1;

  while (i < len) {
    const char = sql[i];

    if (char === '$' && !inSingle && !inDouble && inDollar === null) {
      const dq = findDollarQuote(sql, i);
      if (dq) {
        inDollar = dq.tag;
        dollarStart = i;
        current += sql.substring(i, dq.endPos);
        i = dq.endPos;
        continue;
      }
    }

    if (inDollar !== null) {
      if (char === '$') {
        const dq = findDollarQuote(sql, dollarStart);
        if (dq && dq.endPos === i + dq.tag.length) {
          inDollar = null;
          dollarStart = -1;
        }
      }
      current += char;
      i++;
      continue;
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      current += char;
      i++;
      continue;
    }
    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      current += char;
      i++;
      continue;
    }
    if ((inSingle || inDouble) && char === '\\') {
      current += char;
      if (i < len - 1) {
        current += sql[i + 1];
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    if (char === ';' && !inSingle && !inDouble && inDollar === null) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      i++;
      while (i < len && /\s/.test(sql[i])) i++;
      continue;
    }

    current += char;
    i++;
  }

  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);
  return statements.filter((s) => s.length > 0);
}

/** Postgres codes for "the object I was about to create already exists" —
 * safe to treat as a no-op rather than a failure (CREATE POLICY etc. have
 * no IF NOT EXISTS in Postgres, unlike CREATE TABLE/INDEX). */
const ALREADY_EXISTS_CODES = ['42710', '42P07', '42701', '42P06', '42P16'];

async function executeSql(
  projectRef: string,
  accessToken: string,
  sql: string
): Promise<{ skipped: boolean }> {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    let message = `HTTP ${response.status}`;
    try {
      const json = JSON.parse(errorText);
      message = json.message || json.error || message;
    } catch {
      message = errorText || message;
    }
    const isAlreadyExists =
      ALREADY_EXISTS_CODES.some((code) => message.includes(`ERROR:  ${code}`)) || /already exists/i.test(message);
    if (isAlreadyExists) {
      return { skipped: true };
    }
    throw new Error(message);
  }
  return { skipped: false };
}

/**
 * DROP SCHEMA CASCADE also drops the platform's default privilege grants for
 * that schema — every role (service_role, authenticated, anon) normally
 * gets its baseline table/sequence access from Supabase's own project
 * bootstrap, not from anything in our SQL files. Table-level GRANTs are a
 * separate layer from RLS: a role can have zero rows visible via policy and
 * still need the base GRANT just to have a query evaluate at all (including
 * policy subqueries — e.g. "admins.id = auth.uid()" checks inside another
 * table's policy fail with "permission denied for table admins" if
 * `authenticated` lost SELECT on admins). Restore all three roles' access
 * explicitly, for both existing objects and anything created after this
 * call. RLS policies remain the real per-row gate.
 */
async function grantServiceRoleDefaults(projectRef: string, accessToken: string): Promise<void> {
  await executeSql(
    projectRef,
    accessToken,
    `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

     GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
     GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
     GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

     GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
     GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

     GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;`
  );
}

async function resetPublicSchema(projectRef: string, accessToken: string): Promise<void> {
  console.log('🧹 Resetting public schema on target project (fresh demo project — no real data)...');
  await executeSql(
    projectRef,
    accessToken,
    `DROP SCHEMA public CASCADE;
     CREATE SCHEMA public;
     GRANT ALL ON SCHEMA public TO postgres;
     GRANT USAGE, CREATE ON SCHEMA public TO anon, authenticated, service_role;`
  );
  await grantServiceRoleDefaults(projectRef, accessToken);
  console.log('   done.\n');
}

function getSqlFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // "00-", "01-", ... numeric prefixes sort correctly as strings
}

async function main() {
  loadEnv();

  const args = process.argv.slice(2);
  const dirFlagIndex = args.indexOf('--dir');
  const sqlDir = path.resolve(
    process.cwd(),
    dirFlagIndex >= 0 ? args[dirFlagIndex + 1]! : 'docs/demo/generated-sql'
  );

  // Deliberately 'target' only — MIGRATION_* vars. No source/live fallback exists in this file.
  const target = getSupabaseCredentials('target');
  if (!target.accessToken) {
    console.error('❌ Missing MIGRATION_SUPABASE_ACCESS_TOKEN.');
    console.error('   Get one from https://supabase.com/dashboard/account/tokens');
    console.error('   and add it to apps/webapp/.env.local.');
    process.exit(1);
  }
  const projectRef = getProjectRef(target.url);

  console.log(`🚀 Applying demo SQL to TARGET project only: ${projectRef}\n`);

  if (args.includes('--reset')) {
    await resetPublicSchema(projectRef, target.accessToken);
  }

  if (args.includes('--fix-grants')) {
    console.log('🔧 Restoring service_role default privileges (non-destructive, no SQL files touched)...');
    await grantServiceRoleDefaults(projectRef, target.accessToken);
    console.log('   done.\n');
    return;
  }

  if (!fs.existsSync(sqlDir)) {
    console.error(`❌ ${sqlDir} does not exist. Run \`npm run demo:generate-sql\` first.`);
    process.exit(1);
  }

  const files = getSqlFiles(sqlDir);
  console.log(`📄 Found ${files.length} file(s) in ${sqlDir}:`);
  files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
  console.log('');

  let totalStatements = 0;
  let executed = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    console.log(`📝 ${file}`);
    const sql = fs.readFileSync(path.join(sqlDir, file), 'utf-8');
    const statements = splitSqlStatements(sql);
    totalStatements += statements.length;

    for (let i = 0; i < statements.length; i++) {
      try {
        const result = await executeSql(projectRef, target.accessToken, statements[i]);
        if (result.skipped) {
          skipped++;
        } else {
          executed++;
        }
      } catch (error: any) {
        failed++;
        console.error(`   ❌ statement ${i + 1}/${statements.length} failed: ${error.message}`);
        console.error(`      ${statements[i].slice(0, 160)}...`);
      }
    }
    console.log(`   done (${statements.length} statement(s))\n`);
  }

  console.log('📊 Summary');
  console.log(`   Files:      ${files.length}`);
  console.log(`   Statements: ${totalStatements}`);
  console.log(`   Skipped (already existed): ${skipped}`);
  console.log(`   Executed:   ${executed}`);
  console.log(`   Failed:     ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some statements failed — review above. Safe to re-run (tables/data use IF NOT EXISTS / ON CONFLICT).');
    process.exit(1);
  }
  console.log('\n✅ Demo project schema + catalog data applied.');
}

main().catch((error: unknown) => {
  console.error(`\n❌ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
