# ★ High Priority: iOS Companion App Apple Review Rules

Last updated: 2026-05-18

## Decision

WizPulseAI iOS apps should be treated as free companion clients for existing WizPulseAI web accounts, not as iOS payment surfaces.

The default App Store path is:

- Free app.
- No in-app purchases in v1.
- No Stripe, checkout, purchase, recharge, upgrade, or external purchase call-to-action inside the app.
- Login reads matrix account, credits, entitlements, and app data from the WizPulseAI backend.
- Paid account state is created and managed on the web properties, outside the iOS app.

## Apple Rule Anchor

Primary path: Apple App Review Guideline 3.1.3(f), Free Stand-alone Apps.

This allows a free app to act as a stand-alone companion to a paid web-based tool without IAP, provided the app has no purchasing inside the app and no calls to action for purchase outside the app.

Do not rely on this as a loophole. If the app feels like it sells or redirects users to buy digital features, review risk increases sharply.

## Absolute Red Lines

iOS apps must not include:

- Buy, recharge, upgrade, subscribe, add points, or pricing buttons.
- Links, QR codes, webviews, or support flows that direct users to web payment.
- Copy such as "go to the website to buy", "web is cheaper", or "purchase points on WizPulseAI".
- Hidden purchase UI controlled by remote config.
- Stripe keys, checkout creation, webhook handling, or billing writes.
- App-local point packages or app-local payment state.

## Allowed iOS Behavior

iOS apps may:

- Offer Sign in with Apple or approved matrix login.
- Let users use free/demo features.
- Read account state, credits, quotas, and entitlements.
- Consume already available server-side credits or quotas through matrix APIs.
- Display neutral availability state.
- Sync app-owned data such as progress, favorites, or history.
- Provide account deletion and privacy controls.

## Required Copy Pattern

When a user lacks access or credits, use neutral capability copy:

- `当前账户暂不能使用此功能`
- `This feature is not available for the current account.`

Never mention buying, recharging, upgrading, pricing, web checkout, or where to purchase.

## Matrix Architecture Rule

- `auth-wizpulseai-com`: identity, SSO, Sign in with Apple linkage.
- `db-wizPulseAI-com`: billing, Stripe, credits, entitlements, app bootstrap APIs.
- iOS app: native companion client, feature use, account read, app-specific sync.
- Product app repo: product experience and app-specific data only.

The iOS client must not become a billing owner.

