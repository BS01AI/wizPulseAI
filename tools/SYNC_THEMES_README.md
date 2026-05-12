# sync-themes.sh — DISPATCH-142 Phase B token sync

> Single source of truth for 5-site CSS tokens. Edit master + sync, not per-site.

## Quick start

```bash
# Edit a token
$EDITOR shared/styles/themes.master.css

# Push to all 4 sites
./tools/sync-themes.sh

# Verify drift in CI / pre-commit
./tools/sync-themes.sh --check
```

## What this solves

**Before (DISPATCH-140 audit finding)**: each of 5 Vercel repos kept its own `src/styles/themes.css`, 3-4 had drifted md5 hashes. Changing primary color meant editing 4 files; missing one = drift.

**After**: One master file at `shared/styles/themes.master.css`. Sync script copies (with banner) into each site's `src/styles/themes.css`. Variants live in master.

## File layout

```
wizPulseAI/
├── shared/
│   └── styles/
│       └── themes.master.css         # ★ source of truth
├── tools/
│   ├── sync-themes.sh                # copy master → 4 sites
│   └── SYNC_THEMES_README.md         # this file
├── wizPulseAI-com/src/styles/themes.css         # synced
├── auth-wizpulseai-com/src/styles/themes.css    # synced
├── db-wizPulseAI-com/src/styles/themes.css      # synced
└── fashion-wizpulseai-com/src/styles/themes.css # synced (+ magicoord-themes.css local)
```

dino-kids-app uses Vite SPA + App.css (not part of token system).

## Two axes (orthogonal)

- `data-theme=light/dark/warm` — **color mode** (lightness curve)
- `data-variant=sucre|luminous|editorial|wabi|urban` — **design DNA**

Default (no `data-variant`): falls back to data-theme (current production unchanged).

## 5 variants (pool for master 1-pick)

| ID | Name | Vibe |
|----|------|------|
| sucre | Sucré | cream + rose-gold + plum, sweet/playful |
| luminous | Luminous Grimoire | indigo + violet, AI-tech mystical |
| editorial | Editorial Mono | pure B/W + red, NYT/Vogue |
| wabi | Wabi-Sabi (侘び寂び) | paper + ink + moss + 朱紫, Japanese |
| urban | Urban Edge | carbon + neon-orange + violet, developer |

Mockups: `core/docs/matrix-themes-2026-05-11/theme-comparison.html`

## Preview a variant locally

In browser console:
```js
document.cookie = 'WIZPULSE_VARIANT=urban; path=/; domain=.wizpulseai.com';
location.reload();
```

Or set `<html data-variant="urban">` directly via DevTools.

## CI integration (future)

This Phase B ships with manual sync. DISPATCH-146 (or successor) wires
`.github/workflows/sync-themes.yml` per-site to run `--check` on PRs.

Until then, **always run sync after editing master + before committing**.
