const { chromium, devices } = require('./node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/Users/bms/Work/CodeWork/AI-helper/core/agent-hub/results/screenshots';
const BASE_URL = 'https://magicoord.wizpulseai.com';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  // ==== TEST 1: Home page accessibility ====
  console.log('\n=== Test 1: Home page accessibility ===');
  {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    
    await page.goto(`${BASE_URL}/ja`, { waitUntil: 'networkidle', timeout: 30000 });
    
    const title = await page.title();
    const metaDesc = await page.getAttribute('meta[name="description"]', 'content');
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    const ogDesc = await page.getAttribute('meta[property="og:description"]', 'content');
    const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
    
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fashion-home-ja.png'), fullPage: false });
    
    results.test1 = { url: page.url(), title, metaDesc, ogTitle, ogDesc, ogImage, consoleErrors };
    
    console.log('URL:', page.url());
    console.log('Title:', title);
    console.log('Meta description:', metaDesc ? metaDesc.substring(0, 120) : '(none)');
    console.log('OG title:', ogTitle);
    console.log('OG desc:', ogDesc ? ogDesc.substring(0, 100) : '(none)');
    console.log('OG image:', ogImage ? ogImage.substring(0, 100) : '(none)');
    console.log('Console errors:', consoleErrors.length > 0 ? consoleErrors : 'None');
    
    await page.close();
  }

  // ==== TEST 2: Pricing page - DISPATCH-004 check ====
  console.log('\n=== Test 2: Pricing page (DISPATCH-004 check) ===');
  {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    
    await page.goto(`${BASE_URL}/ja/pricing`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fashion-pricing.png'), fullPage: true });
    
    const title = await page.title();
    const bodyText = await page.innerText('body');
    
    const has9pt = bodyText.includes('9pt') || bodyText.includes('9 pt');
    const has29pt = bodyText.includes('29pt') || bodyText.includes('29 pt');
    const has15pt = bodyText.includes('15pt') || bodyText.includes('15 pt');
    const has20pt = bodyText.includes('20pt') || bodyText.includes('20 pt');
    const has73pt = bodyText.includes('73pt') || bodyText.includes('73 pt');
    const has23pt = bodyText.includes('23pt') || bodyText.includes('23 pt');

    // Extract pricing-related lines for context
    const lines = bodyText.split('\n').filter(l => l.match(/\d+pt|\d+円|積分|ポイント|クレジット/));
    
    results.test2 = { url: page.url(), title, has9pt, has29pt, has15pt, has20pt, has23pt, has73pt, consoleErrors,
      dispatch004_correct: (has9pt && has29pt) && !has15pt, pricingLines: lines.slice(0, 20) };
    
    console.log('URL:', page.url());
    console.log('Title:', title);
    console.log('\n--- DISPATCH-004 新しい値 ---');
    console.log('  9pt found:', has9pt ? '✅ YES' : '❌ NOT FOUND');
    console.log('  29pt found:', has29pt ? '✅ YES' : '❌ NOT FOUND');
    console.log('  23pt found:', has23pt ? '✅ YES' : '❌ NOT FOUND');
    console.log('  73pt found:', has73pt ? '✅ YES' : '❌ NOT FOUND');
    console.log('\n--- 古い値 (ないはず) ---');
    console.log('  15pt found:', has15pt ? '❌ STILL EXISTS' : '✅ Not found');
    console.log('  20pt found:', has20pt ? '⚠️  STILL EXISTS' : '✅ Not found');
    console.log('\n--- 関連テキスト行 ---');
    lines.slice(0, 15).forEach(l => console.log(' ', l.trim()));
    console.log('\nDISPATCH-004 判定:', results.test2.dispatch004_correct ? '✅ 修正済み' : '❌ 要確認');
    if (consoleErrors.length > 0) console.log('Console errors:', consoleErrors.slice(0, 5));
    
    await page.close();
  }

  // ==== TEST 3: Deleted feature check ====
  console.log('\n=== Test 3: Deleted feature check ===');
  {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/ja`, { waitUntil: 'networkidle', timeout: 30000 });
    
    const bodyText = await page.innerText('body');
    const hasGenerateButton = bodyText.includes('AIおすすめコーデを生成') || 
                               bodyText.includes('おすすめコーデを生成') ||
                               bodyText.includes('コーデを生成');
    
    console.log('Home - "コーデを生成" ボタン:', hasGenerateButton ? '❌ まだ存在する' : '✅ 削除済み');
    results.test3_home = { hasGenerateButton };
    await page.close();
    
    // Demo page check
    const demoPage = await browser.newPage();
    const consoleErrors = [];
    demoPage.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    
    await demoPage.goto(`${BASE_URL}/ja/fashion/demo`, { waitUntil: 'networkidle', timeout: 30000 });
    await demoPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fashion-demo.png'), fullPage: false });
    
    const demoTitle = await demoPage.title();
    const demoUrl = demoPage.url();
    const demoBodyText = await demoPage.innerText('body');
    const hasUpgradeModal = demoBodyText.toLowerCase().includes('upgrade') ||
                            demoBodyText.includes('アップグレード') ||
                            (demoBodyText.includes('プレミアム') && demoBodyText.includes('ロック'));
    
    results.test3_demo = { url: demoUrl, title: demoTitle, hasUpgradeModal, consoleErrors };
    
    console.log('\nDemo page:');
    console.log('  URL:', demoUrl);
    console.log('  Title:', demoTitle);
    console.log('  Redirected:', demoUrl !== `${BASE_URL}/ja/fashion/demo` ? '→ ' + demoUrl : 'No redirect');
    console.log('  UpgradeModal:', hasUpgradeModal ? '⚠️  Possibly visible' : '✅ Not visible');
    if (consoleErrors.length > 0) console.log('  Errors:', consoleErrors.slice(0, 3));
    
    await demoPage.close();
  }

  // ==== TEST 4: Public page crawl ====
  console.log('\n=== Test 4: Public page crawl ===');
  {
    const pagesToVisit = [
      { path: '/ja/fashion', screenshot: 'fashion-main.png', name: 'Fashion main' },
      { path: '/ja/fashion/onboarding', screenshot: null, name: 'Fashion onboarding' }
    ];
    
    for (const pageInfo of pagesToVisit) {
      const page = await browser.newPage();
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      
      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'networkidle', timeout: 30000 });
        const title = await page.title();
        const metaDesc = await page.getAttribute('meta[name="description"]', 'content');
        const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
        const currentUrl = page.url();
        
        if (pageInfo.screenshot) {
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, pageInfo.screenshot), fullPage: false });
        }
        
        const key = `test4_${pageInfo.name.replace(/ /g, '_')}`;
        results[key] = { requestedUrl: `${BASE_URL}${pageInfo.path}`, actualUrl: currentUrl, title, metaDesc, ogTitle, 
          consoleErrors: consoleErrors.slice(0, 3), redirected: currentUrl !== `${BASE_URL}${pageInfo.path}` };
        
        console.log(`\n${pageInfo.name}:`);
        console.log('  Actual URL:', currentUrl);
        console.log('  Title:', title);
        console.log('  OG Title:', ogTitle ? ogTitle.substring(0, 100) : '(none)');
        console.log('  Meta Desc:', metaDesc ? metaDesc.substring(0, 100) : '(none)');
        console.log('  Redirected:', currentUrl !== `${BASE_URL}${pageInfo.path}` ? '→ ' + currentUrl : 'No');
        console.log('  Console errors:', consoleErrors.length);
      } catch (e) {
        console.log(`${pageInfo.name}: ERROR -`, e.message);
        results[`test4_${pageInfo.name.replace(/ /g, '_')}`] = { error: e.message };
      }
      await page.close();
    }
  }

  // ==== TEST 5: Mobile viewport ====
  console.log('\n=== Test 5: Mobile viewport (iPhone 14 390x844) ===');
  {
    const iPhone14 = devices['iPhone 14'];
    const mobilePage = await browser.newPage({ ...iPhone14 });
    
    await mobilePage.goto(`${BASE_URL}/ja`, { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fashion-mobile.png'), fullPage: false });
    
    const homeViewport = mobilePage.viewportSize();
    const homeOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    console.log('Viewport:', JSON.stringify(homeViewport));
    console.log('Home mobile - horizontal overflow:', homeOverflow ? '⚠️  YES (overflow exists)' : '✅ No overflow');
    
    await mobilePage.goto(`${BASE_URL}/ja/pricing`, { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fashion-pricing-mobile.png'), fullPage: false });
    
    const pricingOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    console.log('Pricing mobile - horizontal overflow:', pricingOverflow ? '⚠️  YES (overflow exists)' : '✅ No overflow');
    
    results.test5 = { viewport: homeViewport, homeOverflow, pricingOverflow };
    await mobilePage.close();
  }

  await browser.close();
  
  const resultsPath = path.join(SCREENSHOTS_DIR, 'test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log('\n=== All tests completed ===');
  console.log('Results:', resultsPath);
  
  return results;
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
