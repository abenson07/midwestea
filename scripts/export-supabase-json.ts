/**
 * Export source Supabase database tables to JSON files (Plan 10 safety backup).
 *
 * Usage:
 *   npm run export:supabase-json
 *   npm run export:supabase-json -- --output backups/my-export
 *
 * Reads unprefixed Supabase vars (old / source project) from .env.local.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  getProjectRef,
  getSupabaseCredentials,
} from './lib/migration-env';

const PAGE_SIZE = 1000;

const KNOWN_PUBLIC_TABLES = [
  'courses',
  'classes',
  'students',
  'enrollments',
  'transactions',
  'waitlist',
  'logs',
  'admins',
  'invoices_to_import',
  'email_logs',
];

function loadEnv() {
  const candidates = [
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../apps/webapp/.env.local'),
    path.resolve(__dirname, '../.env'),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  }
}

function defaultOutputDir(projectRef: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return path.resolve(__dirname, `../backups/supabase-export-${projectRef}-${stamp}`);
}

async function discoverPublicTables(
  url: string,
  serviceRoleKey: string,
  supabase: SupabaseClient
): Promise<string[]> {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (accessToken) {
    try {
      const projectRef = getProjectRef(url);
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            query: `
              SELECT table_name
              FROM information_schema.tables
              WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
              ORDER BY table_name;
            `,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const rows = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        const names = rows
          .map((row: { table_name?: string }) => row.table_name)
          .filter((name): name is string => typeof name === 'string');

        if (names.length > 0) {
          return names;
        }
      }
    } catch {
      // fall through
    }
  }

  try {
    const createHelper = `
      CREATE OR REPLACE FUNCTION list_public_tables()
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE result json;
      BEGIN
        SELECT json_agg(table_name ORDER BY table_name)
        INTO result
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE';
        RETURN COALESCE(result, '[]'::json);
      END;
      $$;
    `;

    await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: createHelper }),
    });

    const { data, error } = await supabase.rpc('list_public_tables');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.filter((name): name is string => typeof name === 'string');
    }
  } catch {
    // fall through
  }

  console.warn(
    '  ⚠️  Could not auto-discover tables; using known table list.'
  );
  return KNOWN_PUBLIC_TABLES;
}

async function exportTable(
  supabase: SupabaseClient,
  tableName: string
): Promise<{ rows: Record<string, unknown>[]; rowCount: number }> {
  const rows: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, to);

    if (error) {
      throw new Error(`${tableName}: ${error.message}`);
    }

    const batch = data ?? [];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return { rows, rowCount: rows.length };
}

async function exportAuthUsers(
  supabase: SupabaseClient
): Promise<{ rows: Record<string, unknown>[]; rowCount: number }> {
  const rows: Record<string, unknown>[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });

    if (error) {
      throw new Error(`auth.users: ${error.message}`);
    }

    const users = data.users ?? [];
    rows.push(
      ...users.map((user) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        phone_confirmed_at: user.phone_confirmed_at,
        confirmed_at: user.confirmed_at,
        banned_until: user.banned_until,
        is_anonymous: user.is_anonymous,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
        identities: user.identities,
        factors: user.factors,
      }))
    );

    if (users.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return { rows, rowCount: rows.length };
}

async function main() {
  loadEnv();

  const args = process.argv.slice(2);
  const outputFlagIndex = args.indexOf('--output');
  const customOutput =
    outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : undefined;

  const { url, serviceRoleKey } = getSupabaseCredentials('source');
  const projectRef = getProjectRef(url);
  const outputDir = customOutput
    ? path.resolve(process.cwd(), customOutput)
    : defaultOutputDir(projectRef);

  fs.mkdirSync(outputDir, { recursive: true });

  console.log('Supabase JSON export (source / old project)\n');
  console.log(`  Project: ${projectRef}`);
  console.log(`  Output:  ${outputDir}\n`);

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tables = await discoverPublicTables(url, serviceRoleKey, supabase);
  console.log(`  Tables:  ${tables.join(', ')}\n`);

  const manifest: {
    exported_at: string;
    project_ref: string;
    source_url: string;
    tables: Record<string, { file: string; row_count: number }>;
    auth_users: { file: string; row_count: number };
  } = {
    exported_at: new Date().toISOString(),
    project_ref: projectRef,
    source_url: url,
    tables: {},
    auth_users: { file: 'auth_users.json', row_count: 0 },
  };

  for (const tableName of tables) {
    process.stdout.write(`  Exporting ${tableName}... `);
    try {
      const { rows, rowCount } = await exportTable(supabase, tableName);
      const fileName = `${tableName}.json`;
      fs.writeFileSync(
        path.join(outputDir, fileName),
        JSON.stringify(rows, null, 2),
        'utf-8'
      );
      manifest.tables[tableName] = { file: fileName, row_count: rowCount };
      console.log(`${rowCount} rows`);
    } catch (error) {
      console.log('skipped');
      console.warn(
        `    ⚠️  ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  process.stdout.write('  Exporting auth.users... ');
  try {
    const { rows, rowCount } = await exportAuthUsers(supabase);
    fs.writeFileSync(
      path.join(outputDir, 'auth_users.json'),
      JSON.stringify(rows, null, 2),
      'utf-8'
    );
    manifest.auth_users.row_count = rowCount;
    console.log(`${rowCount} rows`);
  } catch (error) {
    console.log('failed');
    console.warn(
      `    ⚠️  ${error instanceof Error ? error.message : String(error)}`
    );
  }

  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  console.log('\n✅ Export complete.');
  console.log(`   Manifest: ${path.join(outputDir, 'manifest.json')}`);
}

main().catch((error: unknown) => {
  console.error(
    `\n❌ Export failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
