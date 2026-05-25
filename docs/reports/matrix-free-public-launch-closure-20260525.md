# WizPulseAI Matrix Free Public Launch Closure

Date: 2026-05-25

## Scope

This closure pass prepares the matrix for a clean free public opening:

- Keep account registration, login, SSO, Dashboard, Geo, and Dino Kids available.
- Pause Magicoord as a user-facing app entry and show it as "coming soon".
- Keep Magicoord data, product record, historical credits, and admin visibility intact.
- Keep paid matrix points working, but do not position Magicoord as a current shared-points destination.

## Current Public Product State

| Product | User-facing state | Notes |
| --- | --- | --- |
| Geo | Open | Matrix login and progress API are the current production path. |
| Dino Kids | Open | Matrix catalog/app data are present; app-side iOS/web integration continues separately. |
| Magicoord | Coming soon | Product introduction remains; launch buttons and direct user entry are disabled. |

## Dashboard / Database Closure

- Added migration `20260525020000_pause_magicoord_public_launch.sql`.
- Applied the migration to the remote Supabase database with `npm run db:push`.
- `public.ai_products.magicoord` is now `is_active = false`, `is_beta = true`, with `metadata.public_launch_status = "coming_soon"`.
- Dashboard summary API now returns inactive products with:
  - `url: null`
  - `status: "coming_soon"`
  - `access.hasAccess: false`
  - `access.reason: "inactive_product"`
- Added regression coverage so inactive products cannot accidentally expose a launch URL or usable access state.
- Dashboard billing copy no longer lists Magicoord as a current shared-points destination.
- Legacy Dashboard Magicoord tab buttons were changed from launch/purchase links to non-clickable "coming soon" states.
- Referral fallback links no longer default to Magicoord.

## Main Site Closure

- Product list and product detail pages keep Magicoord as an introduction page, but set its app CTA to coming soon in all matrix locales:
  - Japanese
  - English
  - Traditional Chinese
  - Arabic
- Homepage variant featured-product blocks now link to the Magicoord product detail page instead of the Magicoord app domain.
- Knowledge Hub life entry now shows a non-clickable Magicoord coming-soon CTA.
- Japanese article links that used to point directly to Magicoord/WizLife now point to `/ja/products/magicoord`.
- Sitemap no longer exposes a direct Magicoord app link.

## Verification

Dashboard repo:

```bash
npm test -- --coverage=false --runInBand src/app/api/dashboard/summary/route.test.ts src/app/api/credits/checkout/route.test.ts src/app/api/apps/bootstrap/route.test.ts src/middleware.test.ts
npm run build
npm run db:push
```

Result:

- 4 test suites passed.
- 16 tests passed.
- Production build passed.
- Supabase migration applied.

Main site repo:

```bash
npm run build
rg -n "https://magicoord\.wizpulseai\.com|https://magicoord\.com|https://wizlife\.wizpulseai\.com" content src -S
```

Result:

- Production build passed.
- Only the internal redirect allowlist still references `https://magicoord.wizpulseai.com`; no public content/app-entry link remains.

## Remaining Launch Notes

- Live Stripe mode is still a separate switch and should not be enabled during this free-opening pass.
- Magicoord code/data remain in place so it can be reopened later by reactivating `public.ai_products.magicoord` and restoring public CTAs.
- If the product strategy changes, update shared points copy and Magicoord CTAs together so users do not see mismatched purchase/app messaging.
