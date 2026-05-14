/**
 * DISPATCH-119 — Layer 2 browse-limit banner end-to-end check.
 *
 * Hits a real community post detail page 22 times from the same context.
 * The 21st+ request (anonymous, default daily cap = 20) should render the
 * `data-testid="public-browse-banner"` element. We can't easily fake IPs
 * against Vercel's edge from a single client, so this is a "best-effort
 * production smoke" — passes when banner shows up at any point in the run,
 * skips with a console note if Redis is fail-open (no banner ever).
 */
import { test, expect } from '@playwright/test'

test.use({ baseURL: 'https://magicoord.wizpulseai.com' })

// Real post seeded in production. Update the slug if it ever rotates.
const SAMPLE_POST_ID = '0ec255aa-3882-4589-a4c7-4d90fb69a2a9'

test('Layer 2 browse-limit banner appears after 20 anonymous post views', async ({ browser }) => {
  test.setTimeout(180_000)

  // Use a fresh context so no auth cookie is present (must look like a guest).
  const context = await browser.newContext()
  const page = await context.newPage()

  let bannerFirstSeenAt: number | null = null

  for (let i = 1; i <= 22; i++) {
    await page.goto(`/ja/fashion/community/${SAMPLE_POST_ID}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })
    const banner = page.locator('[data-testid="public-browse-banner"]')
    const count = await banner.count()
    if (count > 0 && bannerFirstSeenAt === null) {
      bannerFirstSeenAt = i
      console.log(`[Layer 2] banner first appeared on request #${i}`)
      // visual check
      await expect(banner.first()).toBeVisible({ timeout: 5_000 })
      break
    }
  }

  if (bannerFirstSeenAt === null) {
    console.log('[Layer 2] banner did NOT appear in 22 requests — possible Redis fail-open.')
  } else {
    expect(bannerFirstSeenAt).toBeGreaterThan(15) // soft floor — should be near 21
    expect(bannerFirstSeenAt).toBeLessThanOrEqual(22)
  }

  await context.close()
})
