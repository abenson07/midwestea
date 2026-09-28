import { chromium } from 'playwright';

const BASE = 'https://midwestea-git-staging-alex-bensons-projects.vercel.app';

async function main() {
  const configPath = process.argv[2];
  if (!configPath) throw new Error('Usage: email-shoot.ts <config.json>');
  const config = JSON.parse(require('fs').readFileSync(configPath, 'utf-8')) as {
    template: string;
    classId?: string;
    fields: Record<string, string>;
    out: string;
  };

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  await page.goto(`${BASE}/dev/email-preview`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const byLabel = (text: string) => page.locator(`label:text-is("${text}")`).locator('xpath=following-sibling::*[1]');

  await byLabel('Email template').selectOption(config.template);
  await page.waitForTimeout(800);

  if (config.classId) {
    await byLabel('Class').selectOption(config.classId);
    await page.waitForTimeout(800);
  }

  for (const [label, value] of Object.entries(config.fields)) {
    const field = byLabel(label);
    if (await field.count()) {
      await field.fill(value);
    } else {
      console.log(`  (field not found, skipped): ${label}`);
    }
  }

  await page.waitForTimeout(1500);

  const iframe = page.locator('iframe').first();
  const box = await iframe.boundingBox();
  if (box) {
    await page.screenshot({ path: config.out, clip: box });
  } else {
    await page.screenshot({ path: config.out, fullPage: true });
  }
  console.log('saved', config.out);
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
