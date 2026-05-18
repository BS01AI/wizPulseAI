# iOS App Technology Decision

Last updated: 2026-05-18

## Decision

WizPulseAI product apps should use Expo / React Native as the default first-stage iOS companion app technology.

This is the standard path for ExpoGeo and the preferred reusable path for Dino Kids and Magicoord unless a product has a strong reason to use SwiftUI.

## Why Not PWA Only

PWA is still valuable, but it is not an App Store artifact.

PWA gives the matrix:

- Fast web deployment.
- SEO and shareability.
- Mobile browser support.
- Home screen install behavior.
- Cache and offline-friendly behavior.
- One codebase for desktop, mobile web, and PWA.

PWA does not provide:

- App Store distribution.
- App Store search and browsing traffic.
- Native `.ipa` packaging by itself.
- Full iOS system integration.
- The same trust signal as an App Store listing.

PWA remains the fast iteration and public web surface. It does not replace the iOS app.

## Why Not WebView / Capacitor As The Default

A WebView wrapper can package a web app into an iOS binary, but it is not the same as a native companion app.

Pros:

- Fast prototype.
- Reuses the existing web UI.

Cons:

- Higher App Review risk if it feels like a thin website wrapper.
- Cookie/session behavior can be fragile.
- Less native polish.
- Harder to justify as a distinct App Store experience.

WebView wrappers may be useful for internal validation, but they are not the preferred App Store launch path.

## Why Expo / React Native

Expo / React Native is the preferred first-stage path because WizPulseAI already uses React and TypeScript across product apps.

Benefits:

- Produces a real iOS app package.
- Avoids a thin WebView-only App Store posture.
- Reuses TypeScript data models, copy, API client patterns, and product logic.
- Can later target Android from the same codebase.
- Scales to multiple matrix companion apps.
- Moves faster than SwiftUI for the current team and AI-agent workflow.

This is especially useful for the matrix model:

```text
one product
multiple clients
one account
one billing owner
```

## Why Not SwiftUI First

SwiftUI remains a valid future option, but it is not the default first-stage path.

SwiftUI is better when:

- The product is Apple-only long term.
- Deep iOS system integration is central to the product.
- The product requires very high native polish from day one.
- A dedicated iOS engineering owner exists.

Current WizPulseAI needs are different:

- Several product apps need iOS companion clients.
- Matrix auth, entitlements, credits, and app data are API-centric.
- TypeScript reuse matters.
- Fast iteration matters.

Therefore Expo / React Native is the pragmatic default.

## Standard Product Mapping

For each product:

```text
product web app:
  public SEO/PWA surface
  fast release channel
  account and billing entry points through matrix web

product iOS app:
  free companion app
  App Store entry point
  native learning/use experience
  matrix login
  account state and app data sync
  no checkout or purchase CTA
```

## ExpoGeo Application

ExpoGeo now follows this structure:

```text
ExpoGeo/
  expo-geo/      # Next.js Web / PWA client
  expo-geo-ios/  # Expo / React Native iOS companion client
```

The iOS app is not a converted PWA and not a WebView shell.

It is a separate native companion client that should gradually port:

- country data
- search
- quiz
- local progress
- cloud sync
- matrix login

## Engineering Rules

1. Keep each client dependency boundary independent.
2. Do not make the matrix root a mobile monorepo.
3. Do not put Stripe or checkout logic in iOS apps.
4. Keep visible iOS copy free of purchase, recharge, upgrade, pricing, checkout, and external purchase calls to action.
5. Use matrix APIs for account, entitlement, credit, quota, and sync state.
6. Treat SwiftUI as a later product-specific decision, not the default.

