# Matrix New App AI Development Brief

Last updated: 2026-06-02

This brief is for handing a new WizPulseAI matrix app to another AI agent, developer, or contractor. It defines the minimum technical direction needed before the app is fully integrated with matrix auth, Dashboard, billing, credits, and entitlements.

The app may start without login or cloud sync, but it must be built in a way that can later connect to the WizPulseAI matrix without major rewrites.

## Core Position

This is a product app inside the WizPulseAI matrix.

The product app owns:

- Product UI.
- Product-specific user experience.
- Product business logic.
- Local demo state.
- Product-owned local data.
- Future app-owned cloud data sync.

The product app does not own:

- Account registration.
- Login or password reset.
- SSO session ownership.
- Stripe checkout.
- Stripe webhooks.
- Credit wallets.
- Credit ledgers.
- Cross-app entitlements.
- Cross-app user center.

Those systems are owned by the WizPulseAI matrix core.

## Required Product Identifiers

Every new app must define these values before implementation gets large:

```text
product_code: <stable snake_case code>
public_name: <public product name>
app_schema: app_<product_code>
primary_web_domain: <planned domain or local placeholder>
feature_codes:
  - basic_access
  - <product-specific feature codes>
```

Example:

```text
product_code: ocean_kids
public_name: Ocean Kids
app_schema: app_ocean_kids
primary_web_domain: ocean.wizpulseai.com
feature_codes:
  - basic_access
  - cloud_progress
  - learning_profile
```

Rules:

- `product_code` must be lowercase snake_case.
- App-owned database objects should live under `app_<product_code>`.
- Feature codes should be stable because they will later map to `billing.feature_definitions`.
- Do not invent app-local billing, credit, or entitlement tables.

## Web Technical Direction

For a new web app, prefer:

```text
React + Vite
or
Next.js when SEO, routing, or server rendering is central
```

The web app should be:

- Mobile-friendly from the first version.
- PWA-ready when the product is useful on phones.
- Friendly to public browsing when the product has public content.
- Structured so data, UI, product logic, and integration clients are separated.

Do not put the entire app in one large component.

Recommended shape:

```text
src/
  components/
  data/
  features/
  hooks/
  i18n/
  lib/
  styles/
  utils/
```

Recommended integration placeholders:

```text
src/lib/matrix.ts
src/lib/auth.ts
src/lib/storage.ts
src/hooks/useMatrixBootstrap.ts
src/hooks/useLocalProgress.ts
```

These files may start as mocks or no-op adapters, but the app should call through them instead of scattering future auth and sync logic across UI components.

## iOS Technical Direction

For iOS, the default first-stage technology is:

```text
Expo / React Native
```

Do not use a thin WebView wrapper as the default App Store plan.

The iOS app should be treated as a free companion app:

- It may offer native product usage.
- It may support local demo mode.
- It may use Supabase native auth later.
- It may call matrix APIs with a Supabase access token later.
- It may sync app-owned progress or saved items later.

The iOS app must not:

- Include Stripe SDKs or Stripe secrets.
- Create checkout sessions.
- Show recharge, purchase, upgrade, pricing, or checkout calls to action.
- Link users to a web purchase page from inside the iOS app.
- Suggest that unavailable paid features can be bought elsewhere.

Unavailable copy should stay neutral, for example:

```text
This feature is not available for the current account.
```

## Auth Direction

The app can start without login, but it must not build its own permanent user system.

Acceptable first-stage modes:

- Anonymous demo mode.
- Local-only progress.
- Local favorites or saved items.
- Mock matrix bootstrap response for UI development.

Future matrix login will be owned by:

```text
auth-wizpulseai-com
Supabase Auth
Dashboard bootstrap APIs
```

Future web apps should use matrix SSO or approved matrix auth helpers.

Future iOS apps should use native Supabase auth and bearer-token Dashboard API calls.

## Data Direction

The app may keep local state first:

```text
localStorage
IndexedDB
SQLite / AsyncStorage for native
in-memory demo state
```

But local data should already look like the future cloud shape.

Define:

```text
Local state:
Remote state:
Read contract:
Write contract:
Merge rule:
Conflict rule:
Payload limit:
```

For future cloud sync, use app-owned storage only:

```text
app_<product_code>.*
```

Good examples:

```text
app_ocean_kids.learning_progress
app_ocean_kids.user_favorites
app_ocean_kids.quiz_attempts
```

Do not write product data into matrix billing tables, auth tables, or another app's schema.

## Future Matrix Bootstrap

Apps that need account context, credits, or entitlements should later call:

```http
GET /api/apps/bootstrap?product=<product_code>&features=basic_access,<feature_codes>
```

Expected use:

- If authenticated, show account-aware UI.
- If unauthenticated, show login entry where required.
- Use returned entitlements for feature gates.
- Use returned credits only as read-only display unless a matrix API explicitly performs a spend.

The product app must not infer paid access from Stripe objects.

## Feature Gate Rules

Every feature should have a stable key:

```text
feature_key:
user_meaning:
requires_login:
requires_entitlement:
uses_credits:
local_data_written:
remote_data_written:
web_required:
iOS_required:
android_required:
unavailable_copy:
```

Use `basic_access` as the baseline signed-in feature when the app has logged-in surfaces.

Common feature examples:

```text
basic_access
cloud_favorites
cloud_progress
learning_profile
quiz_history
ai_generation
```

## Copy-Paste Prompt For Another AI

Use this prompt when asking another AI to build a new WizPulseAI matrix app prototype:

```text
Please build a new product app prototype for the WizPulseAI matrix.

The app should focus on product experience first. Do not build a custom registration, login, password reset, payment, credit, or entitlement system.

WizPulseAI matrix will own:
- account registration
- login / SSO
- Supabase Auth
- Dashboard account state
- Stripe
- credits
- entitlements
- cross-app user center

This product app should own only:
- product UI
- product-specific business logic
- local demo mode
- local progress or saved items
- future app-owned cloud data sync

Before implementation, define:
- product_code in lowercase snake_case
- public product name
- app_schema as app_<product_code>
- feature_codes including basic_access
- local data shape
- future remote sync shape

Use a maintainable structure:
src/components
src/data
src/features
src/hooks
src/i18n
src/lib
src/styles
src/utils

Create placeholders for:
src/lib/matrix.ts
src/lib/auth.ts
src/lib/storage.ts
src/hooks/useMatrixBootstrap.ts
src/hooks/useLocalProgress.ts

The first version may use mock auth and local-only data, but all future matrix integration should go through those adapters.

For web, use React/Vite or Next.js depending on product needs. Make it mobile-friendly and PWA-ready when useful.

For iOS, use Expo / React Native by default. Do not create a thin WebView wrapper as the App Store plan. Do not include Stripe, purchase, recharge, upgrade, pricing, or external purchase calls to action in the iOS app.

Any future cloud data must belong to app_<product_code>.*. Do not write to billing tables, Stripe tables, auth tables, or another app schema.
```

## Review Checklist

Before accepting the prototype, check:

- The app has a stable `product_code`.
- The app does not create its own user account system.
- The app does not include Stripe or checkout logic.
- The app does not create app-local credit or entitlement tables.
- Product data is separated from UI components.
- Matrix/auth/storage adapters exist even if mocked.
- Local progress or saved items can later merge into cloud state.
- Feature gates have stable feature codes.
- Mobile layout is usable.
- iOS copy has no purchase, recharge, upgrade, or external purchase call to action.

## Related Standards

Read these before production integration:

```text
docs/guides/MATRIX_NEW_APP_STANDARD.md
docs/guides/MATRIX_APP_PRODUCT_CONTRACT_STANDARD.md
docs/guides/MATRIX_APP_SECURITY_COST_STANDARD.md
docs/guides/MATRIX_IOS_COMPANION_APP_STANDARD.md
docs/architecture/ios-app-technology-decision.md
```
