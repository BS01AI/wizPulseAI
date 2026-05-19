# Matrix iOS Companion App Standard

Last updated: 2026-05-19

This guide captures the reusable iOS pattern proven by ExpoGeo. Future WizPulseAI apps such as Dino Kids and Magicoord should start from this shape instead of reinventing auth, billing boundaries, and App Store compliance.

## Release Strategy

Ship in two stages:

```text
Stage 1: TestFlight MVP
  Native login
  Useful demo mode
  Local progress
  Cloud sync after login
  No payment surface

Stage 2: App Store public release
  Polished learning/product loop
  Review notes
  Privacy metadata
  Support / privacy / terms URLs
  Demo account
```

## Required Boundary

iOS companion apps may:

```text
Use Supabase native auth
Use Sign in with Apple / Google / email
Read Dashboard bootstrap APIs
Read existing credits and entitlements
Sync app-owned product data
Offer a demo mode
Let users delete or sign out of accounts
```

iOS companion apps must not:

```text
Create Stripe checkout sessions
Handle Stripe webhooks
Store Stripe secrets
Show purchase / recharge / upgrade CTAs
Link to web purchase pages
Show "go to website to buy" copy
Use hidden remote-config purchase surfaces
```

## Shared Identity Model

```text
Apple Primary App ID: com.wizpulseai.account
Apple Services ID:    com.wizpulseai.auth
Supabase Client ID:   com.wizpulseai.auth
Product Bundle ID:    com.wizpulseai.<product>
Dashboard product:    snake_case product_code
```

Each product gets its own iOS Bundle ID. The Apple Services ID and Supabase Auth project are matrix-wide.

## App Data Model

Use a dedicated app schema for product data:

```text
app_<product_code>
```

Examples:

```text
app_expo_geo
app_dino_kids
app_magicoord
```

Do not store account truth, payment truth, or Stripe records in app schemas.

## Native App Pattern

Each iOS app should include:

```text
src/lib/supabase.ts
src/lib/matrix.ts
src/hooks/useMatrixAuth.ts
src/hooks/use<Product>Progress.ts
```

`useMatrixAuth` owns:

```text
Supabase session
Apple / Google / email login
OAuth deep-link callback handling
Dashboard bootstrap call
Sign out
```

Product progress hook owns:

```text
Local demo progress
Remote progress fetch
Merge local and remote progress after login
Remote sync through product RPCs
Syncing / error state
```

## Dashboard API Contract

Every companion app should call:

```http
GET /api/apps/bootstrap?product=<product_code>&features=basic_access,<feature_codes>
Authorization: Bearer <supabase access token>
```

The Dashboard response determines:

```text
Authenticated matrix user
Product code
Product-scoped credits
Requested feature entitlements
```

## Product RPC Contract

For cloud sync, prefer product-specific RPCs:

```text
get_<product_code>_progress()
sync_<product_code>_progress(progress jsonb)
```

The RPCs should:

```text
Use auth.uid()
Validate payload size and shape
Upsert user-owned rows
Return normalized progress JSON
Never touch Stripe or billing ledgers
```

## Apple Profile Rules

Sign in with Apple may not return a stable display name, and Hide My Email creates relay addresses.

Default profile behavior:

```text
Apple relay email + no name -> WizPulseAI User
Normal email + no name      -> email local part
User-edited name            -> preserve
Avatar                     -> do not expect Apple to provide one
```

## TestFlight MVP Checklist

```text
Email login works
Apple login works
Google login works or is intentionally hidden
Login callback refreshes app state immediately
Demo mode is useful without login
Local progress survives app restart
Local progress merges into cloud after login
Dashboard website can log in with the same account
No visible purchase or web billing copy
No Stripe SDK or secrets in app
App Review Notes draft exists
Privacy Policy / Support URL planned
```

## ExpoGeo Current State

ExpoGeo has proven:

```text
Native Supabase auth
Apple Services ID via matrix auth
Dashboard bootstrap with bearer token
Local learning progress
Cloud progress RPC merge/sync
App Store companion-app billing boundary
```

Next reusable extraction target:

```text
Move shared auth/bootstrap helpers into a small internal template or skill for new matrix iOS apps.
```
