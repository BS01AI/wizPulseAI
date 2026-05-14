/**
 * DISPATCH-062: Knowledge Hub Visual Capture
 *
 * Captures screenshots, videos, DOM dump, computed styles, and console logs
 * from https://www.wizpulseai.com/ja/knowledge-hub for 軍師 analysis.
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

async function extractStyles(page, selector, label) {
  return await page.evaluate(({ sel, props }) => {
    const el = document.querySelector(sel)
    if (!el) return { error: `not found: ${sel}` }
    const cs = window.getComputedStyle(el)
    const result = { selector: sel }
    for (const p of props) result[p] = cs.getPropertyValue(p) || ''
    result.inlineStyle = el.getAttribute('style') || ''
    result.outerHTMLSnippet = el.outerHTML.slice(0, 500)
    return result
  }, { sel: selector, props: PROPS })
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
  await page.waitForTimeout(3000) // animation complete

  // 1. initial
  console.log('[desktop] screenshot: initial')
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-initial.png'), fullPage: false })

  // Detect zones - try common selectors
  const zones = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('main *'))
    const candidates = all.filter(el => {
      const txt = el.textContent || ''
      return /Life|Tech|ライフ|テック/i.test(txt) && el.children.length < 20
    }).slice(0, 20).map(el => ({
      tag: el.tagName,
      cls: el.className?.toString?.().slice(0, 80) || '',
      text: (el.textContent || '').slice(0, 60)
    }))
    return candidates
  })
  console.log('[desktop] detected zones:', zones.length)
  fs.writeFileSync(path.join(OUT, 'dom/zones-detected.json'), JSON.stringify(zones, null, 2))

  // 2. hover Life (left zone)
  console.log('[desktop] screenshot: hover Life (left 33%)')
  await page.mouse.move(480, 450)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-hover-life.png') })

  // Dump inline styles after hover
  const inlineHover = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('main [style]'))
    return els.slice(0, 30).map(el => ({
      tag: el.tagName,
      cls: (el.className?.toString?.() || '').slice(0, 60),
      style: el.getAttribute('style'),
      textSnippet: (el.textContent || '').slice(0, 40)
    }))
  })

  // 3. hover Tech (right zone)
  console.log('[desktop] screenshot: hover Tech (right 66%)')
  await page.mouse.move(960, 450)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-hover-tech.png') })

  const inlineHoverTech = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('main [style]'))
    return els.slice(0, 30).map(el => ({
      tag: el.tagName,
      cls: (el.className?.toString?.() || '').slice(0, 60),
      style: el.getAttribute('style'),
      textSnippet: (el.textContent || '').slice(0, 40)
    }))
  })

  // 4. hover center (divider)
  console.log('[desktop] screenshot: hover divider (center)')
  await page.mouse.move(720, 450)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-hover-divider.png') })

  // 5. click transition (move + partial animation)
  console.log('[desktop] screenshot: click transition (mousedown)')
  await page.mouse.move(480, 450)
  await page.waitForTimeout(300)
  await page.mouse.down()
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-desktop-click-transition.png') })
  await page.mouse.up()
  await page.waitForTimeout(500)

  // Back to neutral for style extraction
  await page.mouse.move(10, 10)
  await page.waitForTimeout(1000)

  // DOM dump - SplitEntrance root
  console.log('[desktop] extracting DOM...')
  const domDump = await page.evaluate(() => {
    const main = document.querySelector('main')
    const firstDiv = main?.firstElementChild
    return {
      main: main ? main.outerHTML.slice(0, 30000) : null,
      firstDiv: firstDiv ? firstDiv.outerHTML.slice(0, 20000) : null,
      title: document.title,
      h1: Array.from(document.querySelectorAll('h1')).map(el => el.textContent),
      h2: Array.from(document.querySelectorAll('h2')).map(el => el.textContent)
    }
  })
  fs.writeFileSync(path.join(OUT, 'dom/split-entrance.html'), domDump.main || '')
  fs.writeFileSync(path.join(OUT, 'dom/first-div.html'), domDump.firstDiv || '')
  fs.writeFileSync(path.join(OUT, 'dom/page-meta.json'), JSON.stringify({
    title: domDump.title, h1: domDump.h1, h2: domDump.h2
  }, null, 2))

  // computed styles
  const selectors = ['main', 'main > div', 'main > div > div', 'main div[class*="clip"]', 'main a[href*="life"]', 'main a[href*="tech"]']
  const styles = {}
  for (const sel of selectors) {
    try {
      styles[sel] = await extractStyles(page, sel, sel)
    } catch (e) {
      styles[sel] = { error: String(e) }
    }
  }
  fs.writeFileSync(path.join(OUT, 'dom/computed-styles.json'), JSON.stringify(styles, null, 2))

  fs.writeFileSync(path.join(OUT, 'dom/inline-styles-snapshot.json'), JSON.stringify({
    hoverLife: inlineHover,
    hoverTech: inlineHoverTech
  }, null, 2))

  await page.close()
  await context.close()
}

async function captureMobile(browser, consoleMessages) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    recordVideo: { dir: path.join(OUT, 'videos'), size: { width: 390, height: 844 } }
  })
  const page = await context.newPage()

  page.on('console', msg => {
    consoleMessages.push(`[MOBILE][${msg.type()}] ${msg.text()}`)
  })

  console.log('[mobile] navigating...')
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(3000)

  // 6. mobile initial
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-mobile-initial.png') })

  // 7. mobile scroll for split state
  await page.evaluate(() => window.scrollTo(0, 200))
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT, 'screenshots/kh-mobile-split.png') })

  // 8. mobile tap
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  await page.tap('main', { position: { x: 100, y: 400 } }).catch(() => {})
  await page.waitForTimeout(600)
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

  fs.writeFileSync(path.join(OUT, 'console-log.txt'), consoleMessages.join('\n'))
  await browser.close()

  // Rename video files (playwright uses random names)
  const videoDir = path.join(OUT, 'videos')
  const videos = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'))
  console.log('[rename] video files:', videos)
  if (videos[0]) fs.renameSync(path.join(videoDir, videos[0]), path.join(videoDir, 'kh-desktop.webm'))
  if (videos[1]) fs.renameSync(path.join(videoDir, videos[1]), path.join(videoDir, 'kh-mobile.webm'))

  console.log('=== DISPATCH-062 CAPTURE COMPLETE ===')
  console.log('Output:', OUT)
})()
