import { chromium } from '@playwright/test';

const BASE_URL = 'https://magicoord.wizpulseai.com';

async function landmarkChecks() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Login
  await page.goto('https://auth.wizpulseai.com/auth?view=sign_in', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'sun.bo@bs01ai.com');
  await page.fill('input[type="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  
  const pages = [
    { name: 'fashion_home', url: `${BASE_URL}/ja/fashion` },
    { name: 'chat_mika', url: `${BASE_URL}/ja/fashion/chat/mika` },
    { name: 'pricing', url: `${BASE_URL}/ja/pricing` },
    { name: 'settings', url: `${BASE_URL}/ja/fashion/settings` },
    { name: 'community', url: `${BASE_URL}/ja/fashion/community` },
    { name: 'history', url: `${BASE_URL}/ja/fashion/history` },
  ];
  
  console.log('\n=== LANDMARK STRUCTURE ===');
  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const landmarks = await page.evaluate(() => {
      const mains = document.querySelectorAll('main');
      const navs = document.querySelectorAll('nav');
      const headers = document.querySelectorAll('header');
      const footers = document.querySelectorAll('footer');
      const articleEls = document.querySelectorAll('article');
      const asideEls = document.querySelectorAll('aside');
      return {
        main: mains.length,
        nav: navs.length,
        header: headers.length,
        footer: footers.length,
        article: articleEls.length,
        aside: asideEls.length,
        navLabels: Array.from(navs).map(n => n.getAttribute('aria-label') || 'NO LABEL'),
        mainNested: mains.length > 1 ? 'DUPLICATE MAIN' : 'OK'
      };
    });
    console.log(`${p.name}:`, JSON.stringify(landmarks));
  }

  // Check focus indicator
  console.log('\n=== FOCUS OUTLINE CHECK ===');
  await page.goto(`${BASE_URL}/ja/fashion`, { waitUntil: 'networkidle', timeout: 30000 });
  const focusCheck = await page.evaluate(() => {
    // Tab through first 5 focusable elements and check focus style
    const focusable = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    const results = [];
    Array.from(focusable).slice(0, 5).forEach(el => {
      el.focus();
      const style = window.getComputedStyle(el);
      results.push({
        tag: el.tagName,
        text: el.textContent.trim().slice(0, 20) || el.getAttribute('aria-label') || 'no text',
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow
      });
    });
    return results;
  });
  console.log('Focus styles on first 5 elements:', JSON.stringify(focusCheck, null, 2));
  
  // Check color contrast of key UI elements manually
  console.log('\n=== COMPUTED COLOR SAMPLES ===');
  await page.goto(`${BASE_URL}/ja/fashion/chat/mika`, { waitUntil: 'networkidle', timeout: 30000 });
  const colors = await page.evaluate(() => {
    // Check BGM button contrast issue
    const spans = document.querySelectorAll('span');
    const bgmSpan = Array.from(spans).find(s => s.textContent.trim() === 'BGM');
    if (bgmSpan) {
      const style = window.getComputedStyle(bgmSpan);
      const parentStyle = window.getComputedStyle(bgmSpan.parentElement);
      return {
        bgmText: bgmSpan.textContent,
        color: style.color,
        fontSize: style.fontSize,
        bgColor: style.backgroundColor,
        parentBg: parentStyle.backgroundColor
      };
    }
    return { found: false };
  });
  console.log('BGM span color:', JSON.stringify(colors));

  // Check community badge contrast
  await page.goto(`${BASE_URL}/ja/fashion/community`, { waitUntil: 'networkidle', timeout: 30000 });
  const communityColors = await page.evaluate(() => {
    // Find badge text
    const spans = document.querySelectorAll('span.absolute, span[class*="badge"], span[class*="rounded-full"]');
    return Array.from(spans).slice(0, 3).map(s => {
      const style = window.getComputedStyle(s);
      return {
        text: s.textContent.trim().slice(0, 20),
        color: style.color,
        bg: style.backgroundColor,
        fontSize: style.fontSize
      };
    });
  });
  console.log('Community badge colors:', JSON.stringify(communityColors, null, 2));
  
  // aria-progressbar check on onboarding
  console.log('\n=== ARIA PROGRESSBAR CHECK ===');
  await page.goto(`${BASE_URL}/ja/fashion/onboarding`, { waitUntil: 'networkidle', timeout: 30000 });
  const progressbars = await page.evaluate(() => {
    const bars = document.querySelectorAll('[role="progressbar"]');
    return Array.from(bars).map(bar => ({
      ariaLabel: bar.getAttribute('aria-label'),
      ariaLabelledBy: bar.getAttribute('aria-labelledby'),
      ariaValuenow: bar.getAttribute('aria-valuenow'),
      ariaValuemin: bar.getAttribute('aria-valuemin'),
      ariaValuemax: bar.getAttribute('aria-valuemax'),
      ariaValuetext: bar.getAttribute('aria-valuetext'),
      hasAccessibleName: !!(bar.getAttribute('aria-label') || bar.getAttribute('aria-labelledby'))
    }));
  });
  console.log('Progress bars:', JSON.stringify(progressbars, null, 2));
  
  await browser.close();
}

landmarkChecks().catch(console.error);
