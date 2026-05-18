# Matrix New App Integration Standard

This is the standard for adding a new WizPulseAI matrix app. ExpoGeo is the full entitlement reference sample. Dino Kids is the lightweight auth + app-data reference sample.

## Core Rule

A product app owns product experience and product data only.

It must not own:

- Account registration, login, password reset, or SSO.
- Stripe checkout, webhook handling, billing records, or subscription state.
- Cross-app credit wallets, credit ledger, reward ledger, or entitlement rules.

Those stay in the matrix core:

- `auth-wizpulseai-com`: identity, login, registration, SSO cookies.
- `db-wizPulseAI-com`: dashboard, user center, credits, Stripe, rewards, entitlements.
- App directory or app subrepo: product UI and product-specific data only.

## ExpoGeo Reference Shape

ExpoGeo uses:

- Product code: `expo_geo`.
- App schema: `app_expo_geo`.
- Billing owner: matrix billing in `db-wizPulseAI-com`.
- Stripe owner: matrix billing only.
- Entitlement source: `billing.entitlements`.
- Product feature registry: `billing.feature_definitions`.

Existing ExpoGeo feature examples:

- `basic_access`: free feature.
- `pro_country_pack`: entitlement-controlled paid pack.
- `unlimited_quizzes`: entitlement-controlled paid feature.

## Dino Kids Reference Shape

Dino Kids uses:

- Product code: `dino_kids`.
- App schema: `app_dino_kids`.
- Billing owner: matrix billing in `db-wizPulseAI-com`.
- Stripe owner: matrix billing only.
- Entitlement source: `billing.entitlements` / free feature definitions.
- Product feature registry: `billing.feature_definitions`.
- App-owned data example: `app_dino_kids.user_favorites`.

Existing Dino Kids feature examples:

- `basic_access`: free feature.
- `cloud_favorites`: free signed-in favorite sync.
- `learning_profile`: reserved for future learning profile and progress.

Use Dino Kids as the reference for a simple app that needs matrix login and synced user data, but does not need paid access yet.

## Required Database Shape

Every new app needs one product registry row:

```text
public.ai_products.code = <product_code>
```

Every new app with server-synced user data should use one app-owned schema:

```text
app_<product_code>.*
```

App tables must reference `auth.users(id)` for user-owned data. They should not reference Stripe tables directly.

Cross-app state stays in `billing`:

- `billing.credit_wallets`: product-scoped and global balances.
- `billing.credit_ledger`: immutable credit events.
- `billing.credit_packages`: purchasable packages.
- `billing.checkout_sessions`: checkout audit state.
- `billing.feature_definitions`: product feature catalog.
- `billing.entitlements`: user access grants.
- `billing.user_reward_profiles`: cross-app reward metadata.

## Standard App Bootstrap API

New apps that need matrix credits, feature gates, or Dashboard account context should start by calling the matrix bootstrap endpoint from the product frontend or its server layer:

```http
GET /api/apps/bootstrap?product=expo_geo&features=basic_access,pro_country_pack,unlimited_quizzes
```

Authenticated response shape:

```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": "auth-user-id",
    "email": "user@example.com"
  },
  "product": {
    "code": "expo_geo"
  },
  "credits": {
    "balance": 0,
    "lifetimeEarned": 0,
    "lifetimeSpent": 0,
    "updatedAt": null
  },
  "entitlements": {
    "basic_access": {
      "hasAccess": true,
      "reason": "free_feature"
    },
    "pro_country_pack": {
      "hasAccess": false,
      "reason": "entitlement_not_found"
    }
  },
  "matrix": {
    "accountOwner": "auth-wizpulseai-com",
    "billingOwner": "db-wizPulseAI-com",
    "stripeOwner": "matrix_billing"
  }
}
```

Apps should treat this as their first integration contract:

- If `authenticated` is false or the request returns `401`, show login.
- Use `entitlements[feature_code].hasAccess` to gate features.
- Use `credits.balance` for product-scoped credit UI.
- Do not infer paid access from Stripe objects.

Very lightweight apps may begin with matrix login plus public RPCs for app-owned data, as Dino Kids does for favorites. They should still register a product row and feature definitions first so Dashboard, billing, and future paid access have a stable product identity.

## Standard New App Checklist

1. Choose a stable product code, for example `expo_geo`.
2. Add or verify `public.ai_products` row.
3. Add app schema as `app_<product_code>`.
4. Add app-owned tables only for product data.
5. Add `billing.feature_definitions` rows for feature gates.
6. Use `/api/apps/bootstrap` for user, credit, and entitlement context.
7. Use `/api/entitlements/check` for focused feature checks after bootstrap.
8. Use `/api/credits/balance?product=<product_code>` for product-scoped balance refresh.
9. Put all Stripe checkout and webhook work in `db-wizPulseAI-com`.
10. Keep subscription features disabled unless the matrix billing layer explicitly promotes them to production.

## What Not To Copy From Magicoord

Magicoord is useful as a migrated app example, but it is not the clean new-app template:

- Its schema still uses the historical `fashion` name.
- It previously had app-local credit tables and functions.
- Some dashboard screens still contain Fashion/Magicoord-specific history.

For new apps, copy the ExpoGeo or Dino Kids shape depending on the product need:

```text
product_code -> app_<product_code> schema -> billing entitlements/credits -> matrix Stripe
```

Use ExpoGeo style when the app needs feature gates, paid packs, credits, or learning progress. Use Dino Kids style when the app only needs login plus a small app-owned sync surface.

## Ownership Boundary

New app code may:

- Read matrix session state through approved auth helpers or app bootstrap APIs.
- Read product-scoped credits and entitlements.
- Store app-specific data in its own schema.

New app code must not:

- Create Stripe Checkout Sessions directly.
- Process Stripe webhooks.
- Write to `billing.credit_ledger` directly from browser code.
- Create its own user account system.
- Create app-local copies of matrix credit or entitlement tables.

## iOS Companion App Boundary

If a matrix app is shipped to the iOS App Store, treat it as a free companion client by default:

- iOS is a usage and traffic surface, not a billing surface.
- The app must not include Stripe, checkout creation, purchase links, recharge buttons, pricing, upgrade prompts, or external purchase calls to action.
- The app may read matrix account state, credits, quotas, and entitlements through approved matrix APIs.
- Lack-of-access copy must stay neutral, for example: `This feature is not available for the current account.`

See `docs/architecture/ios-companion-app-policy.md` before starting any iOS app work.
