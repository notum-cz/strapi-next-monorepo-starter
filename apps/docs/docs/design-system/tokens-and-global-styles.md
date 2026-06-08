---
sidebar_position: 4
---

# Tokens And Global Styles

The shared design system lives in `packages/design-system`. It is consumed by both the Next.js frontend and Strapi editor integrations. See the [`@repo/design-system` package reference](/docs/reference/packages/design-system) for package-level context.

This package keeps frontend rendering and Strapi rich text editing aligned. Tailwind v4 reads theme configuration from CSS, while Strapi editor integrations need compiled CSS and JSON configuration files that can be imported directly.

The main source of reusable UI values is:

```text
packages/design-system/src/theme.css
```

The frontend imports the shared theme from:

```text
apps/ui/src/styles/globals.css
```

```css
@import "tailwindcss";
@import "@repo/design-system/theme.css";
@import "@repo/design-system/custom-styles.css";
```

## Package Purpose

`@repo/design-system` bridges three styling needs:

- Tailwind theme tokens for the Next.js UI.
- Shared rich text and editor CSS.
- Generated Strapi editor configuration for CKEditor and TipTap.

Strapi cannot process Tailwind directives inside admin editor configuration. For Strapi, the package builds plain CSS and JSON outputs from the same source tokens used by the frontend.

## Theme CSS

Use `packages/design-system/src/theme.css` for reusable design tokens:

- Shadcn/ui color tokens.
- Tailwind color palette values.
- Font variables.
- Container widths.
- Breakpoints.
- Spacing and padding values.
- Border radius values.
- Shadows.
- Animation tokens.
- Custom utility classes.
- Custom variants such as dark mode.
- Other shared UI values that should remain consistent across the project.

Treat this file as the single source of truth for reusable visual values.

## Global CSS

Use `apps/ui/src/styles/globals.css` for application-wide styling:

- Global resets and base element styles.
- Tailwind compatibility patches.
- Shared animations and keyframes.
- Third-party component overrides.
- App-wide layout helpers.

Keep project-specific global behavior here. Keep shared design tokens in `packages/design-system/src/theme.css`.

## Consuming The Package

### Next.js

Import the shared theme and custom styles from `apps/ui/src/styles/globals.css`:

```css
@import "@repo/design-system/theme.css";
@import "@repo/design-system/custom-styles.css";
```

Use `@repo/design-system/styles.css` only when a consumer needs compiled CSS instead of Tailwind source theme directives.

### Strapi

Strapi imports generated editor assets from `@repo/design-system`:

- `@repo/design-system/styles-strapi.json` is injected into the Strapi admin editor setup as serialized CSS.
- `@repo/design-system/ck-color-config.json` provides CKEditor colors.
- `@repo/design-system/ck-fontSize-config.json` provides CKEditor font sizes.
- `@repo/design-system/tiptap-color-config.json` provides TipTap color options with readable labels.
- `@repo/design-system/tiptap-theme.css` provides TipTap theme variables as plain CSS.

TipTap plugin configuration imports the generated TipTap files from `apps/strapi/config/plugins.ts` and `apps/strapi/config/plugins/tiptap.ts`.

For editor selection, presets, and renderer guidance, see [Rich Text Editors](/docs/design-system/rich-text-editors).

## Color Format

The template uses OKLCH by default.
But you need to be aware if new design uses oklch or you are forced to change all this to RGB/Hex.

| Format | Notes                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------- |
| Hex    | Simple and common, but hard to adjust by perceived lightness or chroma.                                  |
| RGB    | Similar to hex, with clearer channel values and easier alpha support.                                    |
| OKLCH  | Based on perceived lightness, chroma, and hue. Better for accessible palettes, gradients, and dark mode. |

OKLCH values are made of:

- `L`: lightness.
- `C`: chroma or saturation.
- `H`: hue angle from `0` to `360`.

OKLCH is especially useful when the project needs gradients, strong color consistency or accessible contrast tuning.

## Light And Dark Mode

Decide at project start whether the app supports both light and dark mode.

If the project only supports light mode, use the same values for light and dark theme variables, or force light mode explicitly. This prevents accidental visual changes caused by user system preferences.

The first color group in `theme.css` supports Shadcn/ui components. The broader color palette supports Tailwind utilities and editor color configuration.

If a project has a custom naming convention, avoid overwriting Shadcn/ui variables for unrelated concepts. Add semantic project tokens alongside them instead, so the design system remains compatible with future Shadcn/ui updates.

Example semantic tokens:

```css
@theme static {
  --color-brand-primary: oklch(0.55 0.18 250);
  --color-body-text: oklch(0.2 0 0);
  --color-surface-soft: oklch(0.97 0.01 250);
}
```

## Layout Tokens

Review and adjust these values before building page sections:

- Container widths.
- Breakpoint values.
- Max-width constraints.
- Border radius system.
- Spacing scale.
- Shadow system.
- Section padding.
- Gaps between page-builder components.

These should be defined once and reused. Avoid hardcoding layout values in every component unless the component has a specific design exception.

## Naming Convention

Token naming should scale predictably.

Avoid names that only work for the first two values:

```css
--rounded-s: 4px;
--rounded-m: 16px;
```

If the system later needs `8px`, `12px`, and `24px`, those names become ambiguous.

Prefer ordered token names by tailwind v4:

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
```

If a naming system skips values, mixes units, or cannot grow predictably, discuss it with the UX/UI designer before implementation.

Good token naming should:

- Scale well.
- Stay readable.
- Work for designers and developers.
- Avoid future refactoring.

## Build Outputs

`packages/design-system` builds generated files for frontend and Strapi usage:

```bash
pnpm --filter @repo/design-system build
```

Important exports:

| Export                                         | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| `@repo/design-system/theme.css`                | Raw Tailwind theme source.                 |
| `@repo/design-system/styles.css`               | Compiled CSS.                              |
| `@repo/design-system/custom-styles.css`        | Shared rich text and editor styles.        |
| `@repo/design-system/styles-strapi.json`       | Serialized CSS for Strapi admin injection. |
| `@repo/design-system/ck-color-config.json`     | CKEditor color config.                     |
| `@repo/design-system/ck-fontSize-config.json`  | CKEditor font size config.                 |
| `@repo/design-system/tiptap-color-config.json` | TipTap color palette config.               |
| `@repo/design-system/tiptap-theme.css`         | TipTap theme CSS variables.                |

## Editor Config Outputs

The package build runs Tailwind first, then generates editor-specific outputs:

```bash
tailwindcss -i ./src/styles.css -o ./dist/styles.css
node ./src/build-ck-config.js
node ./src/build-tiptap-config.js
```

`packages/design-system/src/build-ck-config.js` generates CKEditor color, font-size, and serialized style outputs.
`packages/design-system/src/build-tiptap-config.js` generates TipTap color options and theme CSS.

For how those outputs are used in Strapi and the frontend, see [Rich Text Editors](/docs/design-system/rich-text-editors).

:::tip Rebuild After Token Changes
Next.js can pick up source CSS changes during local development, but Strapi editor outputs are generated files. Rebuild `@repo/design-system` and restart Strapi when editor colors, font sizes, or injected styles need to change.
:::
