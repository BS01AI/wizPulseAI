# WizPulseAI iOS Companion App Policy

Last updated: 2026-05-18

## Purpose

This policy defines how WizPulseAI product apps may enter the iOS App Store while preserving the matrix account, billing, credit, and entitlement architecture.

The iOS goal is traffic and usage, not a second billing stack.

## Core Position

WizPulseAI iOS apps are free companion apps for WizPulseAI web accounts.

They should not be described or implemented as iOS storefronts for buying points, subscriptions, packs, or upgrades.

The default first-release model is:

```text
Web product / Dashboard:
  account registration
  Stripe checkout
  points and entitlement purchase
  account management

iOS companion app:
  login
  demo/free usage
  read account state
  read entitlements and quotas
  consume available server-side feature capacity
  sync app-specific data
```

## Apple Review Basis

Primary guideline:

- Apple App Review Guideline 3.1.3(f): Free Stand-alone Apps.

Operational interpretation:

- The app is free.
- The app is a companion to a paid web-based tool.
- The app has no purchasing inside the app.
- The app has no calls to action for purchase outside the app.

Important caution:

- Apple Guideline 3.1.1 still applies to digital feature unlocking inside apps.
- Apple Guideline 3.1.3(b) for multiplatform services is stricter for some digital goods and consumable items.
- Therefore, the iOS app must not market or expose the web payment flow.

## Payment Boundary

iOS apps must never:

- Create Stripe Checkout Sessions.
- Store Stripe customer, subscription, invoice, payment intent, or webhook truth.
- Own credit packages or point pricing.
- Provide purchase, recharge, upgrade, subscribe, add points, or pricing UI.
- Link to web checkout, web pricing, Dashboard billing, QR payment, or external payment pages.
- Tell users to buy on the website or contact support to purchase.
- Hide purchase UI behind remote config or reviewer-specific behavior.

All billing stays in `db-wizPulseAI-com`.

## Allowed iOS Capabilities

iOS apps may:

- Provide a useful free/demo mode.
- Let users sign in.
- Offer Sign in with Apple when required by Apple login rules.
- Read matrix account profile.
- Read app-specific credits, neutral quotas, or entitlement availability.
- Consume existing server-side credits or quotas through matrix APIs.
- Sync app-specific user data.
- Show neutral lack-of-access states.
- Offer account deletion and privacy controls.

## Required User-Facing Copy

Use neutral availability language:

```text
当前账户暂不能使用此功能
This feature is not available for the current account.
```

Avoid purchase language:

```text
购买点数
充值
升级
订阅
去官网购买
web 更便宜
Purchase points
Recharge
Upgrade
Subscribe
Go to the website to buy
```

Use "available uses", "remaining capacity", "current account access", or "feature availability" when a product needs state display. Avoid making points feel like an in-app currency store.

## App Review Notes Template

Use a direct note similar to:

```text
This is a free companion app for existing WizPulseAI web users.
The app does not include in-app purchases.
The app does not include external purchase links, pricing, upgrade prompts, or calls to action for purchases outside the app.
Users can sign in to access account features and sync app data.
A demo account is provided for review:
Email: <review-email>
Password: <review-password>
```

If the app supports Sign in with Apple, note how the reviewer can use it.

## Required iOS Release Checklist

Before submitting any WizPulseAI iOS app:

1. App is free on App Store.
2. No IAP products are configured for v1 unless a deliberate separate IAP strategy is approved.
3. No purchase, pricing, upgrade, recharge, or web checkout UI exists in the app.
4. No support copy directs users to web purchase.
5. No app code imports Stripe SDKs or calls billing write endpoints.
6. App has useful free/demo behavior.
7. App has a review account.
8. App has account deletion flow or a clear in-app account deletion request path.
9. App privacy policy is linked in App Store Connect and in the app.
10. If third-party/social login exists, Sign in with Apple or an Apple-compliant alternative is present.
11. App Review Notes explicitly describe the companion model.

## Matrix API Contract

iOS apps should call matrix APIs rather than billing tables directly:

```http
GET /api/apps/bootstrap?product=<product_code>&features=<feature_codes>
POST /api/apps/<product_code>/consume
GET /api/entitlements/check?product=<product_code>&feature=<feature_code>
GET /api/credits/balance?product=<product_code>
```

Any consuming endpoint must live in `db-wizPulseAI-com` or a reviewed matrix server layer. Browser or native clients must not write billing ledgers directly.

## Product Risk Classes

### Low Risk: ExpoGeo

Learning app with strong free utility. Best first iOS candidate.

Recommended v1:

- Free country learning.
- Local progress.
- Optional sign-in for cloud sync.
- Neutral account access state.
- No paid prompts.

### Medium Risk: Dino Kids

Good app candidate, but kids positioning increases privacy and review obligations.

Recommended v1:

- Avoid Kids Category until privacy posture is fully reviewed.
- Minimize analytics.
- Avoid ads.
- Use parent-friendly account and deletion flows.

### High Risk: Magicoord

Points and AI styling features can look like consumable digital goods.

Recommended v1:

- Do not show buy points or pricing.
- Use neutral availability wording.
- Treat web points as account-side capacity.
- Keep all purchase and entitlement creation on web.

## Standard Decision

For WizPulseAI, the default iOS strategy is:

```text
one product
two clients
one matrix account
one matrix billing owner
```

The web app remains the primary purchase and account management surface. The iOS app becomes an App Store distribution and usage surface.

