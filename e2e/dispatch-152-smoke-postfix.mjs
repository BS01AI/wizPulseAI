// DISPATCH-152 post-fix smoke v6 — verify launch-readiness improvements
// Author: bs01ai
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_DIR = '/Users/bms/Work/CodeWork/AI-helper/core/docs/matrix-launch-readiness-2026-05-13/postfix-shots';
mkdirSync(OUT_DIR, { recursive: true });

const VARIANTS = ['sucre', 'luminous', 'editorial', 'wabi', 'urban'];

const PAGES = [
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
  { site: 'auth', id: 'login',        url: 'https://auth.wizpulseai.com/auth' },
  { site: 'db',   id: 'home',         url: 'https://dashboard.wizpulseai.com/' },
];

const VIEWPORT = { width: 1440, height: 900 };

(async () => {
  const browser = await chromium.launch();
  console.log(`v6 post-fix smoke: ${VARIANTS.length} × ${PAGES.length} = ${VARIANTS.length * PAGES.length} shots`);
  console.log(`output: ${OUT_DIR}\n`);

  for (const v of VARIANTS) {
    console.log(`--- ${v} ---`);
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'ja-JP' });
    const cookieBase = {
      value: v,
      domain: '.wizpulseai.com',
      path: '/',
      secure: true,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 86400 * 30,
    };
    await ctx.addCookies([
      { name: 'WIZPULSE_VARIANT', ...cookieBase },
      { name: 'MAGI_DESIGN_VARIANT', ...cookieBase },
    ]);

    for (const p of PAGES) {
      const out = resolve(OUT_DIR, `${v}__${p.site}-${p.id}.png`);
      const tab = await ctx.newPage();
      try {
        const r = await tab.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await tab.waitForTimeout(4000);
        await tab.screenshot({ path: out, fullPage: true });
        const dv = await tab.evaluate(() => document.documentElement.getAttribute('data-variant') || 'null');
        console.log(`  ${p.site}-${p.id.padEnd(15)} dv="${dv}" http=${r?.status()}`);
      } catch (e) {
        console.warn(`  ${p.site}-${p.id.padEnd(15)} FAIL: ${e.message.slice(0, 60)}`);
      }
      await tab.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log('\ndone');
})();
