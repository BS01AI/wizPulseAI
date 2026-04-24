import { test, expect } from '@playwright/test';

/**
 * DISPATCH-094 / 089 Phase 7 smoke:
 * Editorial theme应用確認、legacy theme 共存確認。
 */

test.describe('Magicoord editorial theme', () => {
  test('default (no cookie) applies editorial theme', async ({ page, baseURL }) => {
    await page.context().clearCookies();
    await page.goto(baseURL! + '/ja/fashion');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'editorial');
  });

  test('MAGI_THEME=editorial cookie sets editorial', async ({ page, baseURL, context }) => {
    await context.addCookies([
      {
        name: 'MAGI_THEME',
        value: 'editorial',
        domain: new URL(baseURL!).hostname,
        path: '/',
      },
    ]);
    await page.goto(baseURL! + '/ja/fashion');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'editorial');
  });

  test('legacy MAGI_THEME=noir still resolves (no crash)', async ({
    page,
    baseURL,
    context,
  }) => {
    await context.addCookies([
      {
        name: 'MAGI_THEME',
        value: 'noir',
        domain: new URL(baseURL!).hostname,
        path: '/',
      },
    ]);
    const response = await page.goto(baseURL! + '/ja/fashion');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'noir');
  });
});
