const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUT = '/Users/bms/Work/CodeWork/AI-helper/core/agent-hub/results/dispatch-075'
fs.mkdirSync(OUT, { recursive: true })

const BASE = 'https://www.wizpulseai.com/ja/knowledge-hub/basics'

;(async () => {
  // Vercel deploy 反映を待つ (最大 4 分)
  console.log('Waiting for Vercel deploy (up to 4 min)...')
  const start = Date.now()
  while (Date.now() - start < 240000) {
    const r = await fetch(BASE).then(r => r.text()).catch(() => '')
    if (r.includes('人気タグ') || r.includes('Popular')) {
      console.log('Deploy ready:', ((Date.now() - start) / 1000).toFixed(1), 's')
      break
    }
    await new Promise(r => setTimeout(r, 15000))
  }

  const browser = await chromium.launch({ headless: true })

  // 1. Desktop
  console.log('[1/3] Desktop screenshot...')
  const ctxD = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const pageD = await ctxD.newPage()
  await pageD.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
  await pageD.waitForTimeout(2000)
  await pageD.screenshot({ path: path.join(OUT, '01-desktop.png'), fullPage: false })
  console.log('  → 01-desktop.png')

  // 3. Modal open (click「もっと見る」button)
  console.log('[3/3] Modal screenshot...')
  try {
    // click the 「もっと見る」 button (contains 'Plus' icon + text)
    await pageD.getByRole('button', { name: /もっと見る|See more/i }).click()
    await pageD.waitForTimeout(1000)
    await pageD.screenshot({ path: path.join(OUT, '03-modal.png'), fullPage: false })
    console.log('  → 03-modal.png')
  } catch (e) {
    console.log('  modal click failed:', e.message)
    await pageD.screenshot({ path: path.join(OUT, '03-modal-fallback.png') })
  }
  await pageD.close()
  await ctxD.close()

  // 2. Mobile
  console.log('[2/3] Mobile screenshot...')
  const ctxM = await browser.newContext({
    viewport: { width: 390, height: 900 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) AppleWebKit/605.1.15 Version/16.0 Mobile',
    hasTouch: true,
    isMobile: true,
  })
  const pageM = await ctxM.newPage()
  await pageM.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
  await pageM.waitForTimeout(2000)
  await pageM.screenshot({ path: path.join(OUT, '02-mobile.png'), fullPage: false })
  console.log('  → 02-mobile.png')
  await pageM.close()
  await ctxM.close()

  await browser.close()
  console.log('Done. saved to', OUT)
})()
