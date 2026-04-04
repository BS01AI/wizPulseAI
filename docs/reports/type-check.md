# TypeScript Type Check Report

Generated: 2026-04-02
Tool: `npx tsc --noEmit` per site

---

## Summary

| Site | Total Errors | Status |
|------|-------------|--------|
| auth-wizpulseai-com | 0 | PASS |
| db-wizPulseAI-com | 1 | FAIL |
| fashion-wizpulseai-com | 0 | PASS |
| wizPulseAI-com | 10 | FAIL |
| **Total** | **11** | **2 FAIL / 2 PASS** |

---

## Error Categorization (All Sites)

| TS Code | Category | Count | Sites Affected |
|---------|----------|-------|----------------|
| TS2307 | Cannot find module | 10 | wizPulseAI-com |
| TS1501 | Regex flag requires higher ES target | 1 | db-wizPulseAI-com |
| **Total** | | **11** | |

---

## Top Errors Across All Sites

| Rank | Error Code | Description | Count |
|------|-----------|-------------|-------|
| 1 | TS2307 | Cannot find module or its corresponding type declarations | 10 |
| 2 | TS1501 | Regular expression flag only available when targeting 'es6' or later | 1 |

Only 2 distinct error types exist across the entire project.

---

## Per-Site Details

### auth-wizpulseai-com

**Status**: PASS (0 errors)

`npx tsc --noEmit` completed with exit code 0. No type errors detected.

---

### db-wizPulseAI-com (Dashboard)

**Status**: FAIL (1 error)

| Error Code | File | Line | Description |
|-----------|------|------|-------------|
| TS1501 | `src/components/dashboard/profile-form.tsx` | 28:45 | This regular expression flag is only available when targeting 'es6' or later. |

**Full output**:
```
src/components/dashboard/profile-form.tsx(28,45): error TS1501: This regular expression flag is only available when targeting 'es6' or later.
```

**Root cause**: The file uses a regex flag (likely `u` or `v` Unicode flag) that requires the TypeScript compilation target to be `es6` or higher. The `tsconfig.json` target is set too low.

---

### fashion-wizpulseai-com

**Status**: PASS (0 errors)

`npx tsc --noEmit` completed with exit code 0. No type errors detected.

---

### wizPulseAI-com (Main Site)

**Status**: FAIL (10 errors)

All errors are in the `.next/types/` auto-generated directory (stale build cache), not in source code.

| Error Code | File | Line | Description |
|-----------|------|------|-------------|
| TS2307 | `.next/types/app/[locale]/cancellation/page.ts` | 2:24 | Cannot find module `.../cancellation/page.js` |
| TS2307 | `.next/types/app/[locale]/cancellation/page.ts` | 5:29 | Cannot find module `.../cancellation/page.js` |
| TS2307 | `.next/types/app/[locale]/privacy/page.ts` | 2:24 | Cannot find module `.../privacy/page.js` |
| TS2307 | `.next/types/app/[locale]/privacy/page.ts` | 5:29 | Cannot find module `.../privacy/page.js` |
| TS2307 | `.next/types/app/[locale]/refund/page.ts` | 2:24 | Cannot find module `.../refund/page.js` |
| TS2307 | `.next/types/app/[locale]/refund/page.ts` | 5:29 | Cannot find module `.../refund/page.js` |
| TS2307 | `.next/types/app/[locale]/terms/page.ts` | 2:24 | Cannot find module `.../terms/page.js` |
| TS2307 | `.next/types/app/[locale]/terms/page.ts` | 5:29 | Cannot find module `.../terms/page.js` |
| TS2307 | `.next/types/app/[locale]/tokusho/page.ts` | 2:24 | Cannot find module `.../tokusho/page.js` |
| TS2307 | `.next/types/app/[locale]/tokusho/page.ts` | 5:29 | Cannot find module `.../tokusho/page.js` |

**Root cause**: These 5 pages (`cancellation`, `privacy`, `refund`, `terms`, `tokusho`) were moved from `/[locale]/xxx` to `/[locale]/about/xxx` during the legal page consolidation (2025-02-05). The `.next/types/` build cache still references the old paths. These are NOT source code errors.

**Affected routes** (5 pages, 2 errors each):
- `/[locale]/cancellation/page`
- `/[locale]/privacy/page`
- `/[locale]/refund/page`
- `/[locale]/terms/page`
- `/[locale]/tokusho/page`

---

## Auto-fixable vs Manual Fix

### Auto-fixable (11/11 -- all errors)

| Site | Error | Fix Method | Effort |
|------|-------|-----------|--------|
| db-wizPulseAI-com | TS1501 (1 error) | Update `tsconfig.json` target to `"es2017"` or later; or refactor the regex in `profile-form.tsx:28` to avoid the flag | < 1 min |
| wizPulseAI-com | TS2307 (10 errors) | Run `rm -rf .next` to clear stale build cache, then rebuild | < 1 min |

### Manual Fix Required

None. All 11 errors are auto-fixable.

---

## Recommendations

1. **wizPulseAI-com (Main Site)**: Run `rm -rf .next` and rebuild. All 10 TS2307 errors are stale build artifacts from the legal page URL migration, not actual code problems. This is a zero-risk fix.

2. **db-wizPulseAI-com (Dashboard)**: Either update the `target` in `tsconfig.json` to `"es2017"` or higher (standard for modern Next.js projects), or replace the Unicode regex flag in `profile-form.tsx` line 28 with an equivalent pattern that works under `es5`. The tsconfig fix is preferred.

3. **Overall health**: The project is in good shape with only 11 total errors across 4 sites, all of which are trivially fixable. No type mismatches (TS2322), no implicit-any (TS7006), no missing property errors (TS2339) were found. The auth and fashion sites are fully clean.
