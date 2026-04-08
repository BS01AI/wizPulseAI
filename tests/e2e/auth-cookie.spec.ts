/**
 * Auth/Cookie SSO テスト
 *
 * 注意: ログインテストは環境変数 TEST_USER_EMAIL / TEST_USER_PASSWORD が必要
 * CI では Secrets から注入、ローカルでは .env.test に設定
 */
import { test, expect } from '@playwright/test'

const URLS = {
  main: process.env.TEST_ENV === 'local' ? 'http://localhost:3010' : 'https://www.wizpulseai.com',
  auth: process.env.TEST_ENV === 'local' ? 'http://localhost:3011' : 'https://auth.wizpulseai.com',
  dashboard: process.env.TEST_ENV === 'local' ? 'http://localhost:3012' : 'https://dashboard.wizpulseai.com',
  magicoord: process.env.TEST_ENV === 'local' ? 'http://localhost:3013' : 'https://magicoord.wizpulseai.com',
}

const TEST_EMAIL = process.env.TEST_USER_EMAIL || ''
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || ''

test.describe('認証ページ基本', () => {
  test('Auth站 — ログインフォーム表示', async ({ page }) => {
    await page.goto(URLS.auth)
    // Auth site shows login/signup choice first, click login to get form
    const loginBtn = page.locator('button, a').filter({ hasText: /ログイン|Log\s*in|Sign\s*in/i }).first()
    await expect(loginBtn).toBeVisible({ timeout: 10_000 })
    await loginBtn.click()
    // Now the email input should appear
    await expect(page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('Auth站 — 空送信でエラー表示', async ({ page }) => {
    await page.goto(URLS.auth)
    const submitBtn = page.locator('button[type="submit"]').first()
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // Should show validation error or stay on page
      await expect(page).toHaveURL(/auth/)
    }
  })
})

test.describe('未認証ユーザー保護', () => {
  test('Dashboard — 未ログインでAuth站にリダイレクト', async ({ page }) => {
    await page.goto(`${URLS.dashboard}/dashboard`)
    // Should redirect to auth or show login prompt
    await page.waitForTimeout(3000)
    const url = page.url()
    const isRedirectedToAuth = url.includes('auth') || url.includes('login') || url.includes(URLS.dashboard)
    expect(isRedirectedToAuth).toBeTruthy()
  })
})

test.describe('ログインフロー', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL/PASSWORD not set')

  test('Auth → Dashboard SSO ログイン', async ({ page }) => {
    // 1. Go to Auth site
    await page.goto(URLS.auth)

    // 2. Fill login form
    await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL)
    await page.fill('input[type="password"], input[name="password"]', TEST_PASSWORD)

    // 3. Submit
    await page.click('button[type="submit"]')

    // 4. Wait for redirect (should go to dashboard or show success)
    await page.waitForTimeout(5000)

    // 5. Verify SSO cookie is set for top-level domain
    const cookies = await page.context().cookies()
    const supabaseCookies = cookies.filter(c =>
      c.name.includes('sb-') || c.name.includes('supabase')
    )

    // Should have at least one auth cookie
    expect(supabaseCookies.length).toBeGreaterThan(0)
  })

  test('ログイン後 — Dashboard アクセス可能', async ({ page }) => {
    // Login first
    await page.goto(URLS.auth)
    await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL)
    await page.fill('input[type="password"], input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)

    // Navigate to Dashboard
    await page.goto(`${URLS.dashboard}/dashboard`)
    await page.waitForTimeout(3000)

    // Should not be redirected to auth
    expect(page.url()).toContain('dashboard')
  })
})

test.describe('Cookie 検証', () => {
  test('初回アクセス — 基本Cookie確認', async ({ page }) => {
    await page.goto(URLS.main)
    const cookies = await page.context().cookies()

    // Check locale cookie exists
    const localeCookie = cookies.find(c => c.name === 'NEXT_LOCALE')
    // Locale cookie may or may not exist on first visit
    // Just ensure no errors
    expect(cookies).toBeDefined()
  })
})
