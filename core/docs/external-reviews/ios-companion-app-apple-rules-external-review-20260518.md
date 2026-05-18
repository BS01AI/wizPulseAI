# External Review Archive: iOS Companion App Apple Rules

Date: 2026-05-18

## Summary

An external AI review recommended positioning WizPulseAI iOS apps as free companion apps under Apple App Review Guideline 3.1.3(f), rather than as iOS payment surfaces.

The key recommendation was accepted with caution:

- Free app.
- No IAP in v1.
- No purchase, recharge, upgrade, pricing, web checkout, QR code, or external payment call-to-action inside the iOS app.
- iOS app logs in and reads matrix account state, already available entitlements, and server-side usage capacity.
- Matrix web/dashboard remains the only Stripe and billing owner.

## Important Red Lines

The iOS app should not contain:

- Purchase / recharge / upgrade / add points buttons.
- Links to web billing or checkout.
- Copy such as "go to the website to buy" or "web is cheaper".
- Support replies that direct users to web purchase.
- Hidden purchase UI controlled by remote config.
- Stripe integration.

## Accepted Matrix Interpretation

This is not a generic way to bypass IAP.

For WizPulseAI, the accepted strategy is:

```text
free iOS companion app
existing matrix web account
matrix-owned billing
neutral account availability state
no iOS purchase path
```

## Follow-up Documents

- `.auto-memory/feedback_ios_companion_app_apple_rules.md`
- `docs/architecture/ios-companion-app-policy.md`
- `docs/planning/expogeo-ios-companion-plan-20260518.md`

