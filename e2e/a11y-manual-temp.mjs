import { chromium } from '@playwright/test';

const BASE_URL = 'https://magicoord.wizpulseai.com';

async function manualChecks() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 1. Check viewport meta on fashion home
  await page.goto(`${BASE_URL}/ja/fashion`, { waitUntil: 'networkidle', timeout: 30000 });
  const viewportMeta = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    return meta ? meta.getAttribute('content') : 'NOT FOUND';
  });
  console.log('\n=== VIEWPORT META ===');
  console.log('fashion home:', viewportMeta);
  
  // 2. Check html lang attribute across pages
  console.log('\n=== LANG ATTRIBUTES ===');
  const langPages = [
    { name: 'fashion_home', url: `${BASE_URL}/ja/fashion` },
    { name: 'pricing', url: `${BASE_URL}/ja/pricing` },
    { name: 'fashion_settings', url: `${BASE_URL}/ja/fashion/settings` },
  ];
  for (const p of langPages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const lang = await page.evaluate(() => document.documentElement.lang);
    console.log(`${p.name}: lang="${lang}"`);
  }
  
  // 3. Skip to main content link
  console.log('\n=== SKIP TO MAIN LINK ===');
  for (const p of langPages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const skipLink = await page.evaluate(() => {
      // Check for skip link as first focusable element or hidden anchor
      const links = document.querySelectorAll('a[href^="#"]');
      const skipKeywords = ['skip', 'jump', 'main', 'content', 'メイン', 'コンテンツ'];
      for (const link of links) {
        const text = (link.textContent || '').toLowerCase();
        const href = (link.getAttribute('href') || '').toLowerCase();
        if (skipKeywords.some(k => text.includes(k) || href.includes(k))) {
          return `FOUND: "${link.textContent.trim()}" -> ${link.href}`;
        }
      }
      return 'NOT FOUND';
    });
    console.log(`${p.name}: ${skipLink}`);
  }
  
  // 4. Check heading hierarchy on key pages
  console.log('\n=== HEADING HIERARCHY ===');
  for (const p of langPages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
      return Array.from(hs).map(h => `${h.tagName}:"${h.textContent.trim().slice(0, 40)}"`);
    });
    console.log(`\n${p.name} headings:`, headings.slice(0, 10).join(' | '));
  }
  
  // 5. Check focus indicator on settings page (interactive elements)
  console.log('\n=== INTERACTIVE ELEMENTS WITHOUT aria-label ===');
  await page.goto(`${BASE_URL}/ja/fashion/settings`, { waitUntil: 'networkidle', timeout: 30000 });
  const unlabeledElements = await page.evaluate(() => {
    const selects = document.querySelectorAll('select');
    const unlabeled = [];
    selects.forEach((el, i) => {
      const id = el.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
        unlabeled.push({
          tag: el.tagName,
          id: id || 'no-id',
          class: el.className.slice(0, 60)
        });
      }
    });
    return unlabeled;
  });
  console.log('Unlabeled selects on settings:', JSON.stringify(unlabeledElements, null, 2));
  
  // 6. Check image alt attributes
  console.log('\n=== IMAGES WITHOUT ALT ===');
  const imagePages = [
    { name: 'fashion_home', url: `${BASE_URL}/ja/fashion` },
    { name: 'fashion_history', url: `${BASE_URL}/ja/fashion/history` },
    { name: 'community', url: `${BASE_URL}/ja/fashion/community` },
  ];
  for (const p of imagePages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const imgsWithoutAlt = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs)
        .filter(img => !img.hasAttribute('alt'))
        .map(img => img.src.slice(0, 80));
    });
    if (imgsWithoutAlt.length > 0) {
      console.log(`${p.name}: ${imgsWithoutAlt.length} images without alt`);
      imgsWithoutAlt.forEach(src => console.log(`  - ${src}`));
    } else {
      console.log(`${p.name}: OK (all images have alt)`);
    }
  }
  
  // 7. Check color contrast on gold button (DISPATCH-118 fix)
  console.log('\n=== DISPATCH-118 GOLD BUTTON CONTRAST CHECK ===');
  await page.goto(`${BASE_URL}/ja/pricing`, { waitUntil: 'networkidle', timeout: 30000 });
  const goldButtons = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, a');
    const goldy = [];
    for (const btn of buttons) {
      const style = window.getComputedStyle(btn);
      const bg = style.backgroundColor;
      const color = style.color;
      // Check if likely gold/yellow background
      if (bg.includes('rgb') && (bg.includes('212') || bg.includes('180') || bg.includes('gold'))) {
        goldy.push({ text: btn.textContent.trim().slice(0, 40), bg, color });
      }
    }
    return goldy.slice(0, 5);
  });
  console.log('Gold-ish buttons:', JSON.stringify(goldButtons, null, 2));
  
  // 8. Check prefers-reduced-motion
  console.log('\n=== REDUCED MOTION CHECK ===');
  await page.goto(`${BASE_URL}/ja/fashion`, { waitUntil: 'networkidle', timeout: 30000 });
  const animations = await page.evaluate(() => {
    const animated = document.querySelectorAll('[class*="animate"]');
    const lottieElements = document.querySelectorAll('lottie-player, [class*="lottie"]');
    return {
      animateClasses: animated.length,
      lottieElements: lottieElements.length
    };
  });
  console.log('Animation elements on fashion_home:', JSON.stringify(animations));
  
  // 9. Check aria-live regions
  console.log('\n=== ARIA-LIVE REGIONS ===');
  for (const p of [{ name: 'chat_mika', url: `${BASE_URL}/ja/fashion/chat/mika` }]) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const liveRegions = await page.evaluate(() => {
      const regions = document.querySelectorAll('[aria-live], [role="alert"], [role="status"], [role="log"]');
      return Array.from(regions).map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        ariaLive: el.getAttribute('aria-live'),
        class: el.className.slice(0, 50)
      }));
    });
    console.log(`${p.name} live regions:`, JSON.stringify(liveRegions, null, 2));
  }
  
  await browser.close();
}

manualChecks().catch(console.error);
