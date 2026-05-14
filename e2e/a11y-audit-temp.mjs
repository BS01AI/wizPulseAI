import { chromium } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

const BASE_URL = 'https://magicoord.wizpulseai.com';
const AUTH_URL = 'https://auth.wizpulseai.com';
const EMAIL = 'sun.bo@bs01ai.com';
const PASSWORD = '12345678';

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'ja-JP'
  });
  const page = await context.newPage();
  
  const results = {};
  
  // Step 1: Audit Auth page first (no login needed)
  console.log('\n=== Auditing Auth page (no login) ===');
  await page.goto(`${AUTH_URL}/auth?view=sign_in`, { waitUntil: 'networkidle', timeout: 30000 });
  await injectAxe(page);
  const authViolations = await getViolations(page);
  results['auth_sign_in'] = authViolations;
  console.log(`  Violations: ${authViolations.length}`);
  authViolations.forEach(v => console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} elements)`));
  
  // Step 2: Login
  console.log('\n=== Logging in ===');
  try {
    await page.goto(`${AUTH_URL}/auth?view=sign_in`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    console.log('  Current URL after login:', page.url());
  } catch (e) {
    console.log('  Login error:', e.message);
  }
  
  // Navigate to fashion home
  await page.goto(`${BASE_URL}/ja/fashion`, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('  Fashion home URL:', page.url());
  
  // Pages to audit
  const pages = [
    { key: 'fashion_home', url: `${BASE_URL}/ja/fashion` },
    { key: 'fashion_history', url: `${BASE_URL}/ja/fashion/history` },
    { key: 'fashion_community', url: `${BASE_URL}/ja/fashion/community` },
    { key: 'fashion_chat_mika', url: `${BASE_URL}/ja/fashion/chat/mika` },
    { key: 'fashion_chat_group', url: `${BASE_URL}/ja/fashion/chat/group` },
    { key: 'fashion_settings', url: `${BASE_URL}/ja/fashion/settings` },
    { key: 'pricing', url: `${BASE_URL}/ja/pricing` },
  ];
  
  for (const p of pages) {
    console.log(`\n=== Auditing ${p.key} ===`);
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      const finalUrl = page.url();
      console.log(`  URL: ${finalUrl}`);
      
      if (finalUrl.includes('/auth') || finalUrl.includes('sign_in')) {
        console.log('  SKIP: redirected to auth (session issue)');
        results[p.key] = { skipped: true };
        continue;
      }
      
      await injectAxe(page);
      const violations = await getViolations(page);
      results[p.key] = violations;
      
      const critical = violations.filter(v => v.impact === 'critical').length;
      const serious = violations.filter(v => v.impact === 'serious').length;
      const moderate = violations.filter(v => v.impact === 'moderate').length;
      const minor = violations.filter(v => v.impact === 'minor').length;
      
      console.log(`  Total: ${violations.length} | critical:${critical} serious:${serious} moderate:${moderate} minor:${minor}`);
      violations.forEach(v => {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        v.nodes.slice(0, 2).forEach(n => {
          console.log(`    -> ${n.html ? n.html.slice(0, 100) : ''}`);
        });
      });
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
      results[p.key] = { error: e.message };
    }
  }
  
  await browser.close();
  
  // Summary
  console.log('\n\n=== SUMMARY ===');
  let totalViolations = 0;
  let totalCritical = 0, totalSerious = 0, totalModerate = 0, totalMinor = 0;
  
  for (const [key, violations] of Object.entries(results)) {
    if (Array.isArray(violations)) {
      const c = violations.filter(v => v.impact === 'critical').length;
      const s = violations.filter(v => v.impact === 'serious').length;
      const m = violations.filter(v => v.impact === 'moderate').length;
      const mn = violations.filter(v => v.impact === 'minor').length;
      console.log(`${key}: total=${violations.length} (C:${c} S:${s} M:${m} mn:${mn})`);
      totalViolations += violations.length;
      totalCritical += c; totalSerious += s; totalModerate += m; totalMinor += mn;
    } else {
      console.log(`${key}: ${JSON.stringify(violations)}`);
    }
  }
  console.log(`\nGRAND TOTAL: ${totalViolations} (critical:${totalCritical} serious:${totalSerious} moderate:${totalModerate} minor:${totalMinor})`);
  
  return results;
}

runAudit().catch(console.error);
