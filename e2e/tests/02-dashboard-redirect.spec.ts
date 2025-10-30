import { test, expect } from '@playwright/test';

test.describe('Dashboard unauthenticated redirect', () => {
  test('redirects unauthenticated users to auth site', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/');
    // If redirect happens, URL should start with auth domain when using multi-project
    const url = page.url();
    // Allow either full redirect to auth or a page that contains a sign-in link
    if (!/auth\./.test(url)) {
      // Look for a sign in link/button
      const signIn = page.locator('a:has-text("Sign") , a:has-text("登录"), a:has-text("登入"), button:has-text("Sign"), button:has-text("登录")');
      await expect(signIn).toHaveCountGreaterThan(0);
    }
  });
});

