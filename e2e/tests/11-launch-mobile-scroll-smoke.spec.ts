/**
 * 11-launch-mobile-scroll-smoke.spec.ts
 * DISPATCH-160 P1-5/P1-6 — Mobile responsive + WhatWeDo scroll-trigger smoke
 *
 * Owner: MC将軍 (DISPATCH-160 P1)
 * Source: task-20260514-160-mc-about-essay-production-master.md
 *
 * 目的:
 *   1. P1-5 Mobile responsive: launch P0 page × 3 viewport (375/768/1440) で visual + visibility 確認
 *   2. P1-6 WhatWeDo scroll-trigger smoke v2: home page kanji 「技/楽/育」 reveal 後 visible 確認
 *
 * Output: workspace/magicoord-audits/<YYYY-MM-DD>/launch-smoke/<page>__<viewport>.png
 *
 * 使い方:
 *   PLAY_MODE=online npx playwright test 11-launch-mobile-scroll-smoke.spec.ts --project=www
 */
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SMOKE_DATE = process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10);
const SMOKE_ROOT = path.resolve(
  __dirname,
  '..',
  '..',
  'workspace',
  'magicoord-audits',
  SMOKE_DATE,
  'launch-smoke',
);

fs.mkdirSync(SMOKE_ROOT, { recursive: true });

// ───────────────────────────────────────────────────────────────
// Launch P0 page list (ja locale × editorial default variant)
// ───────────────────────────────────────────────────────────────

const LAUNCH_PAGES = [
  { route: '/ja',                          label: 'home' },
  { route: '/ja/knowledge-hub',            label: 'kh-trio' },
  { route: '/ja/knowledge-hub/work',       label: 'kh-work' },
  { route: '/ja/knowledge-hub/life',       label: 'kh-life' },
  { route: '/ja/knowledge-hub/pulse-park', label: 'kh-pulse-park' },
] as const;

// 3 viewport coverage: iPhone SE / tablet / laptop
const VIEWPORTS = [
  { name: 'mobile-375',  width: 375,  height: 812 },  // iPhone SE / Mini
  { name: 'tablet-768',  width: 768,  height: 1024 }, // iPad portrait
  { name: 'laptop-1440', width: 1440, height: 900 },  // laptop / desktop baseline
] as const;

// ───────────────────────────────────────────────────────────────
// Helper: hit page with editorial default + screenshot
// ───────────────────────────────────────────────────────────────

async function smokePage(
  page: Page,
  baseURL: string,
  route: string,
  label: string,
  vp: typeof VIEWPORTS[number],
): Promise<{ ok: boolean; status: number | null; error: string | null }> {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  const url = `${baseURL}${route}`;
  const fileName = `${label}__${vp.name}.png`;
  const out = path.join(SMOKE_ROOT, fileName);

  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25_000 });
    const status = resp?.status() ?? null;
    try {
      await page.waitForLoadState('networkidle', { timeout: 12_000 });
    } catch { /* tolerate long-tail */ }
    // additional time for hydration / images / font-display swap
    await page.waitForTimeout(1500);
    await page.screenshot({ path: out, fullPage: true });
    return { ok: (status ?? 999) < 400, status, error: null };
  } catch (e: any) {
    try {
      await page.screenshot({ path: out, fullPage: false });
    } catch { /* ignore */ }
    return { ok: false, status: null, error: String(e?.message || e).slice(0, 300) };
  }
}

// ───────────────────────────────────────────────────────────────
// P1-5: Mobile responsive smoke (5 page × 3 viewport = 15 shots)
// ───────────────────────────────────────────────────────────────

test.describe('DISPATCH-160 P1-5: mobile responsive launch smoke', () => {
  test.skip(({ baseURL }) =>
    !baseURL?.includes('www.wizpulseai.com') && !baseURL?.includes('www.local.wiz'),
    'www project only',
  );

  for (const p of LAUNCH_PAGES) {
    for (const vp of VIEWPORTS) {
      test(`smoke ${p.label} @ ${vp.name}`, async ({ page, baseURL }) => {
        test.setTimeout(60_000);
        const result = await smokePage(page, baseURL!, p.route, p.label, vp);
        if (!result.ok) {
          console.log(
            `[FAIL] ${p.label}@${vp.name} status=${result.status} error=${result.error}`,
          );
        }
        // soft assertion — record failure but capture screenshot regardless
        expect(result.status, `HTTP status ${p.route}@${vp.name}`).toBeLessThan(400);
      });
    }
  }
});

// ───────────────────────────────────────────────────────────────
// P1-6: WhatWeDo scroll-trigger smoke v2 — verify 技/楽/育 visible
// ───────────────────────────────────────────────────────────────

test.describe('DISPATCH-160 P1-6: WhatWeDo kanji visible smoke v2', () => {
  test.skip(({ baseURL }) =>
    !baseURL?.includes('www.wizpulseai.com') && !baseURL?.includes('www.local.wiz'),
    'www project only',
  );

  const KANJI = ['技', '楽', '育'] as const;

  test('home /ja — WhatWeDo 技/楽/育 visible after scroll', async ({ page, baseURL }) => {
    test.setTimeout(45_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseURL}/ja`, { waitUntil: 'domcontentloaded', timeout: 25_000 });
    try {
      await page.waitForLoadState('networkidle', { timeout: 12_000 });
    } catch { /* tolerate */ }
    await page.waitForTimeout(1000);

    // 1. Find a WhatWeDo section by kanji text; scroll into view
    const techLocator = page.locator('text=技').first();
    await techLocator.waitFor({ state: 'attached', timeout: 10_000 });
    await techLocator.scrollIntoViewIfNeeded({ timeout: 8_000 });

    // 2. Wait for intersection-observer reveal animation (framer-motion 0.6s + buffer)
    await page.waitForTimeout(1500);

    // 3. Assert all 3 kanji are visible in DOM
    const visibility: Record<string, boolean> = {};
    for (const k of KANJI) {
      const el = page.locator(`text=${k}`).first();
      visibility[k] = await el.isVisible().catch(() => false);
    }

    // 4. Screenshot at this scroll position (kanji should be in viewport)
    const out = path.join(SMOKE_ROOT, 'whatwedo-scroll-trigger__home-ja__laptop-1440.png');
    await page.screenshot({ path: out, fullPage: false });

    // 5. Also fullPage for full context
    const fullOut = path.join(SMOKE_ROOT, 'whatwedo-scroll-trigger__home-ja__fullpage.png');
    await page.screenshot({ path: fullOut, fullPage: true });

    console.log('[WhatWeDo visibility]', visibility);

    // hard assertion: all 3 must be visible
    for (const k of KANJI) {
      expect(visibility[k], `kanji ${k} should be visible after scroll`).toBe(true);
    }
  });

  test('home /ja — WhatWeDo 技/楽/育 visible @ mobile 375', async ({ page, baseURL }) => {
    test.setTimeout(45_000);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${baseURL}/ja`, { waitUntil: 'domcontentloaded', timeout: 25_000 });
    try {
      await page.waitForLoadState('networkidle', { timeout: 12_000 });
    } catch { /* tolerate */ }
    await page.waitForTimeout(1000);

    const techLocator = page.locator('text=技').first();
    await techLocator.waitFor({ state: 'attached', timeout: 10_000 });
    await techLocator.scrollIntoViewIfNeeded({ timeout: 8_000 });
    await page.waitForTimeout(1500);

    const visibility: Record<string, boolean> = {};
    for (const k of KANJI) {
      const el = page.locator(`text=${k}`).first();
      visibility[k] = await el.isVisible().catch(() => false);
    }

    const out = path.join(SMOKE_ROOT, 'whatwedo-scroll-trigger__home-ja__mobile-375.png');
    await page.screenshot({ path: out, fullPage: false });

    console.log('[WhatWeDo mobile visibility]', visibility);
    for (const k of KANJI) {
      expect(visibility[k], `kanji ${k} should be visible @ mobile 375`).toBe(true);
    }
  });
});
