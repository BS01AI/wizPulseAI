# iOS Matrix Auth Milestone

Date: 2026-05-19

## Summary

WizPulseAI has completed the first end-to-end iOS companion app login path:

```text
iOS App
  -> Supabase Auth
  -> Apple Sign in with Apple
  -> Supabase session
  -> Dashboard Matrix bootstrap API
  -> product-scoped credits / entitlements
```

This proves the matrix account system can support both web users and individual iOS companion apps without putting Stripe or billing logic inside each app.

## Apple Identifier Model

Current recommended long-term model:

```text
Apple Primary App ID: com.wizpulseai.account
Apple Services ID:    com.wizpulseai.auth
Supabase Client ID:   com.wizpulseai.auth
ExpoGeo Bundle ID:    com.wizpulseai.expogeo
```

The Apple Services ID is matrix-wide. Product iOS apps keep their own Bundle IDs and use the shared Supabase Auth project.

## Registration Behavior

When a user signs in with Apple from iOS for the first time, Supabase creates an `auth.users` row automatically. In product language, this is a matrix account registration.

Important distinction:

```text
Supabase auth.users row:
  Created automatically on first successful OAuth sign-in.

Matrix profile / credits / entitlements rows:
  Must be created or read through the Dashboard matrix layer.
```

The iOS app should treat the Supabase session as the source of identity, then call Dashboard bootstrap to read matrix account state.

## Website Login Compatibility

Because iOS and web use the same Supabase project and the same Apple Services ID, the same Apple account can log in through:

```text
auth.wizpulseai.com
ExpoGeo iOS
Future matrix iOS apps
```

The user identity is shared at Supabase Auth level. Website profile display still depends on the Dashboard user/profile synchronization logic.

## Implemented Code Paths

ExpoGeo iOS:

```text
ExpoGeo/expo-geo-ios/src/lib/supabase.ts
ExpoGeo/expo-geo-ios/src/hooks/useMatrixAuth.ts
ExpoGeo/expo-geo-ios/src/lib/matrix.ts
```

Dashboard Matrix API:

```text
db-wizPulseAI-com/src/app/api/apps/bootstrap/route.ts
```

Auth site Apple login:

```text
auth-wizpulseai-com/src/app/(auth)/auth/page.tsx
auth-wizpulseai-com/src/components/NewLoginForm.tsx
auth-wizpulseai-com/src/components/SignUpForm.tsx
```

## Validation Completed

Terminal-level checks:

```text
Supabase Apple authorize URL reaches appleid.apple.com
client_id is com.wizpulseai.auth
No invalid_request
No Invalid web redirect url
```

Build/type checks:

```text
auth-wizpulseai-com: npm run build
ExpoGeo/expo-geo-ios: npm run typecheck
```

Manual validation:

```text
ExpoGeo iOS Apple login can complete.
```

## Remaining Follow-up

The first login proves authentication, but the product screen must refresh immediately after native OAuth returns. The iOS hook now handles both:

```text
WebBrowser.openAuthSessionAsync result URL
Native Linking deep link URL event
```

Next manual check:

```text
1. Open ExpoGeo iOS development build.
2. Sign out if already signed in.
3. Sign in with Apple.
4. Confirm the account card changes to connected state.
5. Confirm email / account state appears.
6. Confirm Dashboard website can log in with the same Apple account.
```

If Dashboard website login succeeds but profile/credits are missing, the next area to inspect is matrix profile initialization, not Apple OAuth.

## Billing Boundary

iOS apps should not contain:

```text
Stripe secret keys
Stripe checkout creation
Stripe webhook handling
Purchase / recharge / upgrade CTAs
External purchase links
```

The iOS app may read and consume existing web-managed credits/entitlements through Dashboard APIs.
