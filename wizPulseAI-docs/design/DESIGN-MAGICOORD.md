# DESIGN-MAGICOORD.md -- Magicoord Design System

> Covers: magicoord.wizpulseai.com (standalone fashion AI product)

---

## Brand Positioning

**"Your personal AI stylist -- magic in every outfit."**

Keywords: **Fashionable**, **Personal**, **Magical**

---

## Reference Sources

| Site | What We Learned |
|------|----------------|
| **farfetch.com** | `Farfetch Basis` + `Nimbus Sans Extended D` fonts, token-based design system (`--colors-*`, `--spacers-*`, `--borders-*`), minimal luxury aesthetic, 44px touch targets, `--motion-functional-*` and `--motion-emotional-*` transition tiers |
| **pinterest.com** | `Pin Sans` custom font, #E60023 red accent, 4px spacing grid, comprehensive shadow elevation (surface/raised/floating), `cubic-bezier(0.8,0,0.2,1)` easing, spring animations |
| **wear.jp** | Image-first design, minimal UI chrome, white backgrounds, clean card grids, profile thumbnail standardization (80px/120px), Japanese-market visual patterns |
| **lyst.com** | Clean product grid, black/white with minimal color, strong type hierarchy, filter-heavy UX, editorial-quality imagery |
| **net-a-porter.com** | High-contrast black/white, serif headings for editorial feel, generous whitespace, luxury positioning through restraint |

---

## Current State Audit

| Problem | Details |
|---------|---------|
| **Bare-bones CSS** | Fashion site `globals.css` has only 28 lines -- just `--background` and `--foreground` with no theme system |
| **Tailwind config is limited** | Only defines `fashion-*` colors (black/gold) and custom shadows -- no typography, spacing, or transitions |
| **No theme switching** | Unlike Matrix sites, Fashion has no `data-theme` mechanism at all |
| **Gold color inconsistency** | `#D4AF37` in tailwind but not referenced in any CSS variable system |
| **No radius system** | Single `'fashion': '12px'` border-radius is not enough for a full component library |

---

## Theme Architecture

Magicoord has its own independent theme system. It does NOT share themes with the Matrix sites. Theme switching uses the same `data-theme` attribute mechanism but with fashion-specific theme IDs.

### Theme Numbering

| ID | Name | Vibe | Target |
|----|------|------|--------|
| `noir` | Elegant Noir | Black & gold luxury | Premium / mature audience |
| `clean` | Fresh & Minimal | White & indigo Japanese aesthetic | Broad / unisex audience |
| `pop` | Vibrant Pop | Colorful & energetic | Gen-Z / young audience |

---

## Theme 1: Elegant Noir

> Inspired by Net-A-Porter's luxury positioning and Farfetch's dark surfaces. Black backgrounds, gold accents, serif headings for editorial authority.

```css
/* ============================================
   Theme: Elegant Noir
   Selector: [data-theme="noir"], :root
   ============================================ */

[data-theme="noir"], :root {
  /* --- Brand --- */
  --color-primary: #D4AF37;           /* Gold */
  --color-primary-hover: #E8C547;     /* Gold light */
  --color-primary-subtle: rgba(212, 175, 55, 0.1);
  --color-secondary: #C0C0C0;         /* Silver */
  --color-accent: #D4AF37;            /* Gold (same as primary for mono-accent) */

  /* --- Backgrounds --- */
  --color-bg: #0A0A0A;               /* Near black */
  --color-bg-subtle: #141414;
  --color-bg-muted: #1E1E1E;
  --color-surface: #1A1A1A;
  --color-surface-raised: #242424;

  /* --- Text --- */
  --color-text: #F5F5F5;
  --color-text-secondary: #B3B3B3;
  --color-text-muted: #737373;
  --color-text-on-primary: #0A0A0A;   /* Dark text on gold */

  /* --- Borders --- */
  --color-border: #2A2A2A;
  --color-border-subtle: #1E1E1E;
  --color-border-focus: #D4AF37;

  /* --- Semantic --- */
  --color-success: #34D399;
  --color-warning: #FBBF24;
  --color-error: #F87171;
  --color-info: #60A5FA;

  /* --- Typography --- */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif;
  --font-display: 'Playfair Display', 'Noto Serif JP', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;

  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.875rem;   /* 30px */
  --font-size-4xl: 2.25rem;    /* 36px */

  /* --- Spacing (4px base unit) --- */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* --- Radius (sharp for luxury) --- */
  --radius-sm: 0.125rem;   /* 2px -- almost square */
  --radius-md: 0.25rem;    /* 4px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-full: 9999px;

  /* --- Shadows (gold-tinted glow) --- */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
  --shadow-xl: 0 16px 40px rgba(0, 0, 0, 0.7);
  --shadow-glow: 0 0 20px rgba(212, 175, 55, 0.15);
  --shadow-focus: 0 0 0 3px rgba(212, 175, 55, 0.25);

  /* --- Transitions --- */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-emotional: 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Theme 2: Fresh & Minimal

> Inspired by WEAR.jp's clean aesthetic and Pinterest's structured grids. White backgrounds, soft indigo accent, Japanese typographic sensibility, generous whitespace.

```css
/* ============================================
   Theme: Fresh & Minimal
   Selector: [data-theme="clean"]
   ============================================ */

[data-theme="clean"] {
  /* --- Brand --- */
  --color-primary: #4F46E5;           /* Indigo 600 */
  --color-primary-hover: #4338CA;     /* Indigo 700 */
  --color-primary-subtle: #EEF2FF;    /* Indigo 50 */
  --color-secondary: #EC4899;         /* Pink 500 */
  --color-accent: #8B5CF6;            /* Violet 500 */

  /* --- Backgrounds --- */
  --color-bg: #FFFFFF;
  --color-bg-subtle: #FAFAFA;
  --color-bg-muted: #F5F5F5;
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;

  /* --- Text --- */
  --color-text: #171717;              /* Neutral 900 */
  --color-text-secondary: #525252;    /* Neutral 600 */
  --color-text-muted: #A3A3A3;        /* Neutral 400 */
  --color-text-on-primary: #FFFFFF;

  /* --- Borders --- */
  --color-border: #E5E5E5;            /* Neutral 200 */
  --color-border-subtle: #F5F5F5;     /* Neutral 100 */
  --color-border-focus: #4F46E5;

  /* --- Semantic --- */
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --color-info: #2563EB;

  /* --- Typography --- */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif;
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* font-size, spacing: inherited from :root */

  /* --- Radius (soft and rounded) --- */
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;

  /* --- Shadows (very subtle) --- */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.1);
  --shadow-glow: none;
  --shadow-focus: 0 0 0 3px rgba(79, 70, 229, 0.15);

  /* --- Transitions --- */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-emotional: 500ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Theme 3: Vibrant Pop

> Inspired by Pinterest's bold reds and Gen-Z aesthetics. Bright colors, rounded corners, energetic, playful shadows, and spring animations.

```css
/* ============================================
   Theme: Vibrant Pop
   Selector: [data-theme="pop"]
   ============================================ */

[data-theme="pop"] {
  /* --- Brand --- */
  --color-primary: #E60023;           /* Pinterest red */
  --color-primary-hover: #CC001F;
  --color-primary-subtle: #FFF0F3;
  --color-secondary: #7C3AED;         /* Violet 600 */
  --color-accent: #D97706;            /* Amber 600 — darkened for WCAG AA contrast */

  /* --- Backgrounds --- */
  --color-bg: #FFFCF9;               /* Warm white */
  --color-bg-subtle: #FFF7F0;         /* Peach tint */
  --color-bg-muted: #FEF0E7;
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;

  /* --- Text --- */
  --color-text: #1A1A2E;              /* Deep navy-black */
  --color-text-secondary: #4A4A68;
  --color-text-muted: #9898B0;
  --color-text-on-primary: #FFFFFF;

  /* --- Borders --- */
  --color-border: #F0E6DE;
  --color-border-subtle: #FAF4EF;
  --color-border-focus: #E60023;

  /* --- Semantic --- */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* --- Typography --- */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif;
  --font-display: 'Poppins', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* font-size, spacing: inherited from :root */

  /* --- Radius (very rounded, pill-like) --- */
  --radius-sm: 0.5rem;     /* 8px */
  --radius-md: 0.75rem;    /* 12px */
  --radius-lg: 1rem;       /* 16px */
  --radius-xl: 1.5rem;     /* 24px */
  --radius-full: 9999px;

  /* --- Shadows (colorful, playful) --- */
  --shadow-sm: 0 2px 4px rgba(230, 0, 35, 0.06);
  --shadow-md: 0 4px 12px rgba(230, 0, 35, 0.08);
  --shadow-lg: 0 8px 24px rgba(230, 0, 35, 0.1);
  --shadow-xl: 0 16px 40px rgba(230, 0, 35, 0.12);
  --shadow-glow: 0 0 24px rgba(230, 0, 35, 0.1);
  --shadow-focus: 0 0 0 3px rgba(230, 0, 35, 0.2);

  /* --- Transitions (bouncier) --- */
  --transition-fast: 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-normal: 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-slow: 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-emotional: 500ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Tailwind Integration

### tailwind.config.ts (Magicoord-specific)

```ts
// fashion-wizpulseai-com/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          subtle: 'var(--color-primary-subtle)',
        },
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-bg)',
        'bg-subtle': 'var(--color-bg-subtle)',
        'bg-muted': 'var(--color-bg-muted)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
        },
        foreground: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: 'var(--shadow-glow)',
        focus: 'var(--shadow-focus)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
        emotional: '600ms',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;
```

---

## Component Examples

### Button

```tsx
{/* Primary (Noir: gold on black / Clean: indigo / Pop: red) */}
<button className="
  bg-primary text-[var(--color-text-on-primary)] font-medium
  px-5 py-3 rounded-lg
  hover:bg-primary-hover
  shadow-md hover:shadow-lg
  transition-all duration-normal
  focus:outline-none focus:shadow-focus
">
  AI diagnose
</button>

{/* Ghost */}
<button className="
  bg-transparent text-foreground font-medium
  px-5 py-3 rounded-lg
  border border-border
  hover:bg-bg-subtle hover:border-primary
  transition-all duration-normal
">
  View history
</button>

{/* Pill (for tags/filters) */}
<button className="
  bg-bg-muted text-text-secondary font-medium
  px-4 py-2 rounded-full
  hover:bg-primary-subtle hover:text-primary
  transition-all duration-fast
  text-sm
">
  casual
</button>
```

### Card (Outfit Result)

```tsx
<div className="
  bg-surface rounded-xl overflow-hidden
  border border-border
  shadow-sm hover:shadow-lg
  transition-all duration-normal
  group
">
  {/* Image area */}
  <div className="relative aspect-[3/4] overflow-hidden">
    <img
      src="/outfit.jpg"
      alt="Recommended outfit"
      className="w-full h-full object-cover
        group-hover:scale-105 transition-transform duration-slow"
    />
    {/* Score badge */}
    <span className="
      absolute top-3 right-3
      bg-primary text-[var(--color-text-on-primary)]
      px-2.5 py-1 rounded-full
      text-xs font-bold
      shadow-glow
    ">
      92pts
    </span>
  </div>
  {/* Content */}
  <div className="p-4">
    <h3 className="font-display text-lg text-foreground mb-1">
      Spring Office Coord
    </h3>
    <p className="text-sm text-text-secondary line-clamp-2">
      Navy blazer with cream chinos for a smart-casual look.
    </p>
  </div>
</div>
```

### Input (Photo Upload Area)

```tsx
<label className="
  flex flex-col items-center justify-center
  w-full aspect-square max-w-sm mx-auto
  bg-bg-subtle rounded-xl
  border-2 border-dashed border-border
  hover:border-primary hover:bg-primary-subtle
  transition-all duration-normal
  cursor-pointer group
">
  <svg className="w-10 h-10 text-text-muted group-hover:text-primary
    transition-colors duration-normal mb-3" ... />
  <span className="text-sm text-text-secondary group-hover:text-primary
    transition-colors duration-normal">
    Tap to upload photo
  </span>
  <input type="file" accept="image/*" className="hidden" />
</label>
```

### Input (Text)

```tsx
<input
  type="text"
  placeholder="Search your wardrobe..."
  className="
    w-full px-4 py-3
    bg-bg-subtle text-foreground
    border border-border rounded-lg
    placeholder:text-text-muted
    focus:outline-none focus:border-primary
    focus:shadow-focus
    transition-all duration-fast
  "
/>
```

---

## DO / DON'T

### DO

- Use CSS custom properties for ALL colors -- never use raw hex like `#D4AF37` in components
- Use `font-display` (serif in Noir, sans in others) for headings to create brand differentiation per theme
- Use `aspect-[3/4]` for outfit images (portrait orientation fits fashion photography)
- Use `transition-emotional` for big reveals (photo analysis results, outfit generation)
- Include `'Hiragino Sans', 'Yu Gothic'` in font stacks since the primary market is Japanese
- Use `shadow-glow` sparingly -- only for CTAs and score badges in Noir theme
- Keep image cards borderless or with very subtle borders -- let the photo speak
- Use `group` / `group-hover:` for coordinated hover effects on cards

### DON'T

- Do not use Matrix themes (`light/dark/warm`) on Magicoord -- it has its own `noir/clean/pop`
- Do not share the `WIZPULSE_THEME` cookie -- Magicoord uses its own `MAGI_THEME` cookie
- Do not use heavy drop shadows on light themes (Clean, Pop) -- keep them airy
- Do not apply serif fonts (Playfair Display) outside Noir theme -- it looks out of place in Clean/Pop
- Do not put gold color (`#D4AF37`) in Clean or Pop themes -- gold is Noir-exclusive
- Do not use `bg-black` or `bg-white` -- use `bg-background` / `bg-surface` for theme compatibility
- Do not make buttons smaller than 44px height on mobile (Farfetch standard for touch targets)
- Do not use more than 3 colors from the palette in a single component

---

## Theme Switching Implementation

### 1. Cookie-based persistence (Magicoord-specific)

```ts
// fashion-wizpulseai-com/src/lib/theme.ts
const THEME_COOKIE = 'MAGI_THEME';
const COOKIE_DOMAIN = process.env.NODE_ENV === 'production'
  ? '.wizpulseai.com'
  : '.localhost';

export type MagiTheme = 'noir' | 'clean' | 'pop';

export function setMagiTheme(theme: MagiTheme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.cookie = `${THEME_COOKIE}=${theme}; domain=${COOKIE_DOMAIN}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function getMagiTheme(): MagiTheme {
  if (typeof document === 'undefined') return 'noir';
  return (document.documentElement.getAttribute('data-theme') as MagiTheme) || 'noir';
}
```

### 2. Server-side theme application

```tsx
// fashion-wizpulseai-com/src/app/[locale]/layout.tsx
import { cookies } from 'next/headers';

export default async function FashionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('MAGI_THEME')?.value || 'noir';

  return (
    <html lang="ja" data-theme={theme}>
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

### 3. Theme switcher component

```tsx
'use client';
import { setMagiTheme, getMagiTheme, type MagiTheme } from '@/lib/theme';
import { useState } from 'react';

const themes: { id: MagiTheme; label: string; preview: string }[] = [
  { id: 'noir', label: 'Noir', preview: 'bg-black' },
  { id: 'clean', label: 'Clean', preview: 'bg-indigo-100' },
  { id: 'pop', label: 'Pop', preview: 'bg-red-100' },
];

export function MagiThemeSwitcher() {
  const [current, setCurrent] = useState<MagiTheme>(getMagiTheme());

  function handleChange(theme: MagiTheme) {
    setMagiTheme(theme);
    setCurrent(theme);
  }

  return (
    <div className="flex gap-2 p-1">
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => handleChange(t.id)}
          className={`
            w-8 h-8 rounded-full border-2 transition-all duration-fast
            ${t.preview}
            ${current === t.id
              ? 'border-primary scale-110 shadow-glow'
              : 'border-border hover:border-primary/50'}
          `}
          aria-label={t.label}
        />
      ))}
    </div>
  );
}
```

---

## Why Magicoord Has Separate Themes from Matrix

| Reason | Explanation |
|--------|-------------|
| **Brand identity** | Magicoord is a fashion product with emotional, visual branding. Matrix sites are utilitarian. |
| **Target audience** | Magicoord targets fashion-conscious consumers. Matrix targets developers and admins. |
| **Visual language** | Fashion needs serif fonts, image-first layouts, and emotional transitions. Matrix needs precision. |
| **Color semantics** | Gold means "premium" in fashion but looks unprofessional in a SaaS dashboard. |
| **Cookie isolation** | Separate cookie (`MAGI_THEME`) prevents a user's Matrix preference from overriding their fashion experience. |

---

## Migration Path from Current System

| Step | Action |
|------|--------|
| 1 | Create `fashion-wizpulseai-com/src/styles/magicoord-themes.css` with the 3 themes above |
| 2 | Update `globals.css` to import `magicoord-themes.css` instead of raw variables |
| 3 | Update `tailwind.config.ts` to match the shared config above (remove hardcoded `fashion-*` colors) |
| 4 | Create `src/lib/theme.ts` with `MAGI_THEME` cookie logic |
| 5 | Update `layout.tsx` to read cookie and set `data-theme` attribute |
| 6 | Replace all hardcoded color references (`text-fashion-gold`, `bg-fashion-black`) with theme tokens |
| 7 | Add `Playfair Display` and `Noto Serif JP` fonts to `next.config` / font loading |

---

## File Structure (post-migration)

```
fashion-wizpulseai-com/
  src/
    styles/
      magicoord-themes.css     <-- all 3 themes defined here
    app/
      globals.css              <-- imports magicoord-themes.css
      [locale]/layout.tsx      <-- reads MAGI_THEME cookie, sets data-theme
    lib/
      theme.ts                 <-- setMagiTheme() / getMagiTheme()
    shared/ui/
      MagiThemeSwitcher.tsx    <-- visual theme picker
  tailwind.config.ts           <-- references CSS variables only
```
