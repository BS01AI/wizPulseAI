const { chromium } = require('playwright')
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  
  console.log('Navigating to /ja/knowledge-hub ...')
  const response = await page.goto('https://www.wizpulseai.com/ja/knowledge-hub', { waitUntil: 'networkidle', timeout: 30000 })
  console.log('Response status:', response?.status())
  console.log('Final URL:', page.url())
  console.log('Title:', await page.title())
  
  // Check what's rendered
  const firstH = await page.evaluate(() => {
    const h1 = document.querySelector('h1')
    const h2s = document.querySelectorAll('h2')
    const hasSplitEntrance = Array.from(document.querySelectorAll('*')).some(el => {
      const cn = el.className?.toString?.() || ''
      return cn.includes('clip-path') || cn.includes('ClipPath')
    })
    return {
      h1Text: h1?.textContent,
      h1Class: h1?.className?.toString?.().slice(0, 100),
      h2Count: h2s.length,
      hasSplitEntrance,
      hasClipPath: document.body.innerHTML.includes('clip-path')
    }
  })
  console.log(JSON.stringify(firstH, null, 2))
  
  await browser.close()
})()
