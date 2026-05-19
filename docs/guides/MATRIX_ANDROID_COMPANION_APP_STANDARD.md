# Matrix Android Companion App Standard

Last updated: 2026-05-19

Android is not an active implementation target yet. This guide defines the future path so current Web/iOS work does not create architecture that blocks Android later.

The recommended path is Expo / React Native, reusing the same product contract, account model, app-owned data schema, and Dashboard APIs already proven by ExpoGeo iOS.

## Positioning

Android companion apps should be treated as product usage and traffic surfaces:

```text
Primary product logic: shared React Native product code where practical
Account owner: Supabase / matrix auth
Dashboard owner: db-wizPulseAI-com
Billing owner: matrix billing
Stripe owner: matrix billing only
Android store billing: none by default
```

Do not start a separate Kotlin-native rewrite unless the app needs Android-specific capabilities that Expo / React Native cannot reasonably support.

## Relationship To Web And iOS

Android must implement the product contract, not copy another client pixel-for-pixel.

Required shared contract:

```text
docs/guides/MATRIX_APP_PRODUCT_CONTRACT_STANDARD.md
```

Expected parity:

- Same feature inventory.
- Same app-owned data shape.
- Same entitlement and credit feature codes.
- Same logged-out, logged-in, syncing, error, and no-access meanings.
- Same localization keys and user-facing meaning.
- Same privacy, terms, support, and account deletion paths.

Allowed platform differences:

- Navigation layout.
- Native permission prompts.
- Android back button behavior.
- Store metadata and screenshots.
- Google account sign-in details.

## Expo / React Native Reuse

For apps like ExpoGeo, the Android build should reuse:

```text
src/lib/supabase.ts
src/lib/matrix.ts
src/hooks/useMatrixAuth.ts
src/hooks/use<Product>Progress.ts
Product screens and local state
Product content source
Localization copy
```

Android-specific additions normally belong in:

```text
app.json / app.config.ts
eas.json
android package configuration
icons / adaptive icons
Google OAuth config
Play Store metadata
```

Expo config should use a stable Android package name:

```json
{
  "expo": {
    "android": {
      "package": "com.wizpulseai.expogeo"
    }
  }
}
```

## Android Identity Model

Use one Android package per product:

```text
ExpoGeo:   com.wizpulseai.expogeo
Dino Kids: com.wizpulseai.dinokids
Magicoord: com.wizpulseai.magicoord
```

Each product app should have:

- One Google Play app listing.
- One Android package id.
- One signing key / Play App Signing setup.
- Product-specific store metadata.
- Product-specific privacy disclosure.

The Supabase project and Matrix Dashboard remain shared.

## Auth Model

Android should support:

```text
Email login
Google login
Optional web fallback OAuth
Anonymous demo mode where the product supports it
```

Apple login is not a primary Android login method.

Google login requires Android-specific setup:

- Google Cloud OAuth Android client.
- Package name.
- SHA-1 certificate fingerprint for debug/release signing.
- Supabase Google provider configured to accept the app flow.
- Deep link / redirect behavior verified on device.

The app should still call Dashboard APIs with:

```http
Authorization: Bearer <supabase access token>
```

## Account And Data APIs

Android clients should reuse the same Matrix APIs as iOS:

```http
GET /api/apps/bootstrap?product=<product_code>&features=<feature_codes>
DELETE /api/account/delete
```

App progress should use the same product RPCs:

```text
get_<product_code>_progress()
sync_<product_code>_progress(progress jsonb)
```

Rules:

- Local demo state remains available before login.
- Local state merges into remote state after login.
- Product data stays in `app_<product_code>`.
- Stripe, checkout, credit ledgers, and entitlement grants stay out of the Android app.

## Google Play Billing Boundary

Default policy posture:

```text
Free app
No in-app purchases
No Stripe SDK
No checkout creation
No external purchase links
No recharge / upgrade / buy buttons
No copy that tells users to buy on the website
Read existing account access only
```

If the Android app ever sells digital features or digital content inside the app, that must become a separate billing design using Google Play Billing or another explicitly allowed Google Play policy path. Do not mix that into the free companion app path.

Neutral no-access copy:

```text
This feature is not available for the current account.
```

Avoid:

```text
Go to the website to buy.
Recharge on WizPulseAI.
Upgrade on the web.
```

## Google Play Account Deletion

If the app allows account creation or login, it must provide a discoverable account deletion path in the app and a web/outside-app deletion path.

Matrix standard:

```text
In app: call DELETE /api/account/delete with Bearer token
Web: Dashboard settings account deletion
Support: link to WizPulseAI support page
```

The account deletion path must delete or request deletion for matrix account data and app-owned product data.

## Permissions And Data Safety

Default Android apps should request the minimum permissions needed.

Before Play Store submission, document:

- Data collected.
- Data shared.
- Data encrypted in transit.
- Account deletion path.
- Data retention behavior.
- Whether ads, analytics, crash reporting, or push notifications are used.

Do not add analytics or advertising SDKs until the data safety impact is documented.

## Android Build Checklist

When Android becomes active:

```text
Product contract updated for Android
android.package set in Expo config
Android icons and adaptive icon configured
Google OAuth Android client created
Debug and release SHA-1 fingerprints configured
Supabase Google provider tested
Matrix bootstrap works with Bearer token
Product progress sync works
Account deletion works
Privacy / terms / support links open
No purchase or external billing copy
No Stripe SDK or checkout endpoint calls
Play Console internal testing build created
Data safety form drafted
Store listing screenshots prepared
```

## ExpoGeo Future Android Baseline

ExpoGeo Android should start from the existing ExpoGeo iOS companion app codebase:

```text
Path: ExpoGeo/expo-geo-ios
Future package: com.wizpulseai.expogeo
Product code: expo_geo
App schema: app_expo_geo
Auth: email + Google
Data: local demo progress + cloud sync
Billing: none inside Android app
```

Before Android work starts, rename or document the app directory so it is clear the codebase is cross-platform React Native, not iOS-only.

## Official Policy And Platform References

- Google Play Payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
- Google Play account deletion requirements: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Expo app config: https://docs.expo.dev/versions/latest/config/app/
