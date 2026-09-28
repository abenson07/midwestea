import { chromium } from 'playwright';

const BASE = 'https://midwestea-git-staging-alex-bensons-projects.vercel.app';

async function main() {
  const [email, code, stateOut] = process.argv.slice(2);
  if (!email || !code || !stateOut) throw new Error('Usage: otp-verify.ts <email> <code> <stateOutPath>');
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/student/otp?email=${encodeURIComponent(email)}`);
  await page.waitForTimeout(1000);
  // 8-digit code, likely one input or several single-digit inputs — try single input first.
  const inputs = await page.getByRole('textbox').all();
  if (inputs.length === 1) {
    await inputs[0].fill(code);
  } else {
    for (let i = 0; i < inputs.length && i < code.length; i++) {
      await inputs[i].fill(code[i]);
    }
  }
  await page.waitForTimeout(300);
  const verifyBtn = page.getByRole('button', { name: /verify|continue|log in|submit/i }).first();
  if (await verifyBtn.count()) await verifyBtn.click();
  await page.waitForTimeout(3000);
  console.log('url after verify:', page.url());
  await context.storageState({ path: stateOut });
  console.log('saved state to', stateOut);
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
