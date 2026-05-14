// DISPATCH-147 production smoke v2: authenticated + cross-site variant verify
// Author: bs01ai
//
// Flow:
//   1. Login once via auth.wizpulseai.com (storageState captured)
//   2. For each variant: set cookies + navigate to 6 page (3 fashion + main/auth/dashboard)
//   3. fullPage screenshot saved to production-smoke-v2/
//
// Env:
//   PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD must be set

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_DIR = '/Users/bms/Work/CodeWork/AI-helper/core/docs/matrix-themes-2026-05-11/production-smoke-v2';

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD;
if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error('PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD not set');
  process.exit(1);
}

const VARIANTS = ['sucre', 'luminous', 'editorial', 'wabi', 'urban'];

// Authenticated pages (require login)
const PAGES = [
  // Fashion authed inner — the real variant effect surface
  { id: 'fashion-home',      url: 'https://magicoord.wizpulseai.com/ja' },
  { id: 'fashion-community', url: 'https://magicoord.wizpulseai.com/ja/fashion/community' },
  { id: 'fashion-history',   url: 'https://magicoord.wizpulseai.com/ja/fashion/history' },
  { id: 'fashion-chat-mika', url: 'https://magicoord.wizpulseai.com/ja/fashion/chat/mika' },
  // Main / Auth / Dashboard
  { id: 'main-home',         url: 'https://www.wizpulseai.com/ja' },
  { id: 'auth-login',        url: 'https://auth.wizpulseai.com/login' },
  { id: 'dashboard-home',    url: 'https://dashboard.wizpulseai.com/dashboard' },
];

const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT = 30000;
const SETTLE_MS = 2500;

mkdirSync(OUT_DIR, { recursive: true });

async function login(browser) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'ja-JP' });
  const page = await ctx.newPage();

  // Trigger login flow via fashion site so post-login redirect points back to fashion
  await page.goto('https://magicoord.wizpulseai.com/ja/fashion/history', { waitUntil: 'networkidle', timeout: NAV_TIMEOUT });
  await page.waitForTimeout(2000);

  const url1 = page.url();
  console.log('  after history nav:', url1.slice(0, 80));

  // Look for the email/password inputs. If auth redirect already happened
  // they should be on the page; otherwise we navigate directly to /auth.
  let emailInput = page.locator('input[type="email"]').first();
  let visible = await emailInput.isVisible({ timeout: 8000 }).catch(() => false);

  if (!visible) {
    await page.goto('https://auth.wizpulseai.com/auth?view=sign_in', { waitUntil: 'networkidle', timeout: NAV_TIMEOUT });
    await page.waitForTimeout(2000);
    emailInput = page.locator('input[type="email"]').first();
    visible = await emailInput.isVisible({ timeout: 8000 }).catch(() => false);
  }

  if (visible) {
    await emailInput.fill(TEST_EMAIL);
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);
    console.log('  filled credentials, submitting...');
    await page.getByRole('button', { name: /sign in|ログイン|登入|sign up|continue|サインイン/i }).first().click().catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(3500);
    const url2 = page.url();
    console.log('  after submit:', url2.slice(0, 80));
  } else {
    console.warn('  email input not visible after both attempts');
  }

  const storageState = await ctx.storageState();
  await ctx.close();
  return storageState;
}

async function shoot(browser, storageState, variant) {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'ja-JP',
    storageState,
  });

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
      const url = tab.url();
      console.log(`✓ ${variant.padEnd(10)} ${page.id.padEnd(20)} dv="${dv}" url=${url.slice(0, 60)}`);
    } catch (e) {
      console.warn(`✗ ${variant.padEnd(10)} ${page.id.padEnd(20)} FAIL: ${e.message.slice(0, 80)}`);
    }
    await tab.close();
  }

  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  console.log('DISPATCH-147 authenticated smoke');
  console.log(`  ${VARIANTS.length} variants × ${PAGES.length} pages = ${VARIANTS.length * PAGES.length} shots`);
  console.log(`  output: ${OUT_DIR}`);

  console.log('\n--- login ---');
  const storageState = await login(browser);
  console.log('login ok, storageState captured');

  for (const v of VARIANTS) {
    console.log(`\n--- variant: ${v} ---`);
    await shoot(browser, storageState, v);
  }

  await browser.close();
  console.log('\ndone');
})();
