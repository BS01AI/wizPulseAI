# Matrix App Security And AI Cost Standard

Last updated: 2026-05-25

This document defines the global abuse-protection and AI-cost rules for every WizPulseAI matrix app. Use it when creating, reviewing, or shipping any product client such as Magicoord, ExpoGeo, Dino Kids, or future apps.

It complements:

- `docs/guides/MATRIX_NEW_APP_STANDARD.md`
- `docs/guides/MATRIX_APP_PRODUCT_CONTRACT_STANDARD.md`
- `docs/guides/MATRIX_IOS_COMPANION_APP_STANDARD.md`
- `docs/guides/MATRIX_ANDROID_COMPANION_APP_STANDARD.md`

## Core Rule

Every public API and every AI-costing feature must have an owner, a product code, a rate limit, and a cost boundary before it ships.

Product apps may own product experience and app-specific data. They must not own raw billing truth, Stripe truth, or open-ended AI spend.

## Product Code And Scope

Use the canonical matrix product code everywhere:

```text
magicoord
expo_geo
dino_kids
```

Do not mix underscore and hyphen product codes in backend limits, billing, entitlement, or app-data schemas. If a URL uses a hyphen for readability, normalize it at the API boundary.

Recommended scopes:

```text
<product_code>:bootstrap
<product_code>:progress-read
<product_code>:progress-write
<product_code>:photo-analysis
<product_code>:generation
<product_code>:chat
matrix:credits-checkout
matrix:credits-packages
```

## Required Protection Layers

### 1. Public Read APIs

Examples:

- Credit package list
- Product catalog
- App metadata
- Public content APIs

Requirements:

- IP or anonymous identifier based rate limit.
- CORS allowlist when the API is used cross-subdomain.
- No service-role data leakage.
- Cache where product behavior allows it.

Baseline:

```text
60 requests / minute
1000 requests / hour
5000 requests / day
```

Tighten this for expensive queries.

### 2. Authenticated User APIs

Examples:

- App bootstrap
- Credit balance refresh
- Progress read/write
- Favorites sync
- Account profile update

Requirements:

- User-id based rate limit after authentication.
- IP fallback only for unauthenticated attempts.
- RLS or server-side ownership checks.
- Product code must be explicit.

Baseline read:

```text
60 requests / minute
1000 requests / hour
5000 requests / day
```

Baseline write:

```text
30 requests / minute
500 requests / hour
2000 requests / day
```

Use lower limits for endpoints that create database rows, send email, create checkout sessions, or trigger external services.

### 3. Billing And Checkout APIs

Examples:

- Create Stripe Checkout Session
- Create billing portal session
- Apply credit package purchase
- Admin credit adjustment

Requirements:

- Authenticated user required.
- Mutation guard or CSRF-equivalent protection for browser calls.
- User-id based rate limit.
- Idempotency for payment or ledger effects.
- No product app may call Stripe directly.

Baseline checkout:

```text
6 requests / minute
20 requests / hour
80 requests / day
```

Stripe webhooks must remain idempotent and must not depend on user browser state.

### 4. AI-Costing APIs

Examples:

- Photo analysis
- Outfit generation
- Chat with an AI persona
- Quiz generation
- Audio/image/video generation
- Any endpoint that calls OpenAI, Gemini, Claude, image models, TTS, STT, or vector search at meaningful cost

Requirements:

- Authenticated user required unless it is a deliberately capped demo.
- User-id based limit per AI feature.
- IP based limit for anonymous demo or share endpoints.
- Credit, quota, entitlement, or trial gate before the model call.
- Deduct or reserve credits before the expensive model call when possible.
- Return `429` with `Retry-After` when rate limited.
- Log enough metric data to diagnose abuse without storing sensitive prompts unnecessarily.

Recommended first-pass limits:

```text
photo-analysis:      10 / hour, 50 / day
outfit-generation:    3 / hour, 10 / day
chat:                60 / hour, 200 / day, plus daily token/cost budget
quiz-generation:     20 / hour, 100 / day
image-generation:     5 / hour, 20 / day
```

Tune by product value and model cost.

## AI Cost Gate Order

Use this order for expensive features:

1. Authenticate user or validate anonymous demo token.
2. Validate request shape and payload size.
3. Check per-user and/or per-IP rate limit.
4. Check entitlement, trial, quota, or credit balance.
5. Reserve or deduct credits when the product contract requires it.
6. Call the AI provider.
7. Persist result and usage metrics.
8. Refund or compensate only through an explicit failure path.

Never call the AI provider before rate limit and entitlement checks.

## App-Owned Data APIs

App-specific data belongs in `app_<product_code>` schemas or product-owned APIs.

Requirements:

- All user-owned rows must be scoped by `user_id`.
- Browser clients must not write service-role endpoints directly.
- Use RLS or RPCs that derive the user from `auth.uid()`.
- Keep payload limits explicit.
- Treat sync endpoints as write endpoints for rate-limit purposes.

Examples:

```text
app_expo_geo.progress
app_dino_kids.learning_progress
app_magicoord.analyses
```

## Mobile Companion Apps

iOS and Android companion clients are usage surfaces, not billing surfaces by default.

They may:

- Sign in.
- Read account state.
- Read credits, quotas, and entitlement state through approved matrix APIs.
- Consume already-owned credits only through approved matrix APIs.
- Sync app-owned product data.

They must not:

- Include Stripe SDKs.
- Create checkout sessions.
- Show purchase, recharge, upgrade, or external web-purchase calls to action.
- Store app-local copies of matrix credit ledgers or entitlement truth.

Mobile AI calls must use the same backend gates as web clients. Do not put model API keys in mobile apps.

## Implementation Owners

Default ownership:

```text
auth-wizpulseai-com
  Login, registration, SSO, OAuth, cookie/session flow.

db-wizPulseAI-com
  Matrix account APIs, Dashboard, Stripe, credits, entitlements,
  checkout, webhook, shared rate-limit tables, app bootstrap APIs.

product app repo
  Product UI, product data calls, app-owned local state,
  client-side loading/error states, no Stripe truth.
```

If an app needs an AI endpoint, choose one of two patterns:

1. App-local AI endpoint with matrix-compatible rate limits and credit checks.
2. Matrix-owned AI endpoint when the feature is shared across apps.

Do not create a third independent billing or entitlement system inside the app.

## Required New App Checklist

Before a new app ships:

1. Product code is stable and registered in `public.ai_products`.
2. App schema exists as `app_<product_code>` if server-synced data is needed.
3. App feature definitions exist in `billing.feature_definitions`.
4. App uses `/api/apps/bootstrap` or an approved equivalent for account and entitlement state.
5. Public read APIs have IP/anonymous rate limits.
6. Authenticated read/write APIs have user-id rate limits.
7. AI-costing APIs have per-user limits and entitlement/credit/quota gates before model calls.
8. Checkout, Stripe, webhook, and credit-ledger writes stay in `db-wizPulseAI-com`.
9. Mobile clients do not contain model API keys, Stripe keys, or purchase CTAs.
10. Smoke tests cover login, API read, API write, and at least one rate-limit or quota failure state.

## Review Questions For Every New Endpoint

Ask these before merging:

- Who can call this endpoint: anonymous, signed-in user, app server, admin, webhook?
- What is the product code and feature scope?
- Is it read-only or does it mutate data?
- Can it create external cost: AI, Stripe, email, storage, image processing, third-party APIs?
- What happens if someone calls it 10,000 times?
- Is rate limiting user-based, IP-based, or both?
- Does it return a clean `429` with `Retry-After`?
- Does it leak stack traces, service errors, private IDs, or provider responses?
- Is the behavior the same across Web, iOS, and Android clients?

## Current Reference Implementations

Dashboard matrix API protection:

```text
db-wizPulseAI-com/src/lib/security/api-rate-limit.ts
db-wizPulseAI-com/supabase/migrations/20260525010000_add_matrix_api_rate_limits.sql
```

Protected Dashboard endpoints:

```text
GET  /api/credits/packages
POST /api/credits/checkout
GET  /api/apps/bootstrap
GET  /api/apps/expo-geo/progress
POST /api/apps/expo-geo/progress
```

Magicoord AI cost protection:

```text
fashion-wizpulseai-com/src/lib/security/rate-limiter.ts
fashion-wizpulseai-com/src/config/ai-config.ts
fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts
fashion-wizpulseai-com/src/app/api/fashion/upload/route.ts
fashion-wizpulseai-com/src/app/api/fashion/edit-outfit/route.ts
fashion-wizpulseai-com/src/app/api/fashion/test-vision/route.ts
fashion-wizpulseai-com/src/app/api/fashion/chat/messages/route.ts
```

Use these as implementation references, not as permission to copy product-specific tables or legacy naming into new apps.
