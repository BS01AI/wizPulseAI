const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('=== Task 1: Main站点多语言测试 ===');
  
  // 1. 日语页面
  console.log('访问日语页面...');
  await page.goto('http://localhost:3010/ja', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/screenshots/main-ja.png', fullPage: true });
  console.log('OK 日语页面截图完成');
  
  // 2. 阿拉伯语页面（RTL）
  console.log('访问阿拉伯语页面...');
  await page.goto('http://localhost:3010/ar', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/screenshots/main-ar-rtl.png', fullPage: true });
  console.log('OK 阿拉伯语页面截图完成（验证RTL）');
  
  // 3. 繁体中文页面
  console.log('访问繁体中文页面...');
  await page.goto('http://localhost:3010/zh-TW', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/screenshots/main-zh-tw.png', fullPage: true });
  console.log('OK 繁体中文页面截图完成');
  
  // 检查Console错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  console.log('');
  console.log('=== Task 2: Auth站点UI和多语言测试 ===');
  
  // 4. Auth站点默认UI
  console.log('访问Auth站点...');
  await page.goto('http://localhost:3011', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/screenshots/auth-new-ui.png', fullPage: true });
  console.log('OK Auth新UI截图完成');
  
  // 5. Auth阿拉伯语
  console.log('访问Auth阿拉伯语...');
  await page.goto('http://localhost:3011?lang=ar', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/screenshots/auth-ar-rtl.png', fullPage: true });
  console.log('OK Auth阿拉伯语截图完成');
  
  console.log('');
  console.log('=== Task 3: Dashboard站点测试 ===');
  
  // 6. Dashboard欢迎页
  console.log('访问Dashboard欢迎页...');
  await page.goto('http://localhost:3012', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/screenshots/dashboard-welcome.png', fullPage: true });
  console.log('OK Dashboard欢迎页截图完成');
  
  // 7. Dashboard阿拉伯语
  console.log('访问Dashboard阿拉伯语...');
  await page.goto('http://localhost:3012?lang=ar', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/screenshots/dashboard-ar.png', fullPage: true });
  console.log('OK Dashboard阿拉伯语截图完成');
  
  console.log('');
  console.log('=== Task 4: SSO跨站点登录流程 ===');
  
  // 8. SSO流程 - Step 1: Dashboard欢迎页
  console.log('Step 1: 访问Dashboard...');
  await page.goto('http://localhost:3012', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/screenshots/sso-flow-1-dashboard-welcome.png', fullPage: true });
  
  // 9. SSO流程 - Step 2: 点击登录按钮，跳转到Auth
  console.log('Step 2: 点击登录按钮...');
  await page.click('text=/Log In.*Sign Up/i');
  await page.waitForURL('**/auth**', { timeout: 10000 });
  await page.screenshot({ path: 'test-results/screenshots/sso-flow-2-auth-login.png', fullPage: true });
  console.log('OK 跳转到Auth站点成功');
  
  // 10. SSO流程 - Step 3: 填写登录表单
  console.log('Step 3: 填写登录表单...');
  await page.fill('input[type="email"]', 'sun.bo@bs01ai.com');
  await page.fill('input[type="password"]', '12345678');
  
  // 11. SSO流程 - Step 4: 提交登录
  console.log('Step 4: 提交登录...');
  await page.click('button:has-text("Sign In"), button:has-text("ログイン")');
  
  try {
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('OK 登录成功，跳转到Dashboard');
    
    // 等待页面加载完成
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/screenshots/sso-flow-3-dashboard-loggedin.png', fullPage: true });
    
    // 获取Cookie
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => c.domain.includes('localhost'));
    console.log('Cookie信息:', JSON.stringify(authCookies, null, 2));
    
  } catch (error) {
    console.log('ERROR 登录流程失败:', error.message);
  }
  
  // 保存Console错误
  if (consoleErrors.length > 0) {
    const fs = require('fs');
    fs.writeFileSync('test-results/logs/console-errors.txt', consoleErrors.join('\n'));
    console.log('');
    console.log('WARNING 发现 ' + consoleErrors.length + ' 个Console错误');
  } else {
    console.log('');
    console.log('OK 无Console错误');
  }
  
  await browser.close();
  console.log('');
  console.log('测试完成！');
})();
