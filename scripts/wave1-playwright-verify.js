/**
 * DISPATCH-063 Wave 1 Playwright live verification.
 * Checks 15 URLs + knowledge-hub index + category landing + screenshot each.
 */

const { chromium } = require('playwright')
const fs = require('fs')

const OUT = '/Users/bms/Work/CodeWork/AI-helper/core/agent-hub/results/dispatch-063/wave-1-live'
fs.mkdirSync(OUT, { recursive: true })

const SLUGS = [
  'article-1-intro-basics',
  'article-1-chapter2-architecture',
  'article-1-chapter3-models',
  'article-1-chapter4-applications',
  'article-1-chapter5-capabilities',
  'article-1-chapter6-future',
  'personal-color-self-diagnosis',
  'spring-color-coordination-2026',
  'office-casual-guide-for-beginners',
  'smart-coordination-with-ai-2026',
  'capsule-wardrobe-color-planning',
  'color-psychology-fashion',
  'outfit-color-coordination-beginners',
  'best-ai-tools-2025',
  'free-ai-tools-2025',
]

const BASE = 'https://www.wizpulseai.com/ja/knowledge-hub'

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()

  const results = []

  // KH index
  try {
    const r = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${OUT}/00-knowledge-hub-index.png` })
    results.push({ url: BASE, status: r?.status(), name: 'index' })
    console.log(`[OK] index http=${r?.status()}`)
  } catch (e) {
    results.push({ url: BASE, status: 'ERR', error: String(e) })
  }

  // Category lifestyle
  const catLifeUrl = `${BASE}/lifestyle`
  try {
    const r = await page.goto(catLifeUrl, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `${OUT}/00-category-lifestyle.png` })
    results.push({ url: catLifeUrl, status: r?.status(), name: 'category-lifestyle' })
    console.log(`[OK] category lifestyle http=${r?.status()}`)
  } catch (e) {
    results.push({ url: catLifeUrl, status: 'ERR', error: String(e) })
  }

  // 15 articles
  for (let i = 0; i < SLUGS.length; i++) {
    const slug = SLUGS[i]
    const url = `${BASE}/${slug}`
    try {
      const r = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(800)
      const n = String(i + 1).padStart(2, '0')
      await page.screenshot({ path: `${OUT}/${n}-${slug}.png` })
      const status = r?.status()
      const title = await page.title()
      results.push({ url, status, slug, title })
      console.log(`[${status === 200 ? 'OK' : 'FAIL'}] ${slug} http=${status}`)
    } catch (e) {
      results.push({ url, status: 'ERR', slug, error: String(e) })
      console.log(`[ERR] ${slug}: ${e.message}`)
    }
  }

  // Summary
  const ok = results.filter(r => r.status === 200).length
  const fail = results.length - ok
  console.log(`\nSummary: ${ok} / ${results.length} OK, ${fail} fail`)
  fs.writeFileSync(`${OUT}/verification-results.json`, JSON.stringify(results, null, 2))

  await browser.close()
})()
