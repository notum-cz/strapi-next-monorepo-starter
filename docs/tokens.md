# Trail Mixx Design Tokens

Design tokens are the visual design atoms of the design system. They represent the smallest design decisions that can be reused across the application.

## Color Tokens

### Primary Colors
```css
--color-primary: #16a34a;        /* Deep Green */
--color-primary-hover: #15803d;  /* Dark Green hover */
--color-primary-900: #14532d;    /* Darkest Green */
```

**Usage:** Play button, primary CTAs, brand accents

### Secondary Colors
```css
--color-secondary: #fb7185;      /* Salmon/Rose */
--color-gray: #374151;           /* Basalt Gray */
--color-gray-800: #2d2d2d;       /* Dark backgrounds */
--color-gray-900: #1a1a1a;       /* Darkest backgrounds */
```

**Usage:** Accents, live indicators, secondary text, backgrounds

### Semantic Colors
```css
--color-error: #ef4444;          /* Error red */
--color-success: #10b981;        /* Success green */
--color-warning: #f59e0b;        /* Warning amber */
--color-info: #3b82f6;           /* Info blue */
```

**Usage:** Error messages, success states, warnings, informational content

### Neutral Colors
```css
--color-white: #ffffff;          /* Pure white */
--color-gray-300: #d1d5db;       /* Light gray */
--color-gray-400: #9ca3af;       /* Medium gray */
--color-gray-700: #374151;       /* Dark gray */
```

**Usage:** Text on dark backgrounds, borders, disabled states

## Typography Tokens

### Font Families
```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.25rem;      /* 20px */
--text-xl: 1.5rem;       /* 24px */
--text-2xl: 2.25rem;     /* 36px */
--text-3xl: 3rem;        /* 48px */
--text-4xl: 3.75rem;     /* 60px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Letter Spacing
```css
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
```

## Spacing Tokens

```css
--space-0: 0;
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
--space-20: 5rem;      /* 80px */
```

**Usage:** Margin, padding, gaps between elements

## Border Tokens

### Border Radius
```css
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1.5rem;     /* 24px */
--radius-full: 9999px;   /* Fully rounded */
```

### Border Width
```css
--border-0: 0;
--border-1: 1px;
--border-2: 2px;
--border-4: 4px;
```

## Shadow Tokens

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
             0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
             0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
             0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

**Usage:** Cards, buttons, modals, elevated UI elements

## Animation Tokens

### Duration
```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Easing
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**Usage:** Transitions, animations, micro-interactions

## Z-Index Tokens

```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

**Usage:** Layering and stacking order

## Breakpoint Tokens

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

**Usage:** Responsive design, media queries

## Component-Specific Tokens

### Player Component
```css
--player-button-height: 48px;
--player-button-width: 128px;
--player-button-radius: 24px;
--player-button-bg: var(--color-primary);
--player-button-bg-hover: var(--color-primary-hover);
--player-button-shadow: var(--shadow-md);
```

### Live Indicator
```css
--live-indicator-size: 8px;
--live-indicator-color: var(--color-error);
--live-indicator-pulse-duration: 2s;
```

### Hero Gradient
```css
--hero-gradient: linear-gradient(135deg, 
  var(--color-primary-900), 
  var(--color-gray-900), 
  var(--color-gray-800)
);
```

## Accessibility Tokens

### Focus Indicators
```css
--focus-ring-width: 3px;
--focus-ring-color: var(--color-primary);
--focus-ring-offset: 2px;
```

### Minimum Touch Target
```css
--touch-target-min: 44px;
```

### Contrast Ratios
- Text (normal): 4.5:1 minimum
- Text (large ≥24px): 3:1 minimum
- UI components: 3:1 minimum

## Usage in Tailwind

These tokens are mapped to Tailwind classes:

```tsx
// Colors
<button className="bg-green-600 hover:bg-green-700">

// Spacing
<div className="p-4 m-2">

// Typography
<h1 className="text-4xl font-bold">

// Borders
<div className="rounded-xl border-2">

// Shadows
<div className="shadow-lg">
```

## Usage in CSS

Can be used as CSS custom properties:

```css
.custom-button {
  background-color: var(--color-primary);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-base) var(--ease-in-out);
}

.custom-button:hover {
  background-color: var(--color-primary-hover);
}
```

## Theme Customization

To customize the theme, update these tokens in:
- `apps/web/src/styles/globals.css` for CSS variables
- `apps/web/tailwind.config.js` for Tailwind theme
- `packages/player-sdk/src/widget.js` for embeddable widget

### Example Customization

```css
:root {
  /* Change primary color from green to blue */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-900: #1e3a8a;
}
```

Or with Tailwind:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

## Token Naming Convention

Tokens follow this naming pattern:
```
--{category}-{property}-{variant?}

Examples:
--color-primary
--color-primary-hover
--space-4
--text-xl
--shadow-lg
--duration-fast
```

## Token Categories

1. **Color** - `--color-*`
2. **Typography** - `--text-*`, `--font-*`, `--leading-*`, `--tracking-*`
3. **Spacing** - `--space-*`
4. **Border** - `--radius-*`, `--border-*`
5. **Shadow** - `--shadow-*`
6. **Animation** - `--duration-*`, `--ease-*`
7. **Z-Index** - `--z-*`
8. **Breakpoint** - `--breakpoint-*`

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
- [Trail Mixx Design Audit](../DESIGN_AUDIT.md)

---

**Last Updated:** 2024-01-01  
**Maintained By:** Trail Mixx Design Team
