// DISPATCH-150 production smoke v5: 5 variants × 4 pages mockup-faithful verify
// Author: bs01ai
// Pages: home (149 done), about (150), KH index (150), KH article (150 + cookie fix)

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_DIR = '/Users/bms/Work/CodeWork/AI-helper/core/docs/matrix-themes-2026-05-11/production-smoke-v5-final-rollout';

const VARIANTS = ['sucre', 'luminous', 'editorial', 'wabi', 'urban'];

const PAGES = [
  { id: 'home',       url: 'https://www.wizpulseai.com/ja' },
  { id: 'about',      url: 'https://www.wizpulseai.com/ja/about' },
  { id: 'kh-index',   url: 'https://www.wizpulseai.com/ja/knowledge-hub' },
  { id: 'kh-article', url: 'https://www.wizpulseai.com/ja/knowledge-hub/magicoord-how-to-use' },
];

const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT = 45000;
const SETTLE_MS = 4000;

mkdirSync(OUT_DIR, { recursive: true });

async function shoot(browser, variant) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'ja-JP' });

  const cookieBase = {
    value: variant,
    domain: '.wizpulseai.com',
    path: '/',
    httpOnly: false,
    secure: true,
    sameSite: 'Lax',
    expires: Math.floor(Date.now() / 1000) + 86400 * 30,
  };
  await ctx.addCookies([
    { name: 'WIZPULSE_VARIANT', ...cookieBase },
    { name: 'MAGI_DESIGN_VARIANT', ...cookieBase },
  ]);

  for (const page of PAGES) {
    const out = resolve(OUT_DIR, `${variant}__${page.id}.png`);
    const tab = await ctx.newPage();
    try {
      await tab.goto(page.url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await tab.waitForTimeout(SETTLE_MS);
      await tab.screenshot({ path: out, fullPage: true });
      const dv = await tab.evaluate(() => document.documentElement.getAttribute('data-variant'));
      console.log(`✓ ${variant.padEnd(10)} ${page.id.padEnd(20)} dv="${dv}"`);
    } catch (e) {
      console.warn(`✗ ${variant.padEnd(10)} ${page.id.padEnd(20)} FAIL: ${e.message.slice(0, 80)}`);
    }
    await tab.close();
  }

  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  console.log(`DISPATCH-150 smoke v5: ${VARIANTS.length} × ${PAGES.length} = ${VARIANTS.length * PAGES.length} shots`);
  console.log(`output: ${OUT_DIR}`);
  console.log('');

  for (const v of VARIANTS) {
    console.log(`--- variant: ${v} ---`);
    await shoot(browser, v);
  }

  await browser.close();
  console.log('\ndone');
})();
