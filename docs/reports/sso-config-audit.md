# SSO & Cross-Site Configuration Audit Report

**Date**: 2026-04-02
**Scope**: All 4 Next.js sites under wizPulseAI
**Auditor**: Claude Opus 4.6

---

## Executive Summary

The SSO implementation across the 4 sites is **largely consistent** but has several issues requiring attention. The most critical findings are:

1. **Dashboard middleware missing cookie domain** -- SSO cookies may not propagate correctly
2. **SameSite inconsistency** -- Fashion site uses `SameSite=none` for `__Secure-` prefixed cookies while all other sites use `lax`
3. **Redirect whitelist uses wrong domain** -- Auth site whitelists `fashion.wizpulseai.com` instead of `magicoord.wizpulseai.com`
4. **Legacy Supabase packages** still present in 3 of 4 sites
5. **Hardcoded fallback URLs** scattered across all sites instead of using a centralized config

**Overall SSO Health Score: 7/10**

---

## 1. Supabase Client Configuration

### 1.1 Package Versions

| Site | @supabase/supabase-js | @supabase/ssr | @supabase/auth-helpers-nextjs | @supabase/auth-helpers-react |
|------|----------------------|---------------|-------------------------------|------------------------------|
| Auth | ^2.81.1 | ^0.7.0 | ^0.10.0 | -- |
| Dashboard | ^2.81.1 | ^0.7.0 | ^0.10.0 | ^0.5.0 |
| Fashion | ^2.81.1 | ^0.7.0 | -- | -- |
| Main (www) | ^2.81.1 | ^0.7.0 | ^0.10.0 | ^0.5.0 |

| Finding | Status |
|---------|--------|
| @supabase/supabase-js version consistency | PASS |
| @supabase/ssr version consistency | PASS |
| Legacy @supabase/auth-helpers-nextjs still in package.json | WARNING -- present in Auth, Dashboard, Main |
| Legacy @supabase/auth-helpers-react still in package.json | WARNING -- present in Dashboard, Main |

**Recommendation**: Remove `@supabase/auth-helpers-nextjs` and `@supabase/auth-helpers-react` from all sites. They are superseded by `@supabase/ssr` and keeping them risks accidentally importing the wrong package.

### 1.2 Environment Variable Usage

All 4 sites correctly reference `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` via `process.env`. No hardcoded Supabase project URLs or anon keys were found.

| Finding | Status |
|---------|--------|
| Supabase URL via env var | PASS |
| Supabase anon key via env var | PASS |
| Service role key via env var (server-only) | PASS |
| No hardcoded keys in source | PASS |

### 1.3 Cookie Domain Configuration

| Site | File | Cookie Domain Source | Fallback |
|------|------|---------------------|----------|
| **Auth** (browser) | `src/lib/supabase-browser.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `.wizpulseai.com` |
| **Auth** (server) | `src/lib/supabase-server.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `.wizpulseai.com` |
| **Dashboard** (browser) | `src/shared/auth/supabase-browser.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `.wizpulseai.com` |
| **Dashboard** (server) | `src/lib/supabase/server.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `.wizpulseai.com` (with `.localhost` dev fallback) |
| **Dashboard** (middleware) | `src/middleware.ts:64-108` | **NONE** | **NONE -- uses raw options** |
| **Fashion** (browser - infra) | `src/infrastructure/supabase/client.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `.wizpulseai.com` |
| **Fashion** (server - infra) | `src/infrastructure/supabase/server.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `.wizpulseai.com` |
| **Fashion** (middleware - infra) | `src/infrastructure/supabase/middleware.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `.wizpulseai.com` |
| **Fashion** (top middleware) | `src/middleware.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `.wizpulseai.com` |
| **Fashion** (shared browser) | `src/shared/auth/supabase-browser.ts` | Via `AUTH_CONFIG` | `.wizpulseai.com` |
| **Main** (browser) | `src/shared/auth/supabase-browser.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `.wizpulseai.com` |
| **Main** (middleware) | `src/middleware.ts` | `NEXT_PUBLIC_COOKIE_DOMAIN` | `undefined` (current host) |

| Finding | Status |
|---------|--------|
| Auth cookie domain consistent | PASS |
| Dashboard browser client cookie domain | PASS |
| Dashboard server client cookie domain | PASS |
| **Dashboard middleware missing cookie domain** | **FAIL** |
| Fashion cookie domain consistent | PASS |
| Main cookie domain consistent | PASS |

**CRITICAL -- Dashboard Middleware (lines 64-108 of `db-wizPulseAI-com/src/middleware.ts`)**:
The `checkAdminAccess()` function creates a Supabase client in middleware but does NOT set `domain`, `sameSite`, or `secure` on the cookie `set`/`remove` handlers. It passes through the raw `options` from the Supabase library. This means:
- Cookies set during middleware admin checks may default to the current subdomain only
- They will not propagate to other subdomains, potentially causing session inconsistencies

### 1.4 SameSite Attribute Consistency

| Site | Regular cookies | `__Secure-` prefixed | `__Host-` prefixed |
|------|----------------|---------------------|-------------------|
| Auth (browser) | `lax` | `lax` | `lax` |
| Dashboard (browser) | `lax` | `lax` | `lax` |
| **Fashion (infra browser)** | `lax` | **`none`** | `lax` |
| **Fashion (shared browser)** | `lax` | **`none`** | `lax` |
| **Shared SDK** | `lax` | **`none`** | `lax` |
| Main (browser) | `lax` | `lax` | `lax` |
| All server clients | `lax` | N/A | N/A |
| All middleware | `lax` | N/A | N/A |

| Finding | Status |
|---------|--------|
| Regular cookies use `lax` everywhere | PASS |
| `__Secure-` cookies: Auth & Dashboard use `lax` | PASS |
| **`__Secure-` cookies: Fashion & Shared use `none`** | **WARNING** |

**Analysis**: The Fashion site (and the shared SDK in `/shared/auth/`) sets `SameSite=none` for `__Secure-` prefixed cookies, while Auth, Dashboard, and Main use `SameSite=lax`. `SameSite=none` allows cross-origin requests to send the cookie, which is less secure against CSRF. Since all sites are subdomains of the same TLD (`.wizpulseai.com`), `lax` is correct and `none` is unnecessary. This should be unified to `lax`.

### 1.5 Secure Flag Handling

| Site | Production | Development |
|------|-----------|-------------|
| Auth (browser) | `Secure` (unless `.localhost` or `.local.wiz`) | No `Secure` flag |
| Dashboard (browser) | Same pattern | Same pattern |
| Fashion (infra browser) | `Secure` (unless `localhost` in domain) | No `Secure` flag |
| Main (browser) | Same as Auth/Dashboard | Same |
| All server clients | `secure: process.env.NODE_ENV === 'production'` | `secure: false` |

| Finding | Status |
|---------|--------|
| Secure flag in production | PASS |
| Secure flag disabled for localhost dev | PASS |
| Dev detection: Auth/Dashboard/Main check `.localhost` AND `.local.wiz` | PASS |
| **Dev detection: Fashion infra only checks `localhost` (no `.local.wiz`)** | **WARNING** |

### 1.6 httpOnly Setting

None of the browser clients set `httpOnly`. This is **correct behavior** -- browser-side JavaScript must be able to read auth cookies for the Supabase client to work. The server-side clients rely on `next/headers` `cookies()` which handles `httpOnly` according to the framework defaults.

| Finding | Status |
|---------|--------|
| Browser clients do not set httpOnly | PASS (expected) |

### 1.7 maxAge / Cookie Lifetime

| Site/Layer | Default maxAge |
|------------|---------------|
| Auth browser | 7 days |
| Dashboard browser | 7 days |
| Fashion infra browser | 7 days |
| **Fashion shared browser** | **365 days** |
| Main browser | 7 days |
| Fashion server | 7 days |

| Finding | Status |
|---------|--------|
| **Fashion shared/auth/supabase-browser.ts uses 365-day maxAge** | **WARNING** |
| All others use 7-day maxAge | PASS |

**Recommendation**: Unify to 7 days. A 365-day auth cookie is excessive and increases the window for session hijacking.

---

## 2. CORS Configuration

### 2.1 CORS Utility

A centralized CORS utility exists at `db-wizPulseAI-com/src/lib/cors.ts`:

```typescript
const ALLOWED_ORIGINS = [
  'https://magicoord.wizpulseai.com',
  'https://dashboard.wizpulseai.com',
  'https://auth.wizpulseai.com',
  'https://www.wizpulseai.com',
]
// + localhost:3010-3013 in development
```

| Finding | Status |
|---------|--------|
| CORS uses origin whitelist (not wildcard `*`) | PASS |
| Credentials header only sent for allowed origins | PASS |
| Empty string returned for disallowed origins | PASS |
| Development localhost ports included | PASS |

### 2.2 Routes Using CORS

The following Dashboard API routes use `getCorsHeaders()`:

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/credits/balance` | GET, OPTIONS | Credit balance (cross-site from Fashion) |
| `/api/credits/checkout` | POST, OPTIONS | Credit purchase (cross-site from Fashion) |
| `/api/credits/packages` | GET, OPTIONS | Package listing (cross-site from Fashion) |
| `/api/credits/transactions` | GET, OPTIONS | Transaction history (cross-site from Fashion) |
| `/api/referrals/shares` | GET, POST, OPTIONS | Referral shares (cross-site) |
| `/api/referrals/stats` | GET, OPTIONS | Referral statistics (cross-site) |

### 2.3 Routes WITHOUT CORS That May Need It

The following Dashboard routes do NOT use the CORS utility. Most are admin-only or same-origin, which is correct:

| Route | Risk |
|-------|------|
| `/api/subscriptions/*` | Low -- same-origin Dashboard only |
| `/api/admin/*` | None -- admin only, same-origin |
| `/api/config/*` | Low -- same-origin |
| `/api/auth/refresh-token` | **Medium** -- if Fashion ever calls this cross-origin |
| `/api/fashion/stats` | **Medium** -- Fashion site might call this |
| `/api/verify-usage` | Low |

### 2.4 Other Sites CORS Status

| Site | CORS Headers in API Routes | Finding |
|------|---------------------------|---------|
| Auth | None found | PASS -- Auth APIs are not called cross-origin |
| Fashion | None found | PASS -- Fashion calls Dashboard APIs, not its own cross-origin |
| Main (www) | None found | PASS -- Main has minimal APIs |

| Finding | Status |
|---------|--------|
| No wildcard `*` CORS anywhere | PASS |
| Dashboard uses proper whitelist | PASS |
| `/api/fashion/stats` may need CORS if called from Fashion | WARNING |

---

## 3. Hardcoded URLs

### 3.1 Critical Findings

#### FAIL: Auth Redirect Whitelist Uses Wrong Domain

**File**: `auth-wizpulseai-com/src/lib/utils/redirect.ts:11`
```typescript
'https://fashion.wizpulseai.com'  // WRONG - actual domain is magicoord.wizpulseai.com
```

The actual Fashion site domain is `magicoord.wizpulseai.com`, not `fashion.wizpulseai.com`. This means redirects from auth back to the Fashion site after login will be **blocked** as an unauthorized redirect target.

| Finding | Status |
|---------|--------|
| **Auth redirect whitelist has wrong Fashion domain** | **FAIL** |

#### WARNING: Hardcoded Fallback URLs Instead of Env Vars

Many files use hardcoded URLs as fallback values (after `||`). While they reference `process.env` first, the fallbacks are scattered and inconsistent:

| Pattern | Occurrences | Example |
|---------|-------------|---------|
| `process.env.NEXT_PUBLIC_APP_URL \|\| 'http://localhost:3012'` | ~6 in Auth | `auth/page.tsx` |
| `process.env.NEXT_PUBLIC_AUTH_URL \|\| 'https://auth.wizpulseai.com'` | ~5 in Dashboard | `logout/page.tsx`, `mfa/page.tsx` |
| `process.env.NEXT_PUBLIC_MAIN_URL \|\| 'https://www.wizpulseai.com'` | ~4 in Dashboard, Fashion | `layout.tsx`, `page.tsx` |
| `process.env.NEXT_PUBLIC_DASHBOARD_URL \|\| 'https://dashboard.wizpulseai.com'` | ~3 in Fashion | `settings/page.tsx`, `checkout/route.ts` |
| `process.env.NEXT_PUBLIC_AUTH_URL \|\| 'http://auth.local.wiz:3011'` | 1 in Fashion middleware | `infrastructure/supabase/middleware.ts:110` |

**Notable inconsistency in Fashion site**:
- `src/infrastructure/supabase/middleware.ts:110` falls back to `http://auth.local.wiz:3011` (dev URL)
- `src/app/api/credits/checkout/route.ts:25` falls back to `http://localhost:3012` (dev URL)
- `src/shared/auth/config.ts:17` falls back to `https://auth.wizpulseai.com` (prod URL)

| Finding | Status |
|---------|--------|
| Env vars used as primary source | PASS |
| Fallback URLs inconsistent (some prod, some dev) | WARNING |
| No single config file for cross-site URLs | WARNING |

### 3.2 Acceptable Hardcoded URLs

These are appropriate uses of hardcoded URLs (content, SEO, legal pages):

| Category | Examples | Status |
|----------|----------|--------|
| SEO/sitemap | `https://www.wizpulseai.com/sitemap.xml` | PASS |
| Legal page links | `https://www.wizpulseai.com/about/terms` | PASS |
| Schema.org metadata | `"url": "https://www.wizpulseai.com"` | PASS |
| Logger type definitions | Comment-only domain references | PASS |

### 3.3 Main Site UserMenu Hardcoded URLs

**File**: `wizPulseAI-com/src/components/UserMenu.tsx:76-83`
```typescript
? 'https://dashboard.wizpulseai.com'
: 'http://localhost:3012'
? 'https://auth.wizpulseai.com'
: 'http://localhost:3011'
```

This uses a ternary based on `NODE_ENV` but does not read from env vars.

| Finding | Status |
|---------|--------|
| **UserMenu.tsx has hardcoded URLs without env var fallback** | **WARNING** |

---

## 4. Additional Findings

### 4.1 Fashion Site Has 3 Duplicate Supabase Client Directories

The Fashion site has Supabase client code in three locations:

| Directory | Status | Notes |
|-----------|--------|-------|
| `src/infrastructure/supabase/` | **Active** (canonical) | Full implementation, 7 files |
| `src/core/database/supabase/` | Deprecated | Re-exports to infrastructure |
| `src/lib/supabase/` | Deprecated | Re-exports to infrastructure |

| Finding | Status |
|---------|--------|
| Fashion has 3 supabase directories (2 deprecated re-exports) | WARNING |

**Recommendation**: Remove the deprecated directories once all imports are migrated.

### 4.2 Dashboard Middleware Missing SSO Cookie Config

**File**: `db-wizPulseAI-com/src/middleware.ts:64-108`

The `checkAdminAccess()` function creates a Supabase middleware client but does NOT override cookie domain/sameSite/secure:

```typescript
cookies: {
  set(name: string, value: string, options: any) {
    // Missing: domain, sameSite, secure overrides
    request.cookies.set({ name, value, ...options });
    response.cookies.set({ name, value, ...options });
  },
}
```

All other middleware implementations (Auth, Fashion top-level, Fashion infrastructure) correctly set SSO-compatible cookie options. This is the only middleware that does not.

| Finding | Status |
|---------|--------|
| **Dashboard middleware does not set SSO cookie domain** | **FAIL** |

### 4.3 Main Site Has Two middleware.ts Files

| File | Purpose |
|------|---------|
| `wizPulseAI-com/middleware.ts` (root) | Old next-intl middleware with locales `['en', 'ja', 'zh']` |
| `wizPulseAI-com/src/middleware.ts` | New custom middleware with locales `['en', 'ja', 'ar', 'zh-TW']` |

Next.js uses the root `middleware.ts` by default. If `src/middleware.ts` is the intended one, the root file is a conflict.

| Finding | Status |
|---------|--------|
| **Main site has conflicting middleware files** | **WARNING** |

### 4.4 Auth Site Verbose Cookie Logging in Production

**File**: `auth-wizpulseai-com/src/lib/supabase-server.ts:23`
```typescript
console.log('[SupabaseServerClient] Setting cookie:', name, 'value:', value, 'with options:', options);
```

This logs **full cookie values** (including auth tokens) to stdout on every cookie set operation. In production, this exposes sensitive session tokens in server logs.

| Finding | Status |
|---------|--------|
| **Auth server client logs full cookie values unconditionally** | **FAIL** |

---

## 5. Summary Table

| # | Finding | Severity | Site(s) | Status |
|---|---------|----------|---------|--------|
| 1 | Dashboard middleware missing SSO cookie domain | High | Dashboard | FAIL |
| 2 | Auth redirect whitelist has `fashion.wizpulseai.com` instead of `magicoord.wizpulseai.com` | High | Auth | FAIL |
| 3 | Auth server logs full cookie values in production | High | Auth | FAIL |
| 4 | Fashion `__Secure-` cookies use `SameSite=none` (others use `lax`) | Medium | Fashion, Shared SDK | WARNING |
| 5 | Fashion shared browser client uses 365-day maxAge (others use 7 days) | Medium | Fashion | WARNING |
| 6 | Legacy `@supabase/auth-helpers-*` packages still in package.json | Medium | Auth, Dashboard, Main | WARNING |
| 7 | Hardcoded fallback URLs inconsistent (mix of prod/dev) | Medium | All sites | WARNING |
| 8 | Main site UserMenu has hardcoded URLs without env vars | Low | Main | WARNING |
| 9 | Fashion site has 3 duplicate supabase directories | Low | Fashion | WARNING |
| 10 | Main site has conflicting root vs src middleware.ts | Low | Main | WARNING |
| 11 | Fashion infra dev detection only checks `localhost` (not `.local.wiz`) | Low | Fashion | WARNING |

---

## 6. Recommendations (Priority Order)

### P0 -- Fix Immediately

1. **Fix Dashboard middleware cookie domain**: Add SSO cookie options (`domain`, `sameSite`, `secure`) to the `checkAdminAccess()` function in `db-wizPulseAI-com/src/middleware.ts`.

2. **Fix Auth redirect whitelist**: Change `fashion.wizpulseai.com` to `magicoord.wizpulseai.com` in `auth-wizpulseai-com/src/lib/utils/redirect.ts`.

3. **Remove production cookie value logging**: In `auth-wizpulseai-com/src/lib/supabase-server.ts`, either remove the `console.log` statements or gate them behind `NODE_ENV !== 'production'`.

### P1 -- Fix Soon

4. **Unify SameSite for `__Secure-` cookies**: Change `SameSite=none` to `SameSite=lax` in Fashion infra client (`src/infrastructure/supabase/client.ts`), Fashion shared client (`src/shared/auth/supabase-browser.ts`), and the shared SDK (`shared/auth/supabase-browser.ts`).

5. **Unify cookie maxAge**: Change Fashion shared browser client (`src/shared/auth/supabase-browser.ts`) from 365 days to 7 days.

6. **Remove legacy packages**: Run `npm uninstall @supabase/auth-helpers-nextjs @supabase/auth-helpers-react` in Auth, Dashboard, and Main sites.

### P2 -- Improve

7. **Centralize cross-site URL config**: Create a shared `site-urls.ts` config that all sites import, eliminating scattered hardcoded fallback URLs.

8. **Clean up Fashion duplicate directories**: Remove `src/core/database/supabase/` and `src/lib/supabase/` from Fashion after verifying no direct imports remain.

9. **Resolve Main site middleware conflict**: Determine which `middleware.ts` is active and remove the other.

---

*Report generated by automated SSO configuration audit.*
