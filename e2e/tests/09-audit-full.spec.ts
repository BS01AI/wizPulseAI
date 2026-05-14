/**
 * audit-full.spec.ts — magicoord + 矩阵 4 站 production baseline audit
 *
 * Owner: MC将軍 (DISPATCH-115)
 * Source: core/wisdom/mc-general/magicoord-pages.md
 * Output: workspace/magicoord-audits/<YYYY-MM-DD>/<site>__<route>__<locale>__<viewport>.png
 *
 * 使い方:
 *   PLAY_MODE=online npx playwright test 09-audit-full.spec.ts --project=www
 *
 * Note:
 *   - tests are split per project (auth/dashboard/www/magicoord) — each project's baseURL is used
 *   - mobile viewport is set per-test via page.setViewportSize
 *   - failures (404/timeout/error) are tolerated; we still want screenshots of broken pages
 */
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ───────────────────────────────────────────────────────────────
// Audit run config
// ───────────────────────────────────────────────────────────────

const AUDIT_DATE = process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10);
const AUDIT_ROOT = path.resolve(__dirname, '..', '..', 'workspace', 'magicoord-audits', AUDIT_DATE);

// ensure audit dir exists
function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

ensureDir(AUDIT_ROOT);

// ───────────────────────────────────────────────────────────────
// Page lists per project
// ───────────────────────────────────────────────────────────────

type Locale = 'ja' | 'en' | 'zh-TW' | 'ar';
const ALL_LOCALES: Locale[] = ['ja', 'en', 'zh-TW', 'ar'];
const JA_ONLY: Locale[] = ['ja'];

interface Route {
  path: string;        // e.g. '/{locale}' or '/auth'
  locales: Locale[];   // which locales to render
  pri: 'P0' | 'P1' | 'P2';
  label: string;       // human-readable
}

// ── magicoord (fashion) — public routes
const MAGICOORD_ROUTES: Route[] = [
  { path: '/{locale}',                               locales: ALL_LOCALES, pri: 'P0', label: 'home' },
  { path: '/{locale}/fashion',                       locales: ALL_LOCALES, pri: 'P0', label: 'fashion-entry' },
  { path: '/{locale}/fashion/onboarding',            locales: ALL_LOCALES, pri: 'P0', label: 'onboarding' },
  { path: '/{locale}/advisors',                      locales: ALL_LOCALES, pri: 'P0', label: 'advisors' },
  { path: '/{locale}/pricing',                       locales: ALL_LOCALES, pri: 'P0', label: 'pricing' },
  { path: '/{locale}/fashion/chat/mika',             locales: ALL_LOCALES, pri: 'P0', label: 'chat-mika' },
  { path: '/{locale}/fashion/chat/sofia',            locales: ALL_LOCALES, pri: 'P0', label: 'chat-sofia' },
  { path: '/{locale}/fashion/chat/rin',              locales: JA_ONLY,     pri: 'P1', label: 'chat-rin' },
  { path: '/{locale}/fashion/community',             locales: ALL_LOCALES, pri: 'P1', label: 'community' },
  { path: '/{locale}/fashion/premium-chat',          locales: ALL_LOCALES, pri: 'P1', label: 'premium-chat' },
  { path: '/{locale}/about',                         locales: JA_ONLY,     pri: 'P2', label: 'about' },
  { path: '/{locale}/about/privacy',                 locales: JA_ONLY,     pri: 'P2', label: 'about-privacy' },
  { path: '/{locale}/about/terms',                   locales: JA_ONLY,     pri: 'P2', label: 'about-terms' },
  { path: '/{locale}/faq',                           locales: JA_ONLY,     pri: 'P2', label: 'faq' },
  { path: '/{locale}/purchase/success',              locales: JA_ONLY,     pri: 'P2', label: 'purchase-success' },
  { path: '/{locale}/purchase/cancel',               locales: JA_ONLY,     pri: 'P2', label: 'purchase-cancel' },
  { path: '/{locale}/purchase/error',                locales: JA_ONLY,     pri: 'P2', label: 'purchase-error' },
  // auth-required redirect smoke
  { path: '/{locale}/fashion/history',               locales: JA_ONLY,     pri: 'P1', label: 'fashion-history-redirect' },
  { path: '/{locale}/fashion/settings',              locales: JA_ONLY,     pri: 'P1', label: 'fashion-settings-redirect' },
  { path: '/{locale}/fashion/chat/group',            locales: JA_ONLY,     pri: 'P1', label: 'chat-group-redirect' },
];

// ── www (主站) — public routes
const WWW_ROUTES: Route[] = [
  { path: '/{locale}',                               locales: ALL_LOCALES, pri: 'P0', label: 'home' },
  { path: '/{locale}/products',                      locales: ALL_LOCALES, pri: 'P0', label: 'products' },
  { path: '/{locale}/life',                          locales: ALL_LOCALES, pri: 'P0', label: 'life' },
  { path: '/{locale}/biz',                           locales: JA_ONLY,     pri: 'P1', label: 'biz' },
  { path: '/{locale}/about',                         locales: JA_ONLY,     pri: 'P1', label: 'about' },
  { path: '/{locale}/about/privacy',                 locales: JA_ONLY,     pri: 'P1', label: 'about-privacy' },
  { path: '/{locale}/about/terms',                   locales: JA_ONLY,     pri: 'P1', label: 'about-terms' },
  { path: '/{locale}/about/tokusho',                 locales: JA_ONLY,     pri: 'P1', label: 'about-tokusho' },
  { path: '/{locale}/about/refund',                  locales: JA_ONLY,     pri: 'P1', label: 'about-refund' },
  { path: '/{locale}/about/cancellation',            locales: JA_ONLY,     pri: 'P1', label: 'about-cancellation' },
  { path: '/{locale}/contact',                       locales: JA_ONLY,     pri: 'P1', label: 'contact' },
  { path: '/{locale}/faq',                           locales: JA_ONLY,     pri: 'P1', label: 'faq' },
  { path: '/{locale}/pricing',                       locales: JA_ONLY,     pri: 'P1', label: 'pricing' },
  { path: '/{locale}/support',                       locales: JA_ONLY,     pri: 'P1', label: 'support' },
  { path: '/{locale}/knowledge-hub',                 locales: ALL_LOCALES, pri: 'P0', label: 'kh-home' },
  { path: '/{locale}/knowledge-hub/basics',          locales: JA_ONLY,     pri: 'P1', label: 'kh-basics' },
  { path: '/{locale}/knowledge-hub/tutorials',       locales: JA_ONLY,     pri: 'P1', label: 'kh-tutorials' },
  { path: '/{locale}/knowledge-hub/market',          locales: JA_ONLY,     pri: 'P1', label: 'kh-market' },
  { path: '/{locale}/knowledge-hub/lifestyle',       locales: ALL_LOCALES, pri: 'P1', label: 'kh-lifestyle' },
  { path: '/{locale}/knowledge-hub/accessories-styling-guide-women', locales: ALL_LOCALES, pri: 'P0', label: 'kh-accessories-featured' },
  { path: '/{locale}/knowledge-hub/magicoord-how-to-use', locales: JA_ONLY, pri: 'P1', label: 'kh-magicoord-howto' },
  { path: '/{locale}/sitemap',                       locales: JA_ONLY,     pri: 'P2', label: 'sitemap' },
];

// ── auth — small, no locale prefix
const AUTH_ROUTES: Route[] = [
  { path: '/',                                       locales: JA_ONLY,     pri: 'P0', label: 'auth-root' },
  { path: '/auth',                                   locales: JA_ONLY,     pri: 'P0', label: 'auth-page' },
  { path: '/embed',                                  locales: JA_ONLY,     pri: 'P2', label: 'auth-embed' },
];

// ── dashboard — auth-required, smoke only (will redirect)
const DASHBOARD_ROUTES: Route[] = [
  { path: '/',                                       locales: JA_ONLY,     pri: 'P1', label: 'db-root' },
  { path: '/dashboard',                              locales: JA_ONLY,     pri: 'P1', label: 'db-dashboard' },
  { path: '/dashboard/credits',                      locales: JA_ONLY,     pri: 'P1', label: 'db-credits' },
  { path: '/dashboard/billing',                      locales: JA_ONLY,     pri: 'P1', label: 'db-billing' },
  { path: '/dashboard/settings',                     locales: JA_ONLY,     pri: 'P1', label: 'db-settings' },
  { path: '/credits/success',                        locales: JA_ONLY,     pri: 'P2', label: 'db-credits-success' },
  { path: '/credits/cancel',                         locales: JA_ONLY,     pri: 'P2', label: 'db-credits-cancel' },
  { path: '/auth/logout',                            locales: JA_ONLY,     pri: 'P2', label: 'db-auth-logout' },
];

// ───────────────────────────────────────────────────────────────
// Audit helpers
// ───────────────────────────────────────────────────────────────

interface PageResult {
  site: string;
  url: string;
  label: string;
  locale: Locale;
  viewport: 'desktop' | 'mobile';
  pri: string;
  status: number | null;
  ok: boolean;
  error: string | null;
  screenshot: string;
  redirectedTo: string | null;
}

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile:  { width: 390,  height: 844 },
} as const;

async function auditPage(
  page: Page,
  site: string,
  route: Route,
  locale: Locale,
  viewport: 'desktop' | 'mobile',
  baseURL: string,
): Promise<PageResult> {
  const urlPath = route.path.replace('{locale}', locale);
  const fullUrl = `${baseURL}${urlPath}`;
  const safeName = `${site}__${route.label}__${locale}__${viewport}.png`.replace(/[^a-z0-9_.\-]/gi, '_');
  const screenshotPath = path.join(AUDIT_ROOT, safeName);

  await page.setViewportSize(VIEWPORTS[viewport]);

  const result: PageResult = {
    site,
    url: fullUrl,
    label: route.label,
    locale,
    viewport,
    pri: route.pri,
    status: null,
    ok: false,
    error: null,
    screenshot: screenshotPath,
    redirectedTo: null,
  };

  try {
    const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 25_000 });
    result.status = response?.status() ?? null;
    result.ok = (response?.ok() ?? false) || (result.status != null && result.status < 400);
    // detect redirect
    const finalUrl = page.url();
    if (finalUrl !== fullUrl) {
      result.redirectedTo = finalUrl;
    }

    // Wait for body to be visible & a tick of stability
    try {
      await page.waitForLoadState('networkidle', { timeout: 12_000 });
    } catch {
      // some sites have long-tail requests; ignore
    }
    // give images / late hydration extra room
    await page.waitForTimeout(1500);

    // fullPage so cards / footer / lazy content all render in the screenshot
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch (e: any) {
    result.error = String(e?.message || e).slice(0, 500);
    // try to capture whatever we have
    try {
      await page.screenshot({ path: screenshotPath, fullPage: false });
    } catch {}
  }
  return result;
}

function appendCsv(siteResults: PageResult[]) {
  const csvPath = path.join(AUDIT_ROOT, 'audit-results.csv');
  const exists = fs.existsSync(csvPath);
  const header = 'site,url,label,locale,viewport,pri,status,ok,redirectedTo,error,screenshot\n';
  const lines = siteResults.map(r => [
    r.site, r.url, r.label, r.locale, r.viewport, r.pri,
    r.status ?? '', r.ok, r.redirectedTo ?? '',
    (r.error || '').replace(/[",\n]/g, ' '),
    path.basename(r.screenshot),
  ].map(v => `"${String(v)}"`).join(','));
  fs.appendFileSync(csvPath, (exists ? '' : header) + lines.join('\n') + '\n');
}

// ───────────────────────────────────────────────────────────────
// Tests per project
// ───────────────────────────────────────────────────────────────

function runAuditFor(siteName: string, routes: Route[]) {
  test.describe.configure({ mode: 'parallel' });

  for (const route of routes) {
    for (const locale of route.locales) {
      for (const viewport of ['desktop', 'mobile'] as const) {
        const urlPath = route.path.replace('{locale}', locale);
        test(`[${route.pri}] ${siteName} ${urlPath} (${locale}/${viewport})`, async ({ page, baseURL }) => {
          test.setTimeout(60_000);
          const result = await auditPage(page, siteName, route, locale, viewport, baseURL!);
          appendCsv([result]);
          // soft assertion: log but don't fail (we want all screenshots)
          if (!result.ok) {
            console.log(`[FAIL] ${result.url} status=${result.status} error=${result.error}`);
          }
          if (result.redirectedTo) {
            console.log(`[REDIRECT] ${result.url} → ${result.redirectedTo}`);
          }
        });
      }
    }
  }
}

test.describe('audit-full / magicoord', () => {
  test.skip(({ baseURL }) => !baseURL?.includes('magicoord'), 'magicoord project only');
  runAuditFor('magicoord', MAGICOORD_ROUTES);
});

test.describe('audit-full / www', () => {
  test.skip(({ baseURL }) => !baseURL?.includes('www.wizpulseai.com') && !baseURL?.includes('www.local.wiz'), 'www project only');
  runAuditFor('www', WWW_ROUTES);
});

test.describe('audit-full / auth', () => {
  test.skip(({ baseURL }) => !baseURL?.includes('auth.wizpulseai.com') && !baseURL?.includes('auth.local.wiz'), 'auth project only');
  runAuditFor('auth', AUTH_ROUTES);
});

test.describe('audit-full / dashboard', () => {
  test.skip(({ baseURL }) => !baseURL?.includes('dashboard.wizpulseai.com') && !baseURL?.includes('dashboard.local.wiz'), 'dashboard project only');
  runAuditFor('dashboard', DASHBOARD_ROUTES);
});
