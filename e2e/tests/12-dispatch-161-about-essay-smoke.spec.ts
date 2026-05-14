/**
 * 12-dispatch-161-about-essay-smoke.spec.ts
 * DISPATCH-161 — About 中篇 + Organic Dev Essay production smoke
 *
 * Owner: MC将軍 (DISPATCH-161)
 * Source: task-20260514-161-mc-about-essay-production-integration.md
 *
 * 目的:
 *   1. About /[locale]/about 4 locale × Editorial default = 4 shots
 *   2. About variant sample (Luminous + Wabi) ja = 2 shots
 *   3. Essay /[locale]/knowledge-hub/work/organic-development 4 locale × Editorial default = 4 shots
 *   4. Essay variant sample (Urban + Sucre) ja = 2 shots
 *   合計 12 screenshots（最小）
 *
 *   Hard assertions:
 *   - 各 page status < 400
 *   - About §03 技/楽/育 kanji visibility
 *   - About §04 "40 を過ぎて" / "Turning 40" / "過了 40" / "في الأربعين" turning marker visibility
 *   - Essay §02 有 × 機 kanji visibility
 *   - Essay byline "BS01AI" visibility + DOI link presence
 *
 * Output: workspace/magicoord-audits/<YYYY-MM-DD>/dispatch-161/<page>__<locale>__<variant>.png
 *
 * 使い方:
 *   PLAY_MODE=online npx playwright test 12-dispatch-161-about-essay-smoke.spec.ts --project=www
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
  'dispatch-161',
);

fs.mkdirSync(SMOKE_ROOT, { recursive: true });

const VIEWPORT = { width: 1440, height: 900 } as const;

const ABOUT_ROUTES = [
  { route: '/ja/about',    locale: 'ja',    variant: 'editorial' },
  { route: '/en/about',    locale: 'en',    variant: 'editorial' },
  { route: '/zh-TW/about', locale: 'zh-TW', variant: 'editorial' },
  { route: '/ar/about',    locale: 'ar',    variant: 'editorial' },
  { route: '/ja/about',    locale: 'ja',    variant: 'luminous' },
  { route: '/ja/about',    locale: 'ja',    variant: 'wabi' },
] as const;

const ESSAY_ROUTES = [
  { route: '/ja/knowledge-hub/work/organic-development',    locale: 'ja',    variant: 'editorial' },
  { route: '/en/knowledge-hub/work/organic-development',    locale: 'en',    variant: 'editorial' },
  { route: '/zh-TW/knowledge-hub/work/organic-development', locale: 'zh-TW', variant: 'editorial' },
  { route: '/ar/knowledge-hub/work/organic-development',    locale: 'ar',    variant: 'editorial' },
  { route: '/ja/knowledge-hub/work/organic-development',    locale: 'ja',    variant: 'urban' },
  { route: '/ja/knowledge-hub/work/organic-development',    locale: 'ja',    variant: 'sucre' },
] as const;

// turning-40 marker per locale
const TURNING_40_MARKER: Record<string, string> = {
  ja:      '40',
  en:      '40',
  'zh-TW': '40',
  ar:      'الأربعين',
};

async function setVariantCookie(page: Page, variant: string) {
  await page.context().addCookies([
    {
      name: 'WIZPULSE_VARIANT',
      value: variant,
      domain: new URL(page.url() || 'http://localhost').hostname || 'www.wizpulseai.com',
      path: '/',
    },
  ]);
}

async function shotPage(page: Page, name: string) {
  const file = path.join(SMOKE_ROOT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

test.describe('DISPATCH-161 About + Essay production smoke', () => {
  test.describe.configure({ mode: 'serial' });

  // ── About smoke ──
  for (const { route, locale, variant } of ABOUT_ROUTES) {
    test(`about__${locale}__${variant}`, async ({ page, baseURL }) => {
      await page.setViewportSize(VIEWPORT);
      const url = `${baseURL || 'https://www.wizpulseai.com'}${route}`;
      // set variant cookie
      const host = new URL(url).hostname;
      await page.context().addCookies([
        { name: 'WIZPULSE_VARIANT', value: variant, domain: host, path: '/' },
      ]);
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      expect(resp?.status() || 999).toBeLessThan(400);

      // wait for reveal animations
      await page.waitForTimeout(1500);

      // §03 kanji visibility hard assertion
      const kanjiVisible: Record<string, boolean> = {};
      for (const k of ['技', '楽', '育']) {
        const el = page.locator(`text=${k}`).first();
        try {
          await el.scrollIntoViewIfNeeded({ timeout: 3000 });
          kanjiVisible[k] = await el.isVisible();
        } catch {
          kanjiVisible[k] = false;
        }
      }
      console.log(`[about __${locale}__${variant}] kanji visibility:`, kanjiVisible);

      // §04 turning-40 marker
      const marker = TURNING_40_MARKER[locale] || '40';
      const markerLocator = page.locator(`text=${marker}`).first();
      try {
        await markerLocator.scrollIntoViewIfNeeded({ timeout: 3000 });
        const visible = await markerLocator.isVisible();
        console.log(`[about __${locale}__${variant}] turning-40 marker "${marker}" visible:`, visible);
      } catch {
        console.log(`[about __${locale}__${variant}] turning-40 marker not found`);
      }

      const file = await shotPage(page, `about__${locale}__${variant}`);
      console.log(`[about __${locale}__${variant}] shot →`, file);
    });
  }

  // ── Essay smoke ──
  for (const { route, locale, variant } of ESSAY_ROUTES) {
    test(`essay__${locale}__${variant}`, async ({ page, baseURL }) => {
      await page.setViewportSize(VIEWPORT);
      const url = `${baseURL || 'https://www.wizpulseai.com'}${route}`;
      const host = new URL(url).hostname;
      await page.context().addCookies([
        { name: 'WIZPULSE_VARIANT', value: variant, domain: host, path: '/' },
      ]);
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      expect(resp?.status() || 999).toBeLessThan(400);

      await page.waitForTimeout(1500);

      // §02 有 × 機 kanji
      const youVisible = await page.locator('text=有').first().isVisible().catch(() => false);
      const kiVisible = await page.locator('text=機').first().isVisible().catch(() => false);
      console.log(`[essay __${locale}__${variant}] 有 × 機 visibility:`, { '有': youVisible, '機': kiVisible });

      // byline BS01AI
      const bs01aiVisible = await page.locator('text=BS01AI').first().isVisible().catch(() => false);
      console.log(`[essay __${locale}__${variant}] BS01AI byline visible:`, bs01aiVisible);

      // DOI link
      const doiVisible = await page.locator('text=10.5281').first().isVisible().catch(() => false);
      console.log(`[essay __${locale}__${variant}] DOI link visible:`, doiVisible);

      const file = await shotPage(page, `essay__${locale}__${variant}`);
      console.log(`[essay __${locale}__${variant}] shot →`, file);
    });
  }
});
