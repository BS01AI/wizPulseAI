import { test, expect } from '@playwright/test';

/**
 * DISPATCH-108 — magicoord 5-persona group chat (mock backend) smoke.
 *
 * Anonymous tier-gate checks (CI-friendly, no auth required):
 *   - /[locale]/fashion/chat/group renders 200 in 4 locales
 *   - Without auth, the Premium tier-gate copy is shown (sign-in CTA path)
 *   - The chat input is NOT present for non-Paid tier (gate blocks it)
 *
 * Authenticated checks are gated on PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD,
 * skipping rather than failing when env is absent.
 */

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD;
const HAS_AUTH = Boolean(TEST_EMAIL && TEST_PASSWORD);

const LOCALES = ['ja', 'en', 'zh-TW', 'ar'] as const;

test.describe('Group chat — anonymous gate', () => {
  // FashionLayout wraps the route in an AuthGuard that triggers a client-side
  // redirect to the auth site for unauthenticated visitors. We assert:
  //   (a) initial server response is 200 (SSR tier-gate HTML emitted)
  //   (b) the live 5-AI input never appears (gate / redirect blocks it)
  for (const locale of LOCALES) {
    test(`/${locale}/fashion/chat/group SSR returns 200, no chat input for anon`, async ({
      page,
      baseURL,
    }) => {
      const res = await page.goto(`${baseURL}/${locale}/fashion/chat/group`, {
        waitUntil: 'domcontentloaded',
      });
      expect(res?.status()).toBe(200);

      // Briefly wait so AuthGuard either redirects or settles.
      await page.waitForTimeout(800);

      // Whether we landed on auth (redirect) or stayed on a tier gate, the
      // privileged group chat input must NOT be present for an anon user.
      const input = page.getByTestId('group-chat-input');
      await expect(input).toHaveCount(0);
    });
  }
});

test.describe('Group chat — API persona contract (DISPATCH-108 extension)', () => {
  test('POST with persona_id=group while anon → 401 (auth-first contract)', async ({
    request,
    baseURL,
  }) => {
    const res = await request.post(`${baseURL}/api/fashion/chat/messages`, {
      data: {
        persona_id: 'group',
        role: 'user',
        content: 'group e2e ' + Date.now(),
      },
    });
    expect(res.status()).toBe(401);
  });

  test('POST with persona_id=luna while anon → 401 (auth-first contract)', async ({
    request,
    baseURL,
  }) => {
    const res = await request.post(`${baseURL}/api/fashion/chat/messages`, {
      data: { persona_id: 'luna', role: 'persona', content: 'x' },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('Group chat — authenticated paid flow', () => {
  test.skip(!HAS_AUTH, 'PLAYWRIGHT_TEST_EMAIL/PASSWORD not set');

  test('Paid user sees 5-AI panel and can submit a prompt', async ({
    page,
    baseURL,
  }) => {
    const authBase = process.env.PREVIEW_BASE_AUTH || 'https://auth.wizpulseai.com';
    await page.goto(`${authBase}/auth/signin?next=/`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await emailInput.fill(TEST_EMAIL!);
      await passwordInput.fill(TEST_PASSWORD!);
      await page
        .getByRole('button', { name: /sign in|ログイン|登入/i })
        .first()
        .click()
        .catch(() => {});
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    }

    await page.goto(`${baseURL}/ja/fashion/chat/group`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const input = page.getByTestId('group-chat-input');
    if ((await input.count()) === 0) {
      // Test account is Free tier; expected.
      const tierGateCta = page.getByText(/プラン|plan|方案|باقة/i).first();
      await expect(tierGateCta).toBeVisible();
      return;
    }

    await input.fill('e2e-108-test ' + Date.now());
    await page.getByTestId('group-chat-send').click();

    // After 5 stagger replies (~3.5s) all 5 personas should have authored a bubble.
    await page.waitForTimeout(5_500);

    // Persona name labels should be present at least once for each persona.
    for (const name of ['Mika', 'Luna', 'Alex', 'Rin', 'Sofia']) {
      const label = page.getByText(name, { exact: true }).first();
      await expect(label).toBeVisible();
    }
  });

  test('Follow-up button stub fires "Coming Soon" toast', async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/ja/fashion/chat/group`);
    const colorBtn = page.getByTestId('follow-up-color');
    if ((await colorBtn.count()) === 0) {
      // Free tier — gate blocks the panel; nothing to assert here.
      return;
    }
    await colorBtn.click();
    // Toast text: "Next turn coming soon" / "次のターンは近日公開"
    const toast = page.getByText(/coming|公開|開放|قريباً/i).first();
    await expect(toast).toBeVisible({ timeout: 3_000 });
  });
});
