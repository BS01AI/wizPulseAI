const { chromium } = require('playwright')
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await new Promise(r => setTimeout(r, 120000))
  await page.goto('https://www.wizpulseai.com/ja/knowledge-hub', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(4000)
  const check = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const h2s = Array.from(document.querySelectorAll('h2')).map(h => ({ text: h.textContent?.slice(0, 40), dataText: h.dataset ? h.dataset.text : null }))
    const circuits = document.querySelectorAll('svg circle').length
    const hasBiz = h2s.some(h => (h.text || '').includes('Biz') || (h.dataText || '').includes('Biz'))
    return { hasCanvas: !!canvas, canvas: canvas ? canvas.width + 'x' + canvas.height : null, circuits, h2s: h2s.slice(0, 6), hasBiz, title: document.title }
  })
  console.log(JSON.stringify(check, null, 2))
  await page.screenshot({ path: '/Users/bms/Work/CodeWork/AI-helper/core/agent-hub/results/dispatch-062/kh-desktop-v2-LIVE.png' })
  await browser.close()
})()
