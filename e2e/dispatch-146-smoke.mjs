// DISPATCH-146 production smoke: 5 variants × 6 pages = 30 real screenshots
// Author: bs01ai

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_DIR = '/Users/bms/Work/CodeWork/AI-helper/core/docs/matrix-themes-2026-05-11/production-smoke';

const VARIANTS = ['sucre', 'luminous', 'editorial', 'wabi', 'urban'];

const PAGES = [
  // Fashion (magicoord) — primary user surface
  { id: 'fashion-home', url: 'https://magicoord.wizpulseai.com/ja' },
  { id: 'fashion-community', url: 'https://magicoord.wizpulseai.com/ja/fashion/community' },
  { id: 'fashion-chat-mika', url: 'https://magicoord.wizpulseai.com/ja/fashion/chat/mika' },
  // Other 3 sites — matrix consistency check
  { id: 'main-home', url: 'https://www.wizpulseai.com/ja' },
  { id: 'auth-login', url: 'https://auth.wizpulseai.com/login' },
  { id: 'dashboard-home', url: 'https://dashboard.wizpulseai.com/ja' }, // unauth landing (or redirect)
];

const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT = 25000;
const SETTLE_MS = 2500; // wait fonts/images after networkidle

mkdirSync(OUT_DIR, { recursive: true });

async function shoot(variant) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'ja-JP',
  });

  // Set BOTH cookies — variants read either depending on site
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
      await tab.goto(page.url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT });
      await tab.waitForTimeout(SETTLE_MS);
      await tab.screenshot({ path: out, fullPage: true });
      const dataVariant = await tab.evaluate(() => document.documentElement.getAttribute('data-variant'));
      console.log(`✓ ${variant.padEnd(10)} ${page.id.padEnd(20)} -> data-variant="${dataVariant}"`);
    } catch (e) {
      console.warn(`✗ ${variant.padEnd(10)} ${page.id.padEnd(20)} FAIL: ${e.message.slice(0, 80)}`);
    }
    await tab.close();
  }

  await ctx.close();
  await browser.close();
}

(async () => {
  console.log(`DISPATCH-146 smoke: ${VARIANTS.length} variants × ${PAGES.length} pages = ${VARIANTS.length * PAGES.length} shots`);
  console.log(`Output: ${OUT_DIR}`);
  console.log('');
  for (const v of VARIANTS) {
    console.log(`--- variant: ${v} ---`);
    await shoot(v);
  }
  console.log('');
  console.log('done');
})();
