# Matrix App Product Contract Standard

Last updated: 2026-05-19

Every WizPulseAI matrix app needs a product contract before the same product is implemented on Web, iOS, Android, or future clients. The contract is the source of truth for feature parity, data shape, billing boundaries, and review expectations.

This is not a pixel-perfect UI spec. Web and native apps can use platform-appropriate layouts. They must still expose the same product meaning, account state, feature gates, and synced data behavior.

## Why This Exists

Without a product contract, each client drifts:

- Web and iOS show different features.
- Feature names and localizations diverge.
- One client stores product data differently from another.
- Billing or entitlement rules leak into the app layer.
- App Store review copy and web billing copy conflict.

For every product with more than one client, write the contract first, then implement clients against it.

## Required Contract File

Each app should keep a product contract in its own repo or subrepo:

```text
docs/PRODUCT_CONTRACT.md
```

If the app is already documented from the matrix root, mirror or link the contract from:

```text
docs/guides/<product_code>-product-contract.md
```

The product contract must be reviewed whenever a new client surface is added.

## Contract Sections

### 1. Product Identity

```text
Product code:
Public product name:
Dashboard app name:
Primary web domain:
iOS bundle id:
Apple Services ID:
App schema:
Billing owner:
Stripe owner:
```

Rules:

- `product_code` is stable lowercase snake_case.
- App data schema is `app_<product_code>`.
- Billing owner and Stripe owner remain matrix core unless explicitly approved.

### 2. Client Matrix

List every active client and its role:

```text
Web: primary product client / SEO / public entry
iOS: free companion app / traffic entry / logged-in usage
Android: free companion app / traffic entry / logged-in usage
Dashboard: account, credits, entitlements, support
```

For each client, mark:

- Current status: planned, alpha, beta, production.
- Auth mode: matrix web SSO, Supabase native auth, anonymous demo, or mixed.
- Data mode: local-only, sync-capable, or server-owned.
- Billing mode: none, read-only, or matrix-owned purchase through Dashboard.

### 3. Feature Inventory

Every user-visible feature needs one stable row:

```text
Feature key:
User-facing meaning:
Required auth:
Required entitlement:
Credit behavior:
Data written:
Required clients:
Optional clients:
Unavailable copy:
```

Rules:

- Required clients must implement the feature before the product is considered parity-ready.
- Optional clients can omit the feature only when the contract explains why.
- If a feature is gated, all clients must use the same `billing.feature_definitions` feature code.
- iOS unavailable copy must be neutral and cannot point users to web purchase pages.

### 4. Shared Data Shape

Define the canonical product data shape:

```text
Local state:
Remote state:
RPC read contract:
RPC write contract:
Merge rule:
Conflict rule:
Payload limits:
```

Rules:

- Web and native clients should read/write the same canonical shape.
- Local demo progress must merge into remote state after login when possible.
- Remote sync should use product-owned RPCs or APIs.
- App clients must not write billing ledgers or Stripe state.

### 5. Content Source

Define product content ownership:

```text
Content source:
Localization source:
Supported locales:
Fallback locale:
Review owner:
```

Rules:

- If content is static, prefer one canonical JSON/TS source or a clearly mirrored generated file.
- If content is stored in Supabase, both Web and native clients must read the same rows or the same API output.
- All user-visible feature labels must be localized for the product's supported languages.

### 6. UI Parity Rules

Web and native layouts may differ. These must stay equivalent:

```text
Navigation meaning
Primary task flow
Logged-out state
Logged-in state
Syncing state
Error state
No-access state
Empty state
Account deletion path
Privacy / terms / support links
```

Parity means a user can understand and complete the same core task on each required client, not that buttons have identical positions.

### 7. Billing And App Store Boundary

Every contract must state:

```text
Billing owner: db-wizPulseAI-com
Stripe owner: matrix billing only
iOS purchase surface: none
Credit display: read-only unless matrix-owned API says otherwise
No-access copy:
```

iOS clients must not show:

- Purchase buttons.
- Recharge buttons.
- Upgrade prompts.
- External purchase links.
- QR codes to paid web pages.
- "Go to website to buy" style copy.

Android clients should follow the same default companion boundary. If an Android client sells digital features inside the app, that requires a separate Google Play Billing design and must not be mixed into the free companion path.

Allowed iOS behavior:

- Login.
- Demo mode.
- Use features available to the account.
- Show neutral account/feature status.
- Consume already-owned points only through approved matrix APIs.
- Delete account.
- Open privacy, terms, and support links.

### 8. Acceptance Checklist

Before a client ships:

```text
Feature inventory implemented for this client
Shared data shape matches contract
Supported locales complete
Logged-out / logged-in / syncing / error states verified
No-access copy verified
Dashboard bootstrap or entitlement checks verified
No app-local Stripe or checkout code
Privacy / terms / support links present where required
Account deletion present in iOS clients
Smoke test notes attached
```

## ExpoGeo Contract Baseline

ExpoGeo should use this baseline until it gets a dedicated `docs/PRODUCT_CONTRACT.md`:

```text
Product code: expo_geo
App schema: app_expo_geo
Required clients: Web, iOS
Future optional client: Android
Core features:
  - daily_country
  - country_catalog
  - country_search
  - favorites
  - learned_countries
  - quick_quiz
  - local_demo_progress
  - cloud_progress_sync
  - matrix_account_status
  - account_deletion
  - privacy_terms_support_links
Shared progress shape:
  - learnedCountryIds
  - favoriteCountryIds
  - quizStats
  - dailyHistory
  - streak
  - recentCountryIds
RPCs:
  - get_expo_geo_progress()
  - sync_expo_geo_progress(progress jsonb)
Billing:
  - iOS has no purchase surface
  - Web purchase or billing, if any, stays matrix-owned through Dashboard
```

## When To Extract Shared Code

Do not force a monorepo package before the product is stable.

Start with:

- Contract file.
- Shared schema/RPC.
- Shared content JSON or mirrored generated data.
- Manual parity checklist.

Extract a shared package only when at least two clients repeatedly duplicate stable logic, such as:

- Content normalization.
- Progress merge rules.
- Feature inventory definitions.
- Localization keys.

The matrix root remains a management repo, not a unified Node monorepo.
