/**
 * 全站可達性 + 跨站導航テスト
 */
import { test, expect } from '@playwright/test'

const URLS = {
  main: process.env.TEST_ENV === 'local' ? 'http://localhost:3010' : 'https://www.wizpulseai.com',
  auth: process.env.TEST_ENV === 'local' ? 'http://localhost:3011' : 'https://auth.wizpulseai.com',
  dashboard: process.env.TEST_ENV === 'local' ? 'http://localhost:3012' : 'https://dashboard.wizpulseai.com',
  magicoord: process.env.TEST_ENV === 'local' ? 'http://localhost:3013' : 'https://magicoord.wizpulseai.com',
}

test.describe('全站可達性', () => {
  test('Main站 — トップページ表示', async ({ page }) => {
    const res = await page.goto(URLS.main)
    expect(res?.status()).toBeLessThan(400)
    await expect(page).toHaveTitle(/wizPulseAI/i)
  })

  test('Auth站 — 認証ページ表示', async ({ page }) => {
    const res = await page.goto(URLS.auth)
    expect(res?.status()).toBeLessThan(400)
    // Auth page should have login/signup elements
    await expect(page.locator('body')).toBeVisible()
  })

  test('Dashboard站 — ダッシュボード表示', async ({ page }) => {
    const res = await page.goto(URLS.dashboard)
    expect(res?.status()).toBeLessThan(400)
  })

  test('Magicoord站 — トップページ表示', async ({ page }) => {
    const res = await page.goto(URLS.magicoord)
    expect(res?.status()).toBeLessThan(400)
  })
})

test.describe('HTTPSとセキュリティ', () => {
  for (const [name, url] of Object.entries(URLS)) {
    test(`${name} — HTTPS有効`, async ({ page }) => {
      if (process.env.TEST_ENV === 'local') {
        test.skip()
        return
      }
      const res = await page.goto(url)
      expect(page.url()).toMatch(/^https:/)
    })
  }
})

test.describe('跨站リンク検証', () => {
  test('Main → Auth ログインリンク', async ({ page }) => {
    await page.goto(URLS.main)
    // Look for login/auth link
    const authLink = page.locator('a[href*="auth.wizpulseai.com"], a[href*="localhost:3011"]').first()
    if (await authLink.isVisible()) {
      const href = await authLink.getAttribute('href')
      expect(href).toBeTruthy()
    }
  })

  test('Main → Magicoord リンク', async ({ page }) => {
    await page.goto(URLS.main)
    const magicoordLink = page.locator('a[href*="magicoord"], a[href*="localhost:3013"]').first()
    if (await magicoordLink.isVisible()) {
      const href = await magicoordLink.getAttribute('href')
      expect(href).toBeTruthy()
    }
  })
})

test.describe('モバイル対応', () => {
  test('Main — モバイル表示崩れなし', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(URLS.main)
    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // 5px tolerance
  })

  test('Magicoord — モバイル表示崩れなし', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(URLS.magicoord)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })
})
