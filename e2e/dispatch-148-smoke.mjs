// DISPATCH-148 production smoke v3: matrix 3 站 + 主公の核心 verify pages
// Author: bs01ai
//
// 主公 brief Phase 5: matrix 主站 3+ pages (home / about / KH index / KH article)
// + ✅ check 5 variant で visually 変化する

import { chromium } from 'playwright';
import { mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_DIR = '/Users/bms/Work/CodeWork/AI-helper/core/docs/matrix-themes-2026-05-11/production-smoke-v3-authed';

const VARIANTS = ['sucre', 'luminous', 'editorial', 'wabi', 'urban'];

const PAGES = [
  // 主公 explicit check pages (Phase 5)
  { id: 'main-home',          url: 'https://www.wizpulseai.com/ja' },
  { id: 'main-about',         url: 'https://www.wizpulseai.com/ja/about' },
  { id: 'main-kh-index',      url: 'https://www.wizpulseai.com/ja/knowledge-hub' },
  // Pick a KH article — pick most common slug, fallback to first if 404
  { id: 'main-kh-article',    url: 'https://www.wizpulseai.com/ja/knowledge-hub/basics/ai-ethics' },
  // Matrix 3 sites + fashion home (re-verify)
  { id: 'auth-login',         url: 'https://auth.wizpulseai.com/auth?view=sign_in' },
  { id: 'dashboard-home',     url: 'https://dashboard.wizpulseai.com/' },
  { id: 'fashion-home',       url: 'https://magicoord.wizpulseai.com/ja' },
];

const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT = 30000;
const SETTLE_MS = 2500;

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
      await tab.goto(page.url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT });
      await tab.waitForTimeout(SETTLE_MS);
      await tab.screenshot({ path: out, fullPage: true });
      const dv = await tab.evaluate(() => document.documentElement.getAttribute('data-variant'));
      const status = tab.url().includes('not-found') || tab.url().includes('404') ? '404?' : 'ok';
      console.log(`${status === 'ok' ? '✓' : '⚠'} ${variant.padEnd(10)} ${page.id.padEnd(20)} dv="${dv}" ${status}`);
    } catch (e) {
      console.warn(`✗ ${variant.padEnd(10)} ${page.id.padEnd(20)} FAIL: ${e.message.slice(0, 80)}`);
    }
    await tab.close();
  }

  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  console.log(`DISPATCH-148 smoke v3: ${VARIANTS.length} × ${PAGES.length} = ${VARIANTS.length * PAGES.length} shots`);
  console.log(`output: ${OUT_DIR}`);
  console.log('');

  for (const v of VARIANTS) {
    console.log(`--- variant: ${v} ---`);
    await shoot(browser, v);
  }

  await browser.close();
  console.log('\ndone');
})();
