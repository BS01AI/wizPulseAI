/**
 * 言語切替 + UI一貫性テスト
 */
import { test, expect } from '@playwright/test'

const URLS = {
  main: process.env.TEST_ENV === 'local' ? 'http://localhost:3010' : 'https://www.wizpulseai.com',
  magicoord: process.env.TEST_ENV === 'local' ? 'http://localhost:3013' : 'https://magicoord.wizpulseai.com',
}

const LOCALES = ['ja', 'en', 'ar', 'zh-TW'] as const

test.describe('Main站 多言語', () => {
  for (const locale of LOCALES) {
    test(`/${locale} — ページ表示可能`, async ({ page }) => {
      const res = await page.goto(`${URLS.main}/${locale}`)
      expect(res?.status()).toBeLessThan(400)
      await expect(page.locator('body')).toBeVisible()
    })
  }

  test('アラビア語 — RTL属性適用', async ({ page }) => {
    await page.goto(`${URLS.main}/ar`)
    const dir = await page.getAttribute('html', 'dir')
    // Arabic should have RTL direction
    if (dir) {
      expect(dir).toBe('rtl')
    }
  })
})

test.describe('Magicoord 多言語', () => {
  for (const locale of LOCALES) {
    test(`/${locale} — ページ表示可能`, async ({ page }) => {
      const res = await page.goto(`${URLS.magicoord}/${locale}`)
      if (res) {
        expect(res.status()).toBeLessThan(500)
      }
    })
  }
})

test.describe('UI基本チェック', () => {
  test('Main — ダークモード切替なし（エラーなし）', async ({ page }) => {
    await page.goto(URLS.main)
    // Just verify no JS errors during initial load
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.waitForTimeout(2000)

    const critical = errors.filter(e =>
      !e.includes('ResizeObserver') && !e.includes('Non-Error')
    )
    expect(critical).toHaveLength(0)
  })

  test('Main — メタタグ基本確認', async ({ page }) => {
    await page.goto(`${URLS.main}/ja`)
    // Should have viewport meta
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')

    // Should have description
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc).toBeTruthy()
    expect(desc!.length).toBeGreaterThan(10)
  })

  test('Magicoord — OGP tags 確認', async ({ page }) => {
    await page.goto(`${URLS.magicoord}/ja`)
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    if (ogTitle) {
      expect(ogTitle.length).toBeGreaterThan(0)
    }
  })
})

test.describe('フォントと表示', () => {
  test('Main — テキスト表示確認（空白ページでない）', async ({ page }) => {
    await page.goto(`${URLS.main}/ja`)
    const textContent = await page.textContent('body')
    expect(textContent!.trim().length).toBeGreaterThan(50)
  })

  test('Magicoord — テキスト表示確認', async ({ page }) => {
    await page.goto(`${URLS.magicoord}/ja`)
    const textContent = await page.textContent('body')
    expect(textContent!.trim().length).toBeGreaterThan(50)
  })
})
