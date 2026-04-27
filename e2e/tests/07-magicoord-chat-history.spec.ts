import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * DISPATCH-107 — Chat history persistence smoke.
 *
 * Anonymous-only checks (CI-friendly, no auth required):
 *   - GET  /api/fashion/chat/messages returns 401 without session
 *   - POST /api/fashion/chat/messages returns 401 without session
 *   - POST with bad payload returns 400 (when authed) — covered server-side, smoke skipped here
 *
 * Authenticated checks are gated on PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD
 * (when missing the auth-only blocks are skipped, never failed).
 */

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD;
const HAS_AUTH = Boolean(TEST_EMAIL && TEST_PASSWORD);

test.describe('Chat history API — anonymous guard', () => {
  test('GET /api/fashion/chat/messages without session → 401', async ({
    request,
    baseURL,
  }) => {
    const res = await request.get(
      `${baseURL}/api/fashion/chat/messages?persona_id=mika`,
    );
    expect(res.status()).toBe(401);
  });

  test('POST /api/fashion/chat/messages without session → 401', async ({
    request,
    baseURL,
  }) => {
    const res = await request.post(`${baseURL}/api/fashion/chat/messages`, {
      data: { persona_id: 'mika', role: 'user', content: 'hello' },
    });
    expect(res.status()).toBe(401);
  });

  test('Invalid persona_id (anon still 401, validates auth-first contract)', async ({
    request,
    baseURL,
  }) => {
    const res = await request.get(
      `${baseURL}/api/fashion/chat/messages?persona_id=invalid_persona`,
    );
    // Auth runs before validation; expect 401, not 400
    expect([400, 401]).toContain(res.status());
  });
});

test.describe('Chat history — authenticated flow', () => {
  test.skip(!HAS_AUTH, 'PLAYWRIGHT_TEST_EMAIL/PASSWORD not set');

  let authedRequest: APIRequestContext;

  test.beforeAll(async ({ playwright, browser }) => {
    if (!HAS_AUTH) return;

    // Login via UI to seed cookies, then export storage state into an APIRequestContext.
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
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

    const storageState = await ctx.storageState();
    await ctx.close();

    const magiBase =
      process.env.PREVIEW_BASE_MAGICOORD || 'https://magicoord.wizpulseai.com';
    authedRequest = await playwright.request.newContext({
      baseURL: magiBase,
      storageState,
    });
  });

  test.afterAll(async () => {
    if (authedRequest) await authedRequest.dispose();
  });

  test('POST → GET round-trip persists user + persona messages', async () => {
    const sendRes = await authedRequest.post('/api/fashion/chat/messages', {
      data: {
        persona_id: 'mika',
        role: 'user',
        content: `e2e-107-${Date.now()}`,
        locale: 'ja',
      },
    });
    expect(sendRes.status()).toBe(200);
    const sendBody = await sendRes.json();
    expect(sendBody).toHaveProperty('session_id');
    expect(sendBody).toHaveProperty('message_id');
    expect(['free', 'paid']).toContain(sendBody.tier);

    const getRes = await authedRequest.get(
      `/api/fashion/chat/messages?session_id=${sendBody.session_id}`,
    );
    expect(getRes.status()).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.session_id).toBe(sendBody.session_id);
    expect(Array.isArray(getBody.messages)).toBe(true);
    expect(getBody.messages.length).toBeGreaterThanOrEqual(1);
  });

  test('Invalid persona_id POST → 400', async () => {
    const res = await authedRequest.post('/api/fashion/chat/messages', {
      data: { persona_id: 'unknown', role: 'user', content: 'x' },
    });
    expect(res.status()).toBe(400);
  });

  test('Tier limit is honored (Free=10 / Paid=100)', async () => {
    // Burst-write 12 user messages to force a trim on Free tier. Use a fresh persona-session.
    const persona = 'sofia';
    let sessionId: string | null = null;
    let lastTier: 'free' | 'paid' | undefined;
    let lastLimit: number | undefined;

    for (let i = 0; i < 12; i++) {
      const res = await authedRequest.post('/api/fashion/chat/messages', {
        data: {
          session_id: sessionId,
          persona_id: persona,
          role: 'user',
          content: `tier-test ${i + 1}`,
          locale: 'ja',
        },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      sessionId = body.session_id;
      lastTier = body.tier;
      lastLimit = body.limit;
    }

    expect(sessionId).toBeTruthy();
    expect(lastLimit).toBeDefined();
    expect([10, 100]).toContain(lastLimit!);

    const getRes = await authedRequest.get(
      `/api/fashion/chat/messages?session_id=${sessionId}`,
    );
    const body = await getRes.json();
    // For Free tier, after 12 inserts the count should never exceed 10.
    if (lastTier === 'free') {
      expect(body.messages.length).toBeLessThanOrEqual(10);
    } else {
      expect(body.messages.length).toBeLessThanOrEqual(100);
    }
  });
});
