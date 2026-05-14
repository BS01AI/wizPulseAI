import { chromium } from '@playwright/test';

const BASE_URL = 'https://magicoord.wizpulseai.com';

async function deepChecks() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Login first
  await page.goto('https://auth.wizpulseai.com/auth?view=sign_in', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'sun.bo@bs01ai.com');
  await page.fill('input[type="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  
  // 1. Check viewport on logged-in pages (no zoom blocking)
  console.log('\n=== VIEWPORT META (all pages) ===');
  const pages = [
    { name: 'fashion_home', url: `${BASE_URL}/ja/fashion` },
    { name: 'onboarding', url: `${BASE_URL}/ja/fashion/onboarding` },
    { name: 'settings', url: `${BASE_URL}/ja/fashion/settings` },
    { name: 'chat_mika', url: `${BASE_URL}/ja/fashion/chat/mika` },
    { name: 'chat_group', url: `${BASE_URL}/ja/fashion/chat/group` },
    { name: 'pricing', url: `${BASE_URL}/ja/pricing` },
  ];
  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const viewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : 'NOT FOUND';
    });
    const zoomBlocked = viewport.includes('user-scalable=no') || viewport.includes('maximum-scale=1');
    console.log(`${p.name}: "${viewport}" ${zoomBlocked ? '!! ZOOM BLOCKED !!' : 'OK'}`);
  }
  
  // 2. Check heading hierarchy on logged-in pages
  console.log('\n=== HEADING HIERARCHY (logged-in pages) ===');
  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
      return Array.from(hs).map(h => `${h.tagName}:"${h.textContent.trim().slice(0, 30)}"`);
    });
    console.log(`${p.name}:`, headings.slice(0, 8).join(' -> ') || 'NO HEADINGS');
  }
  
  // 3. Check aria-label on icon buttons
  console.log('\n=== ICON BUTTONS WITHOUT ACCESSIBLE NAME ===');
  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const iconButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const problematic = [];
      for (const btn of buttons) {
        const text = btn.textContent.trim();
        const ariaLabel = btn.getAttribute('aria-label');
        const ariaLabelledBy = btn.getAttribute('aria-labelledby');
        const title = btn.getAttribute('title');
        // Button has only SVG or icon (no text) and no accessible name
        const hasSvgOnly = btn.querySelector('svg') && text.length < 3;
        if (hasSvgOnly && !ariaLabel && !ariaLabelledBy && !title) {
          problematic.push({ 
            text: text.slice(0, 20) || 'empty',
            class: btn.className.slice(0, 60)
          });
        }
      }
      return problematic.slice(0, 10);
    });
    if (iconButtons.length > 0) {
      console.log(`\n${p.name}: ${iconButtons.length} icon buttons without accessible name`);
      iconButtons.forEach(b => console.log(`  - class: ${b.class}`));
    } else {
      console.log(`${p.name}: OK`);
    }
  }
  
  // 4. Check aria-live on chat pages
  console.log('\n=== CHAT ARIA-LIVE CHECK ===');
  const chatPages = [
    { name: 'chat_mika', url: `${BASE_URL}/ja/fashion/chat/mika` },
    { name: 'chat_group', url: `${BASE_URL}/ja/fashion/chat/group` },
  ];
  for (const p of chatPages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const chatCheck = await page.evaluate(() => {
      const liveRegions = document.querySelectorAll('[aria-live], [role="log"], [role="status"]');
      const chatContainers = document.querySelectorAll('[class*="chat"], [class*="message"], [class*="Messages"]');
      return {
        liveRegions: Array.from(liveRegions).map(el => ({ 
          tag: el.tagName, 
          live: el.getAttribute('aria-live'),
          role: el.getAttribute('role')
        })),
        chatContainerCount: chatContainers.length
      };
    });
    console.log(`${p.name}:`, JSON.stringify(chatCheck));
  }
  
  // 5. Check form labels on settings
  console.log('\n=== FORM LABELS ON SETTINGS ===');
  await page.goto(`${BASE_URL}/ja/fashion/settings`, { waitUntil: 'networkidle', timeout: 30000 });
  const formElements = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    return Array.from(inputs).map(el => {
      const id = el.id;
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      const placeholder = el.getAttribute('placeholder');
      const type = el.type || el.tagName;
      return {
        tag: el.tagName,
        type,
        id: id || 'no-id',
        hasLabel: !!label,
        ariaLabel: ariaLabel || null,
        ariaLabelledBy: ariaLabelledBy || null,
        placeholder: placeholder || null,
        accessible: !!(label || ariaLabel || ariaLabelledBy)
      };
    });
  });
  console.log('Form elements:', JSON.stringify(formElements, null, 2));
  
  // 6. Check landmark structure
  console.log('\n=== LANDMARK STRUCTURE ===');
  for (const p of [pages[0], pages[3], pages[5]]) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const landmarks = await page.evaluate(() => {
      const roles = ['banner', 'main', 'navigation', 'contentinfo', 'complementary', 'search', 'form', 'region'];
      const result = {};
      roles.forEach(role => {
        const count = document.querySelectorAll(`[role="${role}"], ${role === 'banner' ? 'header' : role === 'contentinfo' ? 'footer' : role === 'navigation' ? 'nav' : role === 'main' ? 'main' : ''}`).length;
        if (count > 0) result[role] = count;
      });
      const mains = document.querySelectorAll('main');
      result['main_elements'] = mains.length;
      const navs = document.querySelectorAll('nav');
      result['nav_labels'] = Array.from(navs).map(n => n.getAttribute('aria-label') || 'NO LABEL');
      return result;
    });
    console.log(`${p.name}:`, JSON.stringify(landmarks));
  }

  // 7. Check focus indicator CSS
  console.log('\n=== FOCUS INDICATOR CHECK ===');
  await page.goto(`${BASE_URL}/ja/fashion`, { waitUntil: 'networkidle', timeout: 30000 });
  const focusStyle = await page.evaluate(() => {
    // Check if there's a global focus style or focus-visible removal
    const styleSheets = Array.from(document.styleSheets);
    let outlineNoneCount = 0;
    let focusVisibleCount = 0;
    try {
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.selectorText && rule.selectorText.includes(':focus')) {
              if (rule.style && rule.style.outline === 'none' || rule.style && rule.style.outline === '0') {
                outlineNoneCount++;
              }
            }
            if (rule.selectorText && rule.selectorText.includes(':focus-visible')) {
              focusVisibleCount++;
            }
          }
        } catch (e) { /* cross-origin */ }
      }
    } catch(e) {}
    return { outlineNoneCount, focusVisibleCount };
  });
  console.log('Focus styles:', JSON.stringify(focusStyle));
  
  await browser.close();
}

deepChecks().catch(console.error);
