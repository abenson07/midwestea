/**
 * Validate source + migration-target Supabase env vars before Plan 10 work.
 *
 * Usage:
 *   npm run migration:check-env
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import {
  getProjectRef,
  getSupabaseCredentials,
} from './lib/migration-env';

const envCandidates = [
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../apps/webapp/.env.local'),
  path.resolve(__dirname, '../.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

async function ping(label: string, url: string, serviceRoleKey: string) {
  const response = await fetch(`${url}/auth/v1/health`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${label}: HTTP ${response.status}`);
  }

  console.log(`  ✅ ${label} — connected (${getProjectRef(url)})`);
}

async function main() {
  console.log('Plan 10 — migration env check\n');

  const source = getSupabaseCredentials('source');
  const target = getSupabaseCredentials('target');

  console.log('Variables:');
  console.log(`  Source URL:  ${getProjectRef(source.url)}`);
  console.log(`  Target URL:  ${getProjectRef(target.url)}`);
  console.log(
    `  Source access token: ${source.accessToken ? 'set' : 'missing (optional)'}`
  );
  console.log(
    `  Target access token: ${target.accessToken ? 'set' : 'missing (optional)'}`
  );
  console.log('');

  if (getProjectRef(source.url) === getProjectRef(target.url)) {
    console.error(
      '❌ Source and target resolve to the same Supabase project ref.'
    );
    process.exit(1);
  }

  console.log('Connectivity:');
  await ping('Source (old)', source.url, source.serviceRoleKey);
  await ping('Target (new)', target.url, target.serviceRoleKey);

  console.log('\n✅ Ready for migration scripts.');
}

main().catch((error: unknown) => {
  console.error(
    `\n❌ ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
