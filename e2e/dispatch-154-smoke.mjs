// DISPATCH-154 KH 3-zone smoke verify
// Author: bs01ai
// Pages: /knowledge-hub (EntranceTrio) + /life + /tech + /pulse-park × 4 locale = 16 shots
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_DIR = '/Users/bms/Work/CodeWork/AI-helper/core/docs/kh-3zone-smoke-2026-05-13';
mkdirSync(OUT_DIR, { recursive: true });

const LOCALES = [
  { code: 'ja',    pwLocale: 'ja-JP' },
  { code: 'en',    pwLocale: 'en-US' },
  { code: 'zh-TW', pwLocale: 'zh-TW' },
  { code: 'ar',    pwLocale: 'ar-SA' },
];

const PAGES = [
  { id: 'trio',       path: '/knowledge-hub' },
  { id: 'life',       path: '/knowledge-hub/life' },
  { id: 'tech',       path: '/knowledge-hub/tech' },
  { id: 'pulse-park', path: '/knowledge-hub/pulse-park' },
];

const VIEWPORT = { width: 1440, height: 900 };

(async () => {
  const browser = await chromium.launch();
  console.log(`KH 3-zone smoke: ${LOCALES.length} locales × ${PAGES.length} pages = ${LOCALES.length * PAGES.length} shots\n`);

  for (const loc of LOCALES) {
    console.log(`--- ${loc.code} ---`);
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: loc.pwLocale });
    for (const p of PAGES) {
      const url = `https://www.wizpulseai.com/${loc.code}${p.path}`;
      const out = resolve(OUT_DIR, `${loc.code}__${p.id}.png`);
      const tab = await ctx.newPage();
      try {
        const r = await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await tab.waitForTimeout(4000);
        await tab.screenshot({ path: out, fullPage: true });
        console.log(`  ${p.id.padEnd(12)} http=${r?.status()}`);
      } catch (e) {
        console.warn(`  ${p.id.padEnd(12)} FAIL: ${e.message.slice(0, 60)}`);
      }
      await tab.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log('\ndone');
})();
