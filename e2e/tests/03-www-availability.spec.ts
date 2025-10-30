import { test, expect } from '@playwright/test';

test.describe('Main site availability', () => {
  test('homepage renders key sections', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/');
    // Expect at least the header/footer or hero section to be present
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
  });
});

