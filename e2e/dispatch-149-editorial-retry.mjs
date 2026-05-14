// DISPATCH-149 editorial retry — looser wait conditions
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const OUT_DIR = '/Users/bms/Work/CodeWork/AI-helper/core/docs/matrix-themes-2026-05-11/production-smoke-v4-real-redesign';

const PAGES = [
  { id: 'main-home',    url: 'https://www.wizpulseai.com/ja' },
  { id: 'main-home-en', url: 'https://www.wizpulseai.com/en' },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ja-JP' });

  const cookieBase = {
    value: 'editorial', domain: '.wizpulseai.com', path: '/',
    httpOnly: false, secure: true, sameSite: 'Lax',
    expires: Math.floor(Date.now() / 1000) + 86400 * 30,
  };
  await ctx.addCookies([
    { name: 'WIZPULSE_VARIANT', ...cookieBase },
    { name: 'MAGI_DESIGN_VARIANT', ...cookieBase },
  ]);

  for (const p of PAGES) {
    const out = resolve(OUT_DIR, `editorial__${p.id}.png`);
    const tab = await ctx.newPage();
    try {
      // Looser wait: domcontentloaded instead of networkidle
      await tab.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await tab.waitForTimeout(6000); // more time for fonts + variant switch
      await tab.screenshot({ path: out, fullPage: true });
      const dv = await tab.evaluate(() => document.documentElement.getAttribute('data-variant'));
      console.log(`✓ editorial ${p.id} dv="${dv}"`);
    } catch (e) {
      console.warn(`✗ editorial ${p.id} FAIL: ${e.message.slice(0, 100)}`);
    }
    await tab.close();
  }

  await ctx.close();
  await browser.close();
})();
