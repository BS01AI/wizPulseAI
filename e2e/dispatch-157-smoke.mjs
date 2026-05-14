import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT = '/Users/bms/Work/CodeWork/AI-helper/core/docs/kh-work-rename-smoke-2026-05-13';
mkdirSync(OUT, { recursive: true });

const LOCALES = [
  { code: 'ja',    pw: 'ja-JP' },
  { code: 'en',    pw: 'en-US' },
  { code: 'zh-TW', pw: 'zh-TW' },
  { code: 'ar',    pw: 'ar-SA' },
];
const PAGES = [
  { id: 'trio',  path: '/knowledge-hub' },
  { id: 'work',  path: '/knowledge-hub/work' },
];

(async () => {
  const browser = await chromium.launch();
  for (const loc of LOCALES) {
    console.log(`--- ${loc.code} ---`);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: loc.pw });
    for (const p of PAGES) {
      const url = `https://www.wizpulseai.com/${loc.code}${p.path}`;
      const out = resolve(OUT, `${loc.code}__${p.id}.png`);
      const tab = await ctx.newPage();
      try {
        const r = await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await tab.waitForTimeout(3500);
        await tab.screenshot({ path: out, fullPage: true });
        console.log(`  ${p.id.padEnd(8)} http=${r?.status()}`);
      } catch(e) { console.warn('FAIL', e.message); }
      await tab.close();
    }
    await ctx.close();
  }
  await browser.close();
})();
