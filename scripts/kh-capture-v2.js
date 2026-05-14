/**
 * DISPATCH-062 v2: Fix — avoid triggering click navigation.
 * Capture DOM/styles BEFORE any click. Use precise mouse hovers only.
 */

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUT = '/Users/bms/Work/CodeWork/AI-helper/core/agent-hub/results/dispatch-062'
const URL = 'https://www.wizpulseai.com/ja/knowledge-hub'

const PROPS = [
  'clip-path', 'transform', 'transition', 'animation', 'filter',
  'backdrop-filter', 'background', 'box-shadow', 'mix-blend-mode',
  'will-change', 'transform-origin', 'perspective', 'opacity'
]

async function extractComputedStyles(page) {
  return await page.evaluate((props) => {
    const selectors = [
      { label: 'main', sel: 'main' },
      { label: 'splitEntrance_root', sel: 'main > div, main > section' },
      { label: 'zones_all', sel: 'main a, main button, main [role="button"]' },
    ]
    const result = {}
    selectors.forEach(({ label, sel }) => {
      const els = Array.from(document.querySelectorAll(sel))
      result[label] = els.slice(0, 10).map(el => {
        const cs = window.getComputedStyle(el)
        const data = {
          tag: el.tagName,
          cls: (el.className?.toString?.() || '').slice(0, 200),
          textSnippet: (el.textContent || '').slice(0, 60),
          href: el.getAttribute('href') || '',
        }
        for (const p of props) data[p] = cs.getPropertyValue(p) || ''
        return data
      })
    })

    // Also find clip-path using elements
    const allClips = Array.from(document.querySelectorAll('*')).filter(el => {
      const cs = window.getComputedStyle(el)
      return cs.clipPath !== 'none' && cs.clipPath !== ''
    }).slice(0, 20).map(el => ({
      tag: el.tagName,
      cls: (el.className?.toString?.() || '').slice(0, 120),
      clipPath: window.getComputedStyle(el).clipPath,
      textSnippet: (el.textContent || '').slice(0, 40)
    }))
    result.clipPath_elements = allClips

    // Framer motion animated elements
    const animated = Array.from(document.querySelectorAll('main [style*="transform"], main [style*="opacity"]')).slice(0, 30).map(el => ({
      tag: el.tagName,
      cls: (el.className?.toString?.() || '').slice(0, 100),
      style: el.getAttribute('style'),
      textSnippet: (el.textContent || '').slice(0, 40)
    }))
    result.framerMotion_inline = animated

    return result
  }, PROPS)
}

async function captureDesktop(browser, consoleMessages) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: path.join(OUT, 'videos'), size: { width: 1440, height: 900 } }
  })
  const page = await context.newPage()

  page.on('console', msg => {
    consoleMessages.push(`[DESKTOP][${msg.type()}] ${msg.text()}`)
  })
  page.on('pageerror', err => {
    consoleMessages.push(`[DESKTOP][pageerror] ${err.message}`)
  })

  console.log('[desktop] navigating...')
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  console.log('[desktop] URL:', page.url())
  console.log('[desktop] title:', await page.title())
  await page.waitForTimeout(3000) // wait for stagger animation

  // === DOM CAPTURE BEFORE ANY INTERACTION ===
  console.log('[desktop] capturing DOM (pre-interaction)...')
  const initialDom = await page.evaluate(() => {
    const main = document.querySelector('main')
    return main ? main.outerHTML.slice(0, 40000) : null
  })
  fs.writeFileSync(path.join(OUT, 'dom/split-entrance.html'), initialDom || '')

  const initialStyles = await extractComputedStyles(page)
  fs.writeFileSync(path.join(OUT, 'dom/computed-styles.json'), JSON.stringify(initialStyles, null, 2))

  // Inline styles at REST state
  const inlineRest = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('main [style]')).slice(0, 40).map(el => ({
      tag: el.tagName,
      cls: (el.className?.toString?.() || '').slice(0, 100),
      style: el.getAttribute('style'),
      textSnippet: (el.textContent || '').slice(0, 40)
    }))
  })

  // Page meta
  const meta = await page.evaluate(() => ({
    title: document.title,
    h1: Array.from(document.querySelectorAll('h1')).map(e => e.textContent),
    h2: Array.from(document.querySelectorAll('h2')).map(e => e.textContent),
    links: Array.from(document.querySelectorAll('main a')).slice(0, 20).map(a => ({
      href: a.getAttribute('href'),
      text: (a.textContent || '').slice(0, 50),
      cls: (a.className?.toString?.() || '').slice(0, 80)
    }))
  }))
  fs.writeFileSync(path.join(OUT, 'dom/page-meta.json'), JSON.stringify(meta, null, 2))

  // 1. initial screenshot
  console.log('[desktop] screenshot: initial')
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-initial.png'), fullPage: false })

  // 2. hover Life (left quadrant)
  console.log('[desktop] hover Life')
  await page.mouse.move(400, 450, { steps: 10 })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-hover-life.png') })

  const inlineHoverLife = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('main [style]')).slice(0, 40).map(el => ({
      tag: el.tagName,
      cls: (el.className?.toString?.() || '').slice(0, 100),
      style: el.getAttribute('style'),
      textSnippet: (el.textContent || '').slice(0, 40)
    }))
  })

  // 3. hover Tech (right quadrant)
  console.log('[desktop] hover Tech')
  await page.mouse.move(1040, 450, { steps: 10 })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-hover-tech.png') })

  const inlineHoverTech = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('main [style]')).slice(0, 40).map(el => ({
      tag: el.tagName,
      cls: (el.className?.toString?.() || '').slice(0, 100),
      style: el.getAttribute('style'),
      textSnippet: (el.textContent || '').slice(0, 40)
    }))
  })

  // 4. hover center (divider)
  console.log('[desktop] hover divider')
  await page.mouse.move(720, 450, { steps: 10 })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-hover-divider.png') })

  // 5. simulate "about to click" — NO mouseDown, just hover in place
  console.log('[desktop] hover Life again (simulating click intent, NO click)')
  await page.mouse.move(400, 450, { steps: 5 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-click-transition.png') })

  // Save inline styles snapshot
  fs.writeFileSync(path.join(OUT, 'dom/inline-styles-snapshot.json'), JSON.stringify({
    rest: inlineRest,
    hoverLife: inlineHoverLife,
    hoverTech: inlineHoverTech
  }, null, 2))

  await page.close()
  await context.close()
}

async function captureMobile(browser, consoleMessages) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    recordVideo: { dir: path.join(OUT, 'videos'), size: { width: 390, height: 844 } },
    hasTouch: true,
    isMobile: true
  })
  const page = await context.newPage()

  page.on('console', msg => {
    consoleMessages.push(`[MOBILE][${msg.type()}] ${msg.text()}`)
  })

  console.log('[mobile] navigating...')
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  console.log('[mobile] URL:', page.url())
  await page.waitForTimeout(3000)

  // 6. mobile initial
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-mobile-initial.png') })

  // 7. mobile middle scroll
  await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'smooth' }))
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-mobile-split.png') })

  // 8. scroll back, then touch (no tap to avoid navigation)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await page.waitForTimeout(1000)
  // dispatch touchstart without tap to show press state
  await page.evaluate(() => {
    const el = document.querySelector('main a, main button, main [role="button"]')
    if (el) {
      el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [] }))
    }
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-mobile-tap.png') })

  await page.close()
  await context.close()
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const consoleMessages = []

  try {
    await captureDesktop(browser, consoleMessages)
    await captureMobile(browser, consoleMessages)
  } catch (e) {
    console.error('ERROR:', e)
    consoleMessages.push(`[FATAL] ${e.message}`)
  }

  fs.writeFileSync(path.join(OUT, 'console-log.txt'), consoleMessages.join('\n') + '\n')
  await browser.close()

  // Rename videos
  const videoDir = path.join(OUT, 'videos')
  const existing = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm') && !f.startsWith('kh-'))
  console.log('[rename] existing:', existing)
  // First delete old kh-*.webm to avoid overwrite issues
  fs.readdirSync(videoDir).filter(f => f.startsWith('kh-')).forEach(f => fs.unlinkSync(path.join(videoDir, f)))
  const fresh = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'))
  if (fresh[0]) fs.renameSync(path.join(videoDir, fresh[0]), path.join(videoDir, 'kh-desktop.webm'))
  if (fresh[1]) fs.renameSync(path.join(videoDir, fresh[1]), path.join(videoDir, 'kh-mobile.webm'))

  console.log('=== DISPATCH-062 V2 CAPTURE COMPLETE ===')
})()
