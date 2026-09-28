import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'https://midwestea-git-staging-alex-bensons-projects.vercel.app';

async function main() {
  const [statePathArg, urlPath, outPath] = process.argv.slice(2);
  if (!urlPath || !outPath) throw new Error('Usage: shoot.ts <stateJsonOrNone> <url-path> <out.png>');
  const statePath = statePathArg && statePathArg !== 'none' ? statePathArg : undefined;
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    storageState: statePath && fs.existsSync(statePath) ? statePath : undefined,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}${urlPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('saved', outPath, 'from', page.url());
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
