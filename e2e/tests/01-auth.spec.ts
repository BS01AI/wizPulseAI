import { test, expect } from '@playwright/test';

test.describe('Auth site basic', () => {
  test('loads the auth page', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    // Expect title or any recognizable element to be present
    await expect(page).toHaveTitle(/auth|login|signin|登录|認証/i);
    // Common inputs exist somewhere (email/password)
    const inputs = page.locator('input');
    const cnt = await inputs.count();
    expect(cnt).toBeGreaterThan(0);
  });
});
