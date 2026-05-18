# ExpoGeo iOS Companion App Plan

Date: 2026-05-18

## Goal

Ship ExpoGeo as the first WizPulseAI iOS companion app.

The iOS app should be a traffic and usage entry point for ExpoGeo while preserving the matrix payment boundary:

- Web keeps account purchase and matrix billing.
- iOS is free.
- iOS has no IAP in v1.
- iOS has no purchase or external purchase call-to-action.

## Product Shape

ExpoGeo should become one product with two clients:

```text
ExpoGeo Web:
  https://geo.wizpulseai.com
  Next.js app
  PWA-friendly web experience
  matrix login and cloud sync

ExpoGeo iOS:
  App Store app
  free companion app
  native shell or native client
  same product code: expo_geo
  same matrix account
  same app-owned cloud data model
```

This does not mean two separate products. It means two distribution surfaces for the same product.

## Recommended v1 Scope

Use ExpoGeo because it has the lowest App Review payment risk among current apps.

v1 should include:

- Country search.
- 3D or native-friendly globe/map learning experience.
- Daily country.
- Quick quiz.
- Local progress.
- Optional matrix sign-in.
- Cloud sync after sign-in.
- Neutral account state display.
- Account deletion link or in-app deletion request.
- Privacy policy link.

v1 should not include:

- Paid feature marketing.
- Points purchase.
- Recharge.
- Upgrade.
- Pricing.
- Dashboard billing link.
- Web checkout link.
- Any Stripe integration.

## Login Strategy

Target login behavior:

- Anonymous users can use the free learning experience.
- Signed-in users can sync progress and favorites.
- iOS supports Apple-compliant login.

Implementation options:

1. Matrix web OAuth/session bridge with ASWebAuthenticationSession.
2. Sign in with Apple linked to the same Supabase user identity.
3. Matrix auth callback creates an iOS-safe session token for API calls.

Decision needed before coding:

- Whether `auth-wizpulseai-com` will support a native callback scheme such as `expogeo://auth/callback`.
- Whether Sign in with Apple is added first to the matrix auth site or only to iOS.

## API Boundary

The iOS app should call matrix APIs:

```http
GET /api/apps/bootstrap?product=expo_geo&features=basic_access,cloud_progress
GET /api/credits/balance?product=expo_geo
GET /api/entitlements/check?product=expo_geo&feature=basic_access
```

For progress sync, use app-owned data APIs backed by `app_expo_geo`.

iOS must not:

- Write billing ledgers directly.
- Create checkout sessions.
- Call Stripe.
- Modify entitlement truth directly.

## App Store Review Copy

Use neutral app copy:

```text
ExpoGeo helps you explore countries, locate them on a globe, and build daily learning progress.
Sign in with your WizPulseAI account to sync progress across devices.
```

Do not use:

```text
Buy points
Upgrade on the web
Visit our website to unlock more
Subscribe to pro
```

## Lack-of-Access Copy

Use:

```text
当前账户暂不能使用此功能
This feature is not available for the current account.
```

For ExpoGeo Japanese:

```text
現在のアカウントではこの機能を利用できません。
```

For Arabic:

```text
هذه الميزة غير متاحة للحساب الحالي.
```

## Technical Build Options

### Option A: Native Expo / React Native App

Best long-term App Store fit.

Pros:

- Real native iOS app.
- Better App Review posture than a thin web wrapper.
- Can use native Sign in with Apple and secure storage.

Cons:

- Needs a new Expo/React Native app boundary.
- Need to port or share ExpoGeo UI/business logic carefully.
- 3D globe may need native-friendly rendering decisions.

### Option B: Capacitor Wrapper Around Web

Fastest prototype.

Pros:

- Reuses existing web app.
- Quicker to validate App Store flow.

Cons:

- Higher risk under App Review 4.2 if it feels like a thin website wrapper.
- Login/session/cookie behavior can be fragile.
- Less App Store-native.

### Recommendation

Start with Option A for a serious App Store attempt.

Keep the iOS app as a separate Expo app directory or subrepo. Do not merge it into the matrix root dependency graph.

Proposed directory:

```text
ExpoGeo/
  expo-geo/          # current web app
  expo-geo-ios/      # future native iOS companion app
```

## Phase Plan

### Phase 0: Policy and Architecture

Status: planned by this document.

- Add matrix iOS companion policy.
- Confirm ExpoGeo as first candidate.
- Confirm no iOS billing in v1.

### Phase 1: Auth and API Readiness

- Review `auth-wizpulseai-com` native callback support.
- Decide Sign in with Apple ownership.
- Define iOS session exchange.
- Ensure `/api/apps/bootstrap` supports iOS clients safely.
- Define app progress sync API contract.

### Phase 2: Native App Skeleton

- Create `ExpoGeo/expo-geo-ios`.
- Add Expo app shell.
- Add language support for English, Chinese, Japanese, Arabic.
- Add privacy/settings screen.
- Add account status component with neutral copy.

### Phase 3: Core Learning Experience

- Port country data and search.
- Add daily country.
- Add quiz.
- Add local progress.
- Add cloud sync after login.

### Phase 4: Review Readiness

- Create demo account.
- Add account deletion path.
- Add privacy policy link.
- Prepare App Review Notes.
- Validate no purchase strings, links, Stripe imports, or billing write endpoints.

## Open Questions

1. Should ExpoGeo iOS use native Sign in with Apple from v1, or first use matrix web login through ASWebAuthenticationSession?
2. Should the iOS app support all four languages in v1, or launch with English/Japanese/Chinese first?
3. Should the first iOS release include cloud sync, or keep sign-in optional and launch with local progress only?
4. Should `expo_geo` paid packs stay invisible on iOS v1, or show only neutral locked availability?

## Current Answer

Yes: after this path is implemented, ExpoGeo will have a web version and an iOS version.

They should be treated as the same product:

- same `expo_geo` product code
- same matrix account
- same app-owned data boundary
- same backend entitlement truth
- different clients and distribution channels

