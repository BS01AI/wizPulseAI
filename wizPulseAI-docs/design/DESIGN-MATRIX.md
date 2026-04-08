# DESIGN-MATRIX.md -- Matrix Sites Design System

> Covers: www.wizpulseai.com / auth.wizpulseai.com / dashboard.wizpulseai.com

---

## Brand Positioning

**"AI infrastructure you can trust -- intelligent, polished, invisible."**

Keywords: **Professional**, **Precise**, **Trustworthy**

---

## Reference Sources

| Site | What We Learned |
|------|----------------|
| **stripe.com** | Clean white space, muted brand color, generous padding, subtle gradients, wave-like organic backgrounds |
| **linear.app** | Dark-first design, monochrome with one accent color, sharp typography scale (9 title levels), stepped grid animations |
| **vercel.com** | Geist font family, pure black/white with light/dark toggle, minimal shadows, strong contrast, code-first aesthetic |
| **anthropic.com** | Warm coral accent (#d97757), fluid clamp() typography, GSAP scroll animations, restrained color palette, earthy neutrals |
| **notion.com** | Vibrant multi-color accents on dark backgrounds, card-centric layout, playful but structured, warm type |
| **pinterest.com** | 4px spacing unit, comprehensive radius scale (0-999px), well-defined shadow elevation (surface/raised/floating), Pin Sans custom font |

---

## Current State Audit

### Inconsistencies Found

| Problem | Details |
|---------|---------|
| **Three different variable systems** | Auth uses `--auth-*` HSL variables, Dashboard uses `--brand-*` hex variables, Main uses both |
| **Font stacks differ** | Dashboard: `Inter, ui-sans-serif`; Main: `var(--font-inter)`; Auth: none specified |
| **Color spaces mixed** | Auth/Main use HSL `262 83% 58%`; Dashboard themes.css uses hex `#3F51B5`; Fashion uses raw hex |
| **Shadow definitions diverge** | Dashboard has 5 levels; themes.css has 4; Auth has site-specific `--auth-shadow-card` |
| **Border radius approaches** | Auth/Main use `var(--radius)` with calc offsets; Dashboard uses `themeConfig.borderRadius` object; Fashion uses custom `'fashion': '12px'` |
| **Theme numbering confusion** | themes.css uses 1-4; Dashboard globals.css also maps 11/12 to same themes; `.dark` class overlaps with `[data-theme="3"]` |

---

## Theme Architecture

All three Matrix sites share a single `themes.css` file (already copied to each site for Vercel deployment). The new design system replaces the current 4-theme Indigo/Rose system with 3 professionally curated themes selectable via `data-theme` attribute.

### Theme Numbering (v3.0)

| ID | Name | Mode | Inspiration |
|----|------|------|-------------|
| `light` | Precision Light | Light | Stripe + Linear light mode |
| `dark` | Obsidian | Dark | Vercel + Linear dark mode |
| `warm` | Warmth | Light | Notion + Anthropic warm tones |

---

## Theme 1: Precision Light

> Inspired by Stripe's cleanliness and Linear's sharpness. White backgrounds, one strong accent, minimal shadows.

```css
/* ============================================
   Theme: Precision Light
   Selector: [data-theme="light"], :root
   ============================================ */

[data-theme="light"], :root {
  /* --- Brand --- */
  --color-primary: #4F46E5;           /* Indigo 600 */
  --color-primary-hover: #4338CA;     /* Indigo 700 */
  --color-primary-subtle: #EEF2FF;    /* Indigo 50 */
  --color-secondary: #7C3AED;         /* Violet 600 */
  --color-accent: #2563EB;            /* Blue 600 */

  /* --- Backgrounds --- */
  --color-bg: #FFFFFF;
  --color-bg-subtle: #F9FAFB;         /* Gray 50 */
  --color-bg-muted: #F3F4F6;          /* Gray 100 */
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;

  /* --- Text --- */
  --color-text: #111827;              /* Gray 900 */
  --color-text-secondary: #4B5563;    /* Gray 600 */
  --color-text-muted: #9CA3AF;        /* Gray 400 */
  --color-text-on-primary: #FFFFFF;

  /* --- Borders --- */
  --color-border: #E5E7EB;            /* Gray 200 */
  --color-border-subtle: #F3F4F6;     /* Gray 100 */
  --color-border-focus: #4F46E5;

  /* --- Semantic --- */
  --color-success: #059669;           /* Emerald 600 */
  --color-warning: #D97706;           /* Amber 600 */
  --color-error: #DC2626;             /* Red 600 */
  --color-info: #2563EB;              /* Blue 600 */

  /* --- Typography --- */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.875rem;   /* 30px */
  --font-size-4xl: 2.25rem;    /* 36px */

  /* --- Spacing (4px base unit) --- */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  /* --- Radius --- */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-full: 9999px;

  /* --- Shadows --- */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  --shadow-focus: 0 0 0 3px rgba(79, 70, 229, 0.15);

  /* --- Transitions --- */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Theme 2: Obsidian

> Inspired by Vercel's pure dark mode and Linear's dark UI. True dark backgrounds, sharp contrast, cool neutrals.

```css
/* ============================================
   Theme: Obsidian (Dark)
   Selector: [data-theme="dark"]
   ============================================ */

[data-theme="dark"] {
  /* --- Brand --- */
  --color-primary: #818CF8;           /* Indigo 400 */
  --color-primary-hover: #A5B4FC;     /* Indigo 300 */
  --color-primary-subtle: rgba(129, 140, 248, 0.1);
  --color-secondary: #A78BFA;         /* Violet 400 */
  --color-accent: #60A5FA;            /* Blue 400 */

  /* --- Backgrounds --- */
  --color-bg: #09090B;               /* Nearly black (Vercel-style) */
  --color-bg-subtle: #18181B;         /* Zinc 900 */
  --color-bg-muted: #27272A;          /* Zinc 800 */
  --color-surface: #18181B;
  --color-surface-raised: #27272A;

  /* --- Text --- */
  --color-text: #FAFAFA;              /* Zinc 50 */
  --color-text-secondary: #A1A1AA;    /* Zinc 400 */
  --color-text-muted: #71717A;        /* Zinc 500 */
  --color-text-on-primary: #09090B;   /* Dark text on Indigo 400 button — WCAG AA fix */

  /* --- Borders --- */
  --color-border: #27272A;            /* Zinc 800 */
  --color-border-subtle: #1C1C1F;
  --color-border-focus: #818CF8;

  /* --- Semantic --- */
  --color-success: #34D399;           /* Emerald 400 */
  --color-warning: #FBBF24;           /* Amber 400 */
  --color-error: #F87171;             /* Red 400 */
  --color-info: #60A5FA;              /* Blue 400 */

  /* --- Typography (inherited from light, only color-dependent vars change) --- */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  /* font-size, spacing, radius, transitions: inherited from :root */

  /* --- Shadows (deeper for dark mode) --- */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  --shadow-focus: 0 0 0 3px rgba(129, 140, 248, 0.25);
}
```

---

## Theme 3: Warmth

> Inspired by Anthropic's earthy tones and Notion's approachable feel. Cream backgrounds, warm accent, generous rounding.

```css
/* ============================================
   Theme: Warmth
   Selector: [data-theme="warm"]
   ============================================ */

[data-theme="warm"] {
  /* --- Brand --- */
  --color-primary: #B45309;           /* Amber 700 — darkened for WCAG AA contrast */
  --color-primary-hover: #92400E;     /* Amber 800 */
  --color-primary-subtle: #FFFBEB;    /* Amber 50 */
  --color-secondary: #DC2626;         /* Red 600 -- for accents */
  --color-accent: #059669;            /* Emerald 600 */

  /* --- Backgrounds --- */
  --color-bg: #FEFDFB;               /* Warm white */
  --color-bg-subtle: #FBF8F3;         /* Cream */
  --color-bg-muted: #F5F0E8;          /* Warm gray */
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;

  /* --- Text --- */
  --color-text: #1C1917;              /* Stone 900 */
  --color-text-secondary: #57534E;    /* Stone 600 */
  --color-text-muted: #A8A29E;        /* Stone 400 */
  --color-text-on-primary: #FFFFFF;

  /* --- Borders --- */
  --color-border: #E7E5E4;            /* Stone 200 */
  --color-border-subtle: #F5F5F4;     /* Stone 100 */
  --color-border-focus: #D97706;

  /* --- Semantic --- */
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --color-info: #2563EB;

  /* --- Typography --- */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Poppins', 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  /* font-size, spacing: inherited from :root */

  /* --- Radius (slightly rounder for warmth) --- */
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;

  /* --- Shadows (warmer tint) --- */
  --shadow-sm: 0 1px 2px 0 rgba(28, 25, 23, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(28, 25, 23, 0.06), 0 2px 4px -2px rgba(28, 25, 23, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(28, 25, 23, 0.07), 0 4px 6px -4px rgba(28, 25, 23, 0.03);
  --shadow-xl: 0 20px 25px -5px rgba(28, 25, 23, 0.08), 0 8px 10px -6px rgba(28, 25, 23, 0.04);
  --shadow-focus: 0 0 0 3px rgba(217, 119, 6, 0.15);

  /* --- Transitions --- */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Tailwind Integration

### tailwind.config.ts (shared across all 3 Matrix sites)

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // NO darkMode class -- handled by data-theme attribute
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
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
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
        focus: 'var(--shadow-focus)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
{/* Primary */}
<button className="
  bg-primary text-white font-medium
  px-4 py-2.5 rounded-lg
  hover:bg-primary-hover
  shadow-sm hover:shadow-md
  transition-all duration-normal
  focus:outline-none focus:ring-2 focus:ring-primary/20
">
  Get Started
</button>

{/* Secondary / Ghost */}
<button className="
  bg-transparent text-foreground font-medium
  px-4 py-2.5 rounded-lg
  border border-border
  hover:bg-bg-subtle
  transition-all duration-normal
  focus:outline-none focus:ring-2 focus:ring-primary/20
">
  Learn More
</button>

{/* Destructive */}
<button className="
  bg-error text-white font-medium
  px-4 py-2.5 rounded-lg
  hover:bg-error/90
  transition-all duration-normal
">
  Delete
</button>
```

### Card

```tsx
<div className="
  bg-surface rounded-xl
  border border-border
  shadow-sm hover:shadow-md
  p-6
  transition-all duration-normal
  hover:-translate-y-0.5
">
  <h3 className="text-lg font-semibold text-foreground mb-2">
    Card Title
  </h3>
  <p className="text-sm text-text-secondary">
    Card description text goes here.
  </p>
</div>
```

### Input

```tsx
<input
  type="text"
  placeholder="Enter your email"
  className="
    w-full px-3 py-2.5
    bg-background text-foreground
    border border-border rounded-lg
    placeholder:text-text-muted
    focus:outline-none focus:border-primary
    focus:ring-2 focus:ring-primary/10
    transition-all duration-fast
  "
/>
```

### Badge

```tsx
<span className="
  inline-flex items-center
  px-2.5 py-0.5 rounded-full
  text-xs font-medium
  bg-primary-subtle text-primary
">
  New
</span>
```

---

## DO / DON'T

### DO

- Use CSS custom properties for ALL colors -- never hardcode hex in components
- Keep the same variable names across all 3 Matrix sites
- Use `data-theme` attribute on `<html>` to switch themes
- Use `var(--color-*)` in custom CSS; use Tailwind utility classes in JSX
- Keep shadows subtle in light mode; shadows are for elevation, not decoration
- Use `transition-all duration-normal` for interactive state changes
- Prefer `border border-border` over shadows for card boundaries in light themes
- Use `font-sans` for body text, `font-display` for headings (only in Warmth theme), `font-mono` for code

### DON'T

- Do not use `dark:` Tailwind prefix -- theme switching is via `data-theme`, not `.dark` class
- Do not define separate `--auth-*` or `--brand-*` variable namespaces -- use the unified `--color-*` namespace
- Do not mix HSL format (`262 83% 58%`) with hex format -- standardize on hex
- Do not use `bg-white` or `bg-black` -- use `bg-background` / `bg-surface`
- Do not use more than 2 font families per theme (sans + mono; display only for Warmth headings)
- Do not add decorative gradients to backgrounds (keep backgrounds flat and clean)
- Do not use colored shadows (like `rgba(63, 81, 181, 0.25)`) in Precision Light or Obsidian themes
- Do not override border-radius per-component -- use the theme tokens

---

## Theme Switching Implementation

### 1. Cookie-based persistence

```ts
// lib/theme.ts
const THEME_COOKIE = 'WIZPULSE_THEME';
const COOKIE_DOMAIN = process.env.NODE_ENV === 'production'
  ? '.wizpulseai.com'
  : '.localhost';

export type MatrixTheme = 'light' | 'dark' | 'warm';

export function setTheme(theme: MatrixTheme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.cookie = `${THEME_COOKIE}=${theme}; domain=${COOKIE_DOMAIN}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function getTheme(): MatrixTheme {
  if (typeof document === 'undefined') return 'light';
  return (document.documentElement.getAttribute('data-theme') as MatrixTheme) || 'light';
}
```

### 2. Server-side theme application (layout.tsx)

```tsx
// app/layout.tsx
import { cookies } from 'next/headers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('WIZPULSE_THEME')?.value || 'light';

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
import { setTheme, getTheme, type MatrixTheme } from '@/lib/theme';
import { useState } from 'react';

const themes: { id: MatrixTheme; label: string; icon: string }[] = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'warm', label: 'Warm', icon: 'flame' },
];

export function ThemeSwitcher() {
  const [current, setCurrent] = useState<MatrixTheme>(getTheme());

  function handleChange(theme: MatrixTheme) {
    setTheme(theme);
    setCurrent(theme);
  }

  return (
    <div className="flex gap-1 p-1 bg-bg-muted rounded-lg">
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => handleChange(t.id)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-fast ${
            current === t.id
              ? 'bg-surface text-foreground shadow-sm'
              : 'text-text-muted hover:text-foreground'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
```

---

## Migration Path from Current System

| Step | Action |
|------|--------|
| 1 | Replace `shared/styles/themes.css` with new CSS variables above |
| 2 | Copy updated `themes.css` to all 3 site `src/styles/` directories |
| 3 | Update each site's `tailwind.config` to match the shared config above |
| 4 | Find-and-replace `dark:` prefixed classes with theme-agnostic equivalents |
| 5 | Remove Auth-specific `--auth-*` variables; map to unified `--color-*` names |
| 6 | Remove Dashboard `themeConfig` object; it is now redundant with CSS vars |
| 7 | Update `data-theme` values from numeric `1/2/3/4` to semantic `light/dark/warm` |
| 8 | Update cookie value format in theme switcher components |

---

## File Locations (post-migration)

```
shared/styles/themes.css              <-- source of truth
wizPulseAI-com/src/styles/themes.css  <-- copy for Vercel
auth-wizpulseai-com/src/styles/themes.css
db-wizPulseAI-com/src/styles/themes.css
```

Each site's `globals.css` simply imports this file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import '../styles/themes.css';
```

No site-specific theme variables should exist outside `themes.css`.
