const { chromium } = require('playwright')
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  
  console.log('Waiting 60s for Vercel deploy to complete...')
  await new Promise(r => setTimeout(r, 60000))
  
  console.log('Checking /ja/knowledge-hub ...')
  await page.goto('https://www.wizpulseai.com/ja/knowledge-hub', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(3000)
  
  // v2 verification: check for new Biz title and canvas
  const check = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const bizTitle = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Biz'))
    const circuit = document.querySelector('svg circle[r="4"]')
    return {
      hasCanvas: !!canvas,
      hasBizTitle: !!bizTitle,
      bizTitleText: bizTitle?.textContent,
      hasCircuit: !!circuit,
      title: document.title,
    }
  })
  console.log('Verification:', JSON.stringify(check, null, 2))
  
  await page.screenshot({ 
    path: '/Users/bms/Work/CodeWork/AI-helper/core/agent-hub/results/dispatch-062/kh-desktop-v2-LIVE.png',
    fullPage: false
  })
  console.log('Screenshot saved: kh-desktop-v2-LIVE.png')
  
  await browser.close()
})()
