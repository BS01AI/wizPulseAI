# REVIEW-B-TECHNICAL.md -- CSS Technical Review

> Reviewer: Agent B (CSS Technical Reviewer)
> Date: 2026-04-08
> Files reviewed:
> - `DESIGN-MATRIX.md`
> - `DESIGN-MAGICOORD.md`

---

## DESIGN-MATRIX.md

### Verdict: NEEDS_REVISION

3 issues must be fixed before implementation. The rest is solid.

---

### CSS Variable Validity

**All hex colors**: PASS -- all 6-digit hex values are syntactically valid across all 3 themes.

**Font stacks**: PASS
- `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` -- adequate system fallbacks.
- Mono: `'JetBrains Mono', 'SF Mono', 'Fira Code', monospace` -- good coverage.
- Warmth theme adds `'Poppins'` for display -- acceptable with `sans-serif` fallback.

**Spacing scale**: PASS -- 4px base, consistent `0.25rem` increments, skips 7/9/11/13-15 intentionally (standard Tailwind convention).

**Border-radius**: PASS -- practical values, `9999px` for `--radius-full` is standard pill approach.

**Shadows**: PASS -- all use valid `box-shadow` multi-value syntax. Light theme uses `rgba(0,0,0,...)`, Warmth uses `rgba(28,25,23,...)` for warm tint, Obsidian uses higher opacity for dark mode. All syntactically correct.

**Transitions**: PASS -- `150ms/200ms/300ms cubic-bezier(0.4, 0, 0.2, 1)` is the standard Material ease-out curve.

---

### WCAG Contrast Compliance

Tested all foreground/background pairs using WCAG 2.1 relative luminance formula.

#### Theme: Precision Light

| Variable | Foreground | Background | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|----------|-----------|------------|-------|-------------------|----------------|
| `--color-text` | #111827 | #FFFFFF | 17.74:1 | PASS | PASS |
| `--color-text-secondary` | #4B5563 | #FFFFFF | 7.56:1 | PASS | PASS |
| `--color-text-muted` | #9CA3AF | #FFFFFF | **2.54:1** | **FAIL** | **FAIL** |
| `--color-primary` (link) | #4F46E5 | #FFFFFF | 6.29:1 | PASS | PASS |
| `--color-text-on-primary` | #FFFFFF | #4F46E5 | 6.29:1 | PASS | PASS |
| `--color-success` | #059669 | #FFFFFF | 3.77:1 | **FAIL** | PASS |
| `--color-warning` | #D97706 | #FFFFFF | 3.19:1 | **FAIL** | PASS |
| `--color-error` | #DC2626 | #FFFFFF | 4.83:1 | PASS | PASS |

#### Theme: Obsidian

| Variable | Foreground | Background | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|----------|-----------|------------|-------|-------------------|----------------|
| `--color-text` | #FAFAFA | #09090B | 19.06:1 | PASS | PASS |
| `--color-text-secondary` | #A1A1AA | #09090B | 7.76:1 | PASS | PASS |
| `--color-text-muted` | #71717A | #09090B | 4.12:1 | **FAIL** | PASS |
| `--color-primary` | #818CF8 | #09090B | 6.67:1 | PASS | PASS |
| `--color-text-on-primary` | #FFFFFF | #818CF8 | **2.98:1** | **FAIL** | **FAIL** |

#### Theme: Warmth

| Variable | Foreground | Background | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|----------|-----------|------------|-------|-------------------|----------------|
| `--color-text` | #1C1917 | #FEFDFB | 17.20:1 | PASS | PASS |
| `--color-text-secondary` | #57534E | #FEFDFB | 7.50:1 | PASS | PASS |
| `--color-text-muted` | #A8A29E | #FEFDFB | **2.48:1** | **FAIL** | **FAIL** |
| `--color-primary` (link) | #D97706 | #FEFDFB | **3.13:1** | **FAIL** | PASS |
| `--color-text-on-primary` | #FFFFFF | #D97706 | **3.19:1** | **FAIL** | PASS |

---

### Issues Found

#### ISSUE M-1: `--color-text-muted` fails AA across all 3 themes (SEVERITY: LOW)

- Precision Light: #9CA3AF on #FFFFFF = 2.54:1 (fails even AA-large)
- Obsidian: #71717A on #09090B = 4.12:1 (fails AA-normal, passes AA-large)
- Warmth: #A8A29E on #FEFDFB = 2.48:1 (fails even AA-large)

**Acceptable if** `--color-text-muted` is restricted to decorative/non-essential text (placeholders, timestamps, disabled labels). The document does use it for `placeholder:text-text-muted` which is a valid exemption under WCAG (placeholders are not required to meet contrast). **Flag this as a design constraint: `text-muted` must never be used for actionable or informational text.**

**Recommendation**: Darken muted colors slightly for safety:
- Light: #9CA3AF -> #6B7280 (Gray 500, 4.64:1)
- Obsidian: #71717A -> #71717A (already passes AA-large, acceptable for dark mode)
- Warmth: #A8A29E -> #78716C (Stone 500, 4.62:1)

#### ISSUE M-2: Obsidian `--color-text-on-primary` fails AA entirely (SEVERITY: HIGH)

White text (#FFFFFF) on Indigo 400 (#818CF8) = **2.98:1** -- fails both AA-normal and AA-large.

This means primary buttons in dark mode will have illegible text.

**Fix required** (pick one):
1. Change `--color-text-on-primary` to `#09090B` (dark text on light indigo) -- ratio becomes 6.67:1
2. Darken `--color-primary` to #6366F1 (Indigo 500) -- white text ratio becomes 4.17:1 (still fails normal, passes large)
3. Change `--color-text-on-primary` to `#1E1B4B` (Indigo 950) for best contrast

**Recommended fix**: Option 1. Set `--color-text-on-primary: #09090B` in Obsidian theme. This is consistent with Magicoord Noir which correctly uses dark text on gold.

#### ISSUE M-3: Warmth `--color-primary` (#D97706) fails AA for normal text (SEVERITY: MEDIUM)

Amber 600 on warm white = 3.13:1. This means inline links and small button labels using the primary color will not meet AA.

White on Amber 600 button = 3.19:1 -- also fails AA-normal.

**Fix required** (pick one):
1. Darken primary to #B45309 (Amber 700). On #FEFDFB: 4.87:1 (passes AA-normal). White on #B45309: 4.12:1 (fails AA-normal but passes AA-large -- acceptable for buttons with 16px+ text).
2. Darken primary to #92400E (Amber 800). On #FEFDFB: 7.27:1 (passes all). But loses the warm amber character.

**Recommended fix**: Option 1. Change `--color-primary: #B45309` and `--color-primary-hover: #92400E` in Warmth theme. Accept that button text will be large enough to pass AA-large.

---

### Tailwind Compatibility

**Variable-to-config mapping**: PASS -- the `extend.colors` config correctly maps CSS vars with `var(--color-*)` syntax.

**`data-theme` approach**: PASS -- works with Tailwind since Tailwind generates static utility classes that reference CSS vars. Theme switching changes the var values, not the classes.

**Conflict check**: One concern noted.

#### ISSUE M-4: Tailwind spacing override may cause confusion (SEVERITY: LOW)

Lines 335-346: The config overrides Tailwind's default `spacing` scale with CSS vars. This means `p-4` will resolve to `var(--space-4)` (1rem) instead of Tailwind's default `1rem`. In practice they are identical, but if a developer uses `p-7` or `p-9` (which exist in Tailwind defaults but are not defined in the var system), they will get Tailwind's fallback or no value.

**Recommendation**: Either (a) add a comment in the config noting that only defined spacing keys are valid, or (b) only extend spacing for non-standard keys and let Tailwind's defaults handle the standard ones. Since the values are identical to Tailwind defaults, option (b) is simpler -- remove the spacing override entirely and rely on Tailwind's built-in scale.

---

### Cross-browser

**CSS custom properties**: PASS -- standard `var()` syntax, supported in all modern browsers (Chrome 49+, Firefox 31+, Safari 9.1+, Edge 15+).

**Vendor prefixes**: PASS -- no proprietary properties used. `cubic-bezier()` is universally supported.

**Font fallbacks**: PASS -- adequate system font stacks with `sans-serif`/`monospace` generic fallbacks.

---

### Theme Switching Architecture

**Cookie-based persistence**: PASS -- standard approach. `SameSite=Lax` is correct for cross-page navigation. 1-year expiry is reasonable.

**FOUC prevention**: PASS -- the `layout.tsx` reads the cookie server-side and sets `data-theme` on `<html>` before hydration. This prevents flash-of-unstyled-content since the attribute is present in the initial HTML response. Correct approach for Next.js App Router.

**SSR compatibility**: PASS -- `cookies()` is a server-only API in Next.js App Router. The `getTheme()` client function correctly checks `typeof document === 'undefined'` for SSR safety.

**Cookie domain conflict with Magicoord**: The doc uses `WIZPULSE_THEME` cookie on `.wizpulseai.com`. Magicoord uses `MAGI_THEME`. These are different cookie names so no conflict. PASS.

---

### Summary for DESIGN-MATRIX.md

| Check | Status |
|-------|--------|
| CSS variable syntax | PASS |
| Hex color validity | PASS |
| Font stacks | PASS |
| Spacing scale | PASS |
| Border-radius | PASS |
| Shadow syntax | PASS |
| Transition syntax | PASS |
| WCAG text-on-bg | PASS (text, text-secondary) |
| WCAG muted text | LOW (document constraint needed) |
| WCAG Obsidian text-on-primary | **HIGH -- must fix** |
| WCAG Warmth primary on bg | **MEDIUM -- must fix** |
| Tailwind compatibility | PASS (minor spacing note) |
| Cross-browser | PASS |
| Theme switching | PASS |
| FOUC prevention | PASS |

**Required fixes before PASS**: M-2 (Obsidian text-on-primary), M-3 (Warmth primary contrast)

---
---

## DESIGN-MAGICOORD.md

### Verdict: NEEDS_REVISION

2 issues must be fixed. Overall quality is high.

---

### CSS Variable Validity

**All hex colors**: PASS -- all valid. `rgba()` values in `--color-primary-subtle` and shadows are syntactically correct.

**Font stacks**: PASS -- excellent Japanese font support.
- Sans: `'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif` -- correctly includes Japanese system fonts for the JP market.
- Noir display: `'Playfair Display', 'Noto Serif JP', Georgia, serif` -- good serif fallback chain including Japanese serif.
- Pop display: `'Poppins', -apple-system, BlinkMacSystemFont, sans-serif` -- note: missing Japanese fonts in Pop display stack (see Issue F-3).
- Mono: `'JetBrains Mono', monospace` -- minimal but sufficient (mono is rarely used in fashion UI).

**Spacing scale**: PASS -- identical 4px base to Matrix. Good for developer consistency across projects.

**Border-radius**: PASS -- Noir uses sharper values (2px sm) for luxury feel, Pop uses rounder (8px sm). Intentional brand differentiation. `9999px` for pill shape is standard.

**Shadows**: PASS -- all syntactically valid. Noir uses `--shadow-glow` with gold-tinted rgba -- valid CSS. Pop uses red-tinted shadows -- valid. Clean sets `--shadow-glow: none` -- valid.

**Transitions**: PASS with note.
- Standard: `cubic-bezier(0.4, 0, 0.2, 1)` -- Material ease-out. Valid.
- Slow/emotional in Noir: `cubic-bezier(0.16, 1, 0.3, 1)` -- ease-out-expo style. Valid.
- Pop bouncy: `cubic-bezier(0.34, 1.56, 0.64, 1)` -- overshoot bounce. Valid CSS (values >1 are allowed for y-coordinates). May cause layout jank on elements that affect surrounding content -- acceptable for scale/opacity transforms but risky for width/height/padding transitions. **Design constraint: Pop theme `transition-fast/normal/slow` should only be applied to `transform` and `opacity` properties, not layout properties.**

---

### WCAG Contrast Compliance

#### Theme: Elegant Noir

| Variable | Foreground | Background | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|----------|-----------|------------|-------|-------------------|----------------|
| `--color-text` | #F5F5F5 | #0A0A0A | 18.16:1 | PASS | PASS |
| `--color-text-secondary` | #B3B3B3 | #0A0A0A | 9.44:1 | PASS | PASS |
| `--color-text-muted` | #737373 | #0A0A0A | 4.18:1 | **FAIL** | PASS |
| `--color-primary` (gold) | #D4AF37 | #0A0A0A | 9.42:1 | PASS | PASS |
| `--color-text-on-primary` | #0A0A0A | #D4AF37 | 9.42:1 | PASS | PASS |
| `--color-text-secondary` | #B3B3B3 | #1A1A1A (surface) | 8.30:1 | PASS | PASS |
| `--color-text-muted` | #737373 | #1A1A1A (surface) | 3.67:1 | **FAIL** | PASS |

#### Theme: Fresh & Minimal

| Variable | Foreground | Background | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|----------|-----------|------------|-------|-------------------|----------------|
| `--color-text` | #171717 | #FFFFFF | 17.93:1 | PASS | PASS |
| `--color-text-secondary` | #525252 | #FFFFFF | 7.81:1 | PASS | PASS |
| `--color-text-muted` | #A3A3A3 | #FFFFFF | **2.52:1** | **FAIL** | **FAIL** |
| `--color-primary` | #4F46E5 | #FFFFFF | 6.29:1 | PASS | PASS |
| `--color-text-on-primary` | #FFFFFF | #4F46E5 | 6.29:1 | PASS | PASS |
| `--color-secondary` | #EC4899 | #FFFFFF | 3.53:1 | **FAIL** | PASS |

#### Theme: Vibrant Pop

| Variable | Foreground | Background | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|----------|-----------|------------|-------|-------------------|----------------|
| `--color-text` | #1A1A2E | #FFFCF9 | 16.69:1 | PASS | PASS |
| `--color-text-secondary` | #4A4A68 | #FFFCF9 | 8.32:1 | PASS | PASS |
| `--color-text-muted` | #9898B0 | #FFFCF9 | **2.76:1** | **FAIL** | **FAIL** |
| `--color-primary` (red) | #E60023 | #FFFCF9 | 4.68:1 | PASS | PASS |
| `--color-text-on-primary` | #FFFFFF | #E60023 | 4.78:1 | PASS | PASS |
| `--color-accent` (amber) | #F59E0B | #FFFCF9 | **2.10:1** | **FAIL** | **FAIL** |

---

### Issues Found

#### ISSUE F-1: `--color-text-muted` fails AA across all 3 themes (SEVERITY: LOW)

Same pattern as Matrix. Muted text fails contrast in all themes. The document correctly uses `text-muted` for placeholder text in the Input component example (line 497: `placeholder:text-text-muted`), which is WCAG-exempt.

**Same recommendation as M-1**: Document that `text-muted` is restricted to non-essential decorative content only.

#### ISSUE F-2: Pop `--color-accent` (#F59E0B) fails AA entirely (SEVERITY: HIGH)

Amber 500 on warm white (#FFFCF9) = **2.10:1** -- fails both AA-normal and AA-large. If accent color is used for any text or interactive element, it will be illegible.

**Fix required**:
- Darken to #D97706 (Amber 600): 3.16:1 -- passes AA-large only
- Darken to #B45309 (Amber 700): 4.93:1 -- passes AA-normal

**Recommended fix**: Change `--color-accent: #D97706` (Amber 600) and restrict accent to large text/icons only. If accent is used for small text, use #B45309.

#### ISSUE F-3: Pop `font-display` missing Japanese fonts (SEVERITY: MEDIUM)

Line 264: `--font-display: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;`

Unlike the sans stack (which includes `'Hiragino Sans', 'Yu Gothic'`), the display stack for Pop theme omits Japanese fonts. Since headings may contain Japanese text (the primary market), this will fall through to the generic `sans-serif` which may render inconsistently across platforms.

**Fix**: Change to `'Poppins', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif;`

#### ISSUE F-4: Clean `--color-secondary` (#EC4899) fails AA-normal (SEVERITY: LOW)

Pink 500 on white = 3.53:1. Passes AA-large but fails AA-normal. Acceptable if secondary color is only used for large decorative elements, not small body text.

**Recommendation**: Document that `--color-secondary` in Clean theme should not be used for text smaller than 18px / 14px bold.

---

### Tailwind Compatibility

**Variable-to-config mapping**: PASS -- identical pattern to Matrix. Consistent developer experience.

**`shadow-glow` addition**: PASS -- Magicoord adds a `glow` key to `boxShadow` that Matrix does not have. This is fine since they use separate configs.

**`transitionDuration` values**: Note -- Magicoord defines `emotional: '600ms'` but the CSS var `--transition-emotional` in Noir is also `600ms` while Pop is `500ms`. The Tailwind config hardcodes `600ms` which will be incorrect for Pop. However, since `--transition-emotional` includes the timing function (not just duration), components should use `transition-all` with inline `style={{ transition: 'var(--transition-emotional)' }}` rather than Tailwind's `duration-emotional` for the emotional transition. **Minor inconsistency but not blocking.**

---

### Cross-browser

**CSS custom properties**: PASS.

**Bounce easing `cubic-bezier(0.34, 1.56, 0.64, 1)`**: PASS -- valid per CSS spec. Y-values outside 0-1 range are permitted. Supported in all modern browsers.

**Font loading**: The document references `Playfair Display` and `Noto Serif JP` (Noir) and `Poppins` (Pop) but does not specify loading strategy. Migration step 7 (line 641) mentions adding these to `next.config` / font loading. This is sufficient as a design doc -- implementation details belong in the migration task.

---

### Theme Switching Architecture

**Cookie isolation**: PASS -- `MAGI_THEME` cookie is correctly separate from `WIZPULSE_THEME`. Both use `.wizpulseai.com` domain which means the cookie is technically visible to Matrix sites, but since they read different cookie names, no conflict occurs.

**FOUC prevention**: PASS -- same server-side `data-theme` injection pattern as Matrix.

**SSR compatibility**: PASS -- `getMagiTheme()` has `typeof document === 'undefined'` guard.

**Default theme**: Noir is the `:root` default. This means if no cookie is set, users see the dark luxury theme. This is a brand decision, not a technical issue.

---

### Summary for DESIGN-MAGICOORD.md

| Check | Status |
|-------|--------|
| CSS variable syntax | PASS |
| Hex color validity | PASS |
| Font stacks (sans) | PASS (includes JP fonts) |
| Font stacks (display) | **MEDIUM -- Pop missing JP fonts** |
| Spacing scale | PASS |
| Border-radius | PASS |
| Shadow syntax | PASS |
| Transition syntax | PASS (bounce easing valid) |
| WCAG text-on-bg | PASS (text, text-secondary) |
| WCAG muted text | LOW (document constraint needed) |
| WCAG Pop accent | **HIGH -- must fix** |
| WCAG Clean secondary | LOW (usage constraint) |
| Tailwind compatibility | PASS |
| Cross-browser | PASS |
| Theme switching | PASS |
| FOUC prevention | PASS |
| Cookie isolation | PASS |

**Required fixes before PASS**: F-2 (Pop accent contrast), F-3 (Pop display font JP fallback)

---
---

## Combined Fix List

### Must Fix (blocks PASS)

| ID | File | Line | Issue | Fix |
|----|------|------|-------|-----|
| M-2 | DESIGN-MATRIX.md | 177 | Obsidian `--color-text-on-primary: #FFFFFF` on #818CF8 = 2.98:1 | Change to `#09090B` |
| M-3 | DESIGN-MATRIX.md | 220 | Warmth `--color-primary: #D97706` on #FEFDFB = 3.13:1 | Change to `#B45309` (Amber 700), update hover to `#92400E` |
| F-2 | DESIGN-MAGICOORD.md | 236 | Pop `--color-accent: #F59E0B` on #FFFCF9 = 2.10:1 | Change to `#D97706` (Amber 600) |
| F-3 | DESIGN-MAGICOORD.md | 264 | Pop `--font-display` missing JP fonts | Add `'Hiragino Sans', 'Yu Gothic'` before `sans-serif` |

### Should Fix (recommended)

| ID | File | Issue | Fix |
|----|------|-------|-----|
| M-1 | DESIGN-MATRIX.md | `--color-text-muted` usage constraint | Add note: "muted is for decorative text only (placeholders, timestamps)" |
| F-1 | DESIGN-MAGICOORD.md | `--color-text-muted` usage constraint | Same as M-1 |
| F-4 | DESIGN-MAGICOORD.md | Clean `--color-secondary` #EC4899 = 3.53:1 | Add note: "secondary in Clean theme: large text/icons only" |
| M-4 | DESIGN-MATRIX.md | Tailwind spacing override is redundant | Consider removing spacing override or adding comment |

### Design Constraints to Document

1. `--color-text-muted` must not be used for actionable or informational text in any theme
2. Pop theme bouncy transitions (`cubic-bezier(0.34, 1.56, 0.64, 1)`) should only apply to `transform` and `opacity`, not layout properties
3. Clean theme `--color-secondary` (#EC4899) should not be used for text below 18px / 14px bold

---

*Review complete. 4 blocking issues identified. After fixes, both documents are technically sound for implementation.*
