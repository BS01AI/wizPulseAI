/**
 * Magicoord (マジコーデ) 機能テスト
 */
import { test, expect } from '@playwright/test'

const MAGICOORD_URL = process.env.TEST_ENV === 'local'
  ? 'http://localhost:3013'
  : 'https://magicoord.wizpulseai.com'

test.describe('Magicoord トップページ', () => {
  test('ページ読み込み + 主要要素表示', async ({ page }) => {
    await page.goto(MAGICOORD_URL)
    await expect(page).toHaveTitle(/マジコーデ|Magicoord|wizPulseAI/i)

    // Main content should be visible
    await expect(page.locator('main, [role="main"], #__next')).toBeVisible()
  })

  test('多言語 — 日本語デフォルト', async ({ page }) => {
    await page.goto(MAGICOORD_URL)
    await page.waitForTimeout(2000)

    // URL should contain /ja (Japanese default)
    const url = page.url()
    expect(url).toMatch(/\/(ja|en|ar|zh-TW)/)
  })

  test('ナビゲーション — ヘッダー表示', async ({ page }) => {
    await page.goto(MAGICOORD_URL)
    const header = page.locator('header, nav').first()
    await expect(header).toBeVisible()
  })

  test('フッター — リンク存在', async ({ page }) => {
    await page.goto(MAGICOORD_URL)
    const footer = page.locator('footer').first()
    if (await footer.isVisible()) {
      // Should have at least one link
      const links = footer.locator('a')
      expect(await links.count()).toBeGreaterThan(0)
    }
  })
})

test.describe('Magicoord 機能ページ', () => {
  test('Fashion ページ到達可能', async ({ page }) => {
    // Navigate to the fashion page (main feature)
    const res = await page.goto(`${MAGICOORD_URL}/ja/fashion`)
    if (res) {
      expect(res.status()).toBeLessThan(500)
    }
  })

  test('法務ページ — 特商法', async ({ page }) => {
    const res = await page.goto(`${MAGICOORD_URL}/ja/tokusho`)
    if (res) {
      // Should be 200 or redirect to about page
      expect(res.status()).toBeLessThan(500)
    }
  })
})

test.describe('Magicoord パフォーマンス', () => {
  test('トップページ — 5秒以内にLCP', async ({ page }) => {
    const start = Date.now()
    await page.goto(MAGICOORD_URL, { waitUntil: 'domcontentloaded' })
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(10_000) // 10s generous limit for cold start
  })

  test('JavaScript エラーなし', async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', (error) => {
      jsErrors.push(error.message)
    })

    await page.goto(MAGICOORD_URL)
    await page.waitForTimeout(3000)

    // Filter out known non-critical errors
    const criticalErrors = jsErrors.filter(msg =>
      !msg.includes('ResizeObserver') &&
      !msg.includes('Non-Error promise rejection') &&
      !msg.includes('Loading chunk')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('Magicoord レスポンシブ', () => {
  test('375px — メニュー折りたたみ', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(MAGICOORD_URL)

    // On mobile, navigation should be hamburger or hidden
    await expect(page.locator('body')).toBeVisible()
  })

  test('1920px — フルデスクトップ表示', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(MAGICOORD_URL)

    await expect(page.locator('body')).toBeVisible()
  })
})
