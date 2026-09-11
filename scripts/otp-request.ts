import { chromium } from 'playwright';

const BASE = 'https://midwestea-git-staging-alex-bensons-projects.vercel.app';

async function main() {
  const email = process.argv[2];
  if (!email) throw new Error('Usage: otp-request.ts <email>');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${BASE}/student/login`);
  await page.getByRole('textbox').first().fill(email);
  await page.getByRole('button', { name: /send|continue|log in/i }).first().click();
  await page.waitForTimeout(2500);
  console.log('url after submit:', page.url());
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
