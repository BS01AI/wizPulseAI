// DISPATCH-152 launch-readiness audit smoke
// Author: bs01ai
// Scope: matrix sites (除 magicoord) — main www / auth / dashboard / dino-kids
// 5 variants × N pages、ja primary、Playwright fullPage capture

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_DIR = '/Users/bms/Work/CodeWork/AI-helper/core/docs/matrix-launch-readiness-2026-05-13/audit-shots';
mkdirSync(OUT_DIR, { recursive: true });

const VARIANTS = ['sucre', 'luminous', 'editorial', 'wabi', 'urban'];

// Pages with variant support (matrix sites)
const VARIANT_PAGES = [
  // main www (11)
  { site: 'main', id: 'home',         url: 'https://www.wizpulseai.com/ja' },
  { site: 'main', id: 'about',        url: 'https://www.wizpulseai.com/ja/about' },
  { site: 'main', id: 'pricing',      url: 'https://www.wizpulseai.com/ja/pricing' },
  { site: 'main', id: 'life',         url: 'https://www.wizpulseai.com/ja/life' },
  { site: 'main', id: 'biz',          url: 'https://www.wizpulseai.com/ja/biz' },
  { site: 'main', id: 'products',     url: 'https://www.wizpulseai.com/ja/products' },
  { site: 'main', id: 'kh-index',     url: 'https://www.wizpulseai.com/ja/knowledge-hub' },
  { site: 'main', id: 'kh-article',   url: 'https://www.wizpulseai.com/ja/knowledge-hub/magicoord-how-to-use' },
  { site: 'main', id: 'contact',      url: 'https://www.wizpulseai.com/ja/contact' },
  { site: 'main', id: 'faq',          url: 'https://www.wizpulseai.com/ja/faq' },
  { site: 'main', id: 'tokusho',      url: 'https://www.wizpulseai.com/ja/about/tokusho' },
  // auth (1 + login + signup tab is same URL)
  { site: 'auth', id: 'login',        url: 'https://auth.wizpulseai.com/auth' },
  // dashboard public landing
  { site: 'db',   id: 'home',         url: 'https://dashboard.wizpulseai.com/' },
];

// dino-kids: no variant, just functional capture
const DINO_PAGE = { site: 'dino', id: 'home', url: 'https://dino-kids-app.vercel.app/' };

const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT = 45000;
const SETTLE_MS = 4000;

async function shootVariant(browser, variant) {
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

  for (const page of VARIANT_PAGES) {
    const out = resolve(OUT_DIR, `${variant}__${page.site}-${page.id}.png`);
    const tab = await ctx.newPage();
    let dv = 'N/A';
    let httpStatus = 0;
    try {
      const resp = await tab.goto(page.url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      httpStatus = resp ? resp.status() : 0;
      await tab.waitForTimeout(SETTLE_MS);
      await tab.screenshot({ path: out, fullPage: true });
      dv = await tab.evaluate(() => document.documentElement.getAttribute('data-variant') || 'null');
      console.log(`✓ ${variant.padEnd(10)} ${page.site.padEnd(5)} ${page.id.padEnd(15)} dv="${dv}" http=${httpStatus}`);
    } catch (e) {
      console.warn(`✗ ${variant.padEnd(10)} ${page.site.padEnd(5)} ${page.id.padEnd(15)} FAIL: ${e.message.slice(0, 80)}`);
    }
    await tab.close();
  }

  await ctx.close();
}

async function shootDino(browser) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'ja-JP' });
  for (const langSuffix of ['', '?lang=ja', '?lang=en', '?lang=zh-CN']) {
    const url = DINO_PAGE.url + langSuffix;
    const lang = langSuffix.replace('?lang=', '') || 'default';
    const out = resolve(OUT_DIR, `dino-${lang}.png`);
    const tab = await ctx.newPage();
    try {
      const resp = await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await tab.waitForTimeout(SETTLE_MS);
      await tab.screenshot({ path: out, fullPage: true });
      console.log(`✓ dino       ${lang.padEnd(15)} http=${resp?.status()}`);
    } catch (e) {
      console.warn(`✗ dino       ${lang.padEnd(15)} FAIL: ${e.message.slice(0, 80)}`);
    }
    await tab.close();
  }
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  console.log(`DISPATCH-152 audit: ${VARIANTS.length} variants × ${VARIANT_PAGES.length} pages = ${VARIANTS.length * VARIANT_PAGES.length} shots + dino × 4 lang`);
  console.log(`output: ${OUT_DIR}`);
  console.log('');

  for (const v of VARIANTS) {
    console.log(`--- variant: ${v} ---`);
    await shootVariant(browser, v);
  }

  console.log(`--- dino-kids ---`);
  await shootDino(browser);

  await browser.close();
  console.log(`\ndone. total expected shots: ${VARIANTS.length * VARIANT_PAGES.length + 4}`);
})();
