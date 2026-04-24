import { test, expect } from '@playwright/test';

/**
 * DISPATCH-094 regression suite:
 * 079/078/091 修正 bug が再発してないか確認。
 */

test.describe('Magicoord API regressions', () => {
  test('community posts API returns 200 (not 500 as before 079)', async ({ request, baseURL }) => {
    const response = await request.get(
      `${baseURL}/api/community/posts?page=1&sort=latest`,
    );
    expect(response.status()).toBeLessThan(500);
    const json = await response.json();
    expect(json).toHaveProperty('posts');
  });

  test('pricing page has back nav + no 401 console pollution', async ({ page, baseURL }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('401')) return;
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`${baseURL}/ja/pricing`);

    // Back link should exist (078 P2-2 fix)
    const backLink = page
      .getByRole('link', { name: /戻る|Back|返回/ })
      .first();
    await expect(backLink).toBeVisible();

    // No 401 from /api/credits/balance (078 P2-1 fix)
    const has401 = consoleErrors.some((e) => e.includes('401'));
    expect(has401, 'P2-1 regression: /api/credits/balance 401 leaks for unauth').toBe(false);
  });
});

test.describe('Magicoord homepage regressions', () => {
  test('homepage loads with 50pt bonus mention (078 P0-5 fix)', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ja`);
    const body = await page.locator('body').innerText();
    // 50pt text should appear (not 30pt)
    expect(body).toMatch(/50\s*pt/i);
  });

  test('pricing standard pack shows +3% bonus badge (078 P0-3 fix)', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/ja/pricing`);
    const body = await page.locator('body').innerText();
    // Standard pack should show +3% explicitly (not裸数字 "0")
    expect(body).toMatch(/\+3\s*%/);
    // light pack should NOT show "0" for bonus (regression check)
    expect(body).not.toMatch(/ライトパック[\s\S]{0,120}\+?0(?!pt)/);
  });
});
