---
sidebar_position: 4
---

# Tokens And Global Styles

The shared design system lives in `packages/design-system`. It is consumed by both the Next.js frontend and Strapi editor integrations. See the [`@repo/design-system` package reference](/docs/reference/packages/design-system) for package-level context.

This package keeps frontend rendering and Strapi rich text editing aligned. Tailwind v4 reads theme configuration from CSS, while Strapi editor integrations need compiled CSS and JSON configuration files that can be imported directly.

Reusable UI values are split between color tokens and the remaining theme tokens:

```text
packages/design-system/src/styles/colors.css
packages/design-system/src/styles/theme.css
```

The frontend imports the complete shared source entry from:

```text
apps/ui/src/styles/globals.css
```

```css
@import "@repo/design-system/source-styles.css";
```

## Package Purpose

`@repo/design-system` bridges three styling needs:

- Tailwind theme tokens for the Next.js UI.
- Shared rich text and editor CSS.
- Generated Strapi editor configuration for CKEditor and TipTap.

Strapi cannot process Tailwind directives inside admin editor configuration. For Strapi, the package builds plain CSS and JSON outputs from the same source tokens used by the frontend.

## Theme CSS

Use `packages/design-system/src/styles/theme.css` for reusable design tokens:

- Font variables.
- Font sizes, line heights, and weights.
- Container widths.
- Breakpoints.
- Spacing and padding values.
- Border radius values.
- Shadows.
- Animation tokens.
- Other shared UI values that should remain consistent across the project.

Define Shadcn/ui color tokens, dark-mode overrides, and the Tailwind color palette in `packages/design-system/src/styles/colors.css`. The `src/styles.css` entry imports colors and theme as separate files.

Define typography utilities and rich text typography in `packages/design-system/src/styles/typography.css`. Put shared editor rules in `packages/design-system/src/styles/shared.css`. The `src/styles.css` entry file imports Tailwind, local font declarations from `src/fonts.css`, colors, theme, shared styles, and typography.

## Global CSS

Use `apps/ui/src/styles/globals.css` for application-wide styling:

- Global resets and base element styles.
- Tailwind compatibility patches.
- Shared animations and keyframes.
- Third-party component overrides.
- App-wide layout helpers.
- Application utilities and the class-based `dark` variant.

Keep project-specific global behavior here. Keep shared design tokens in `packages/design-system/src/styles/theme.css` and `packages/design-system/src/styles/colors.css`.

## Consuming The Package

### Next.js

Import the shared source entry from `apps/ui/src/styles/globals.css`:

```css
@import "@repo/design-system/source-styles.css";
```

`apps/ui/src/lib/fonts.ts` loads the shared Roboto files through `next/font/local`. The root layout attaches `fontRoboto.variable` to `<html>`, where the shared theme resolves `--font-sans: var(--font-roboto, "Roboto"), sans-serif`. Strapi uses the `"Roboto"` fallback because the Next.js variable is absent. See [Typography](/docs/design-system/typography#font-imports) for the complete setup.

Use `@repo/design-system/styles.css` only when a consumer needs compiled CSS instead of Tailwind source theme directives.

### Strapi

Strapi imports generated editor assets from `@repo/design-system`:

- `@repo/design-system/styles.css` is imported by `apps/strapi/src/admin/app.tsx` for compiled styles and local font declarations.
- `@repo/design-system/styles-strapi.json` is injected into the Strapi admin editor setup as serialized CSS.
- `@repo/design-system/ck-color-config.json` provides CKEditor colors.
- `@repo/design-system/ck-fontSize-config.json` provides CKEditor font sizes.
- `@repo/design-system/tiptap-color-config.json` provides TipTap color options with readable labels.
- `@repo/design-system/tiptap-theme.css` provides TipTap theme variables as plain CSS.

TipTap plugin configuration imports the generated TipTap files from `apps/strapi/config/plugins.ts` and `apps/strapi/config/plugins/tiptap.ts`.

The build copies font assets to `dist/fonts`. Vite processes their URLs through the admin CSS import. CKEditor's serialized CSS excludes `@font-face` declarations because font URLs inside the JSON string are not processed by Vite.

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

The first color group in `colors.css` supports Shadcn/ui components. The broader color palette supports Tailwind utilities and editor color configuration.

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

| Export                                         | Purpose                                     |
| ---------------------------------------------- | ------------------------------------------- |
| `@repo/design-system/source-styles.css`        | Complete Tailwind source entry for Next.js. |
| `@repo/design-system/theme.css`                | Non-color Tailwind theme tokens.            |
| `@repo/design-system/colors.css`               | Color tokens and dark-mode overrides.       |
| `@repo/design-system/typography.css`           | Typography utilities and rich text styles.  |
| `@repo/design-system/shared.css`               | Shared editor rules.                        |
| `@repo/design-system/fonts.css`                | Local Roboto font declarations.             |
| `@repo/design-system/styles.css`               | Compiled CSS.                               |
| `@repo/design-system/styles-strapi.json`       | Serialized CSS for Strapi admin injection.  |
| `@repo/design-system/ck-color-config.json`     | CKEditor color config.                      |
| `@repo/design-system/ck-fontSize-config.json`  | CKEditor font size config.                  |
| `@repo/design-system/tiptap-color-config.json` | TipTap color palette config.                |
| `@repo/design-system/tiptap-theme.css`         | TipTap theme CSS variables.                 |

## Editor Config Outputs

The package build copies local fonts, compiles Tailwind CSS, then generates editor-specific outputs:

```bash
node ./src/scripts/copy-fonts.mjs
tailwindcss -i ./src/styles.css -o ./dist/styles.css
node ./src/scripts/build-ck-config.js
node ./src/scripts/build-tiptap-config.js
```

`packages/design-system/src/scripts/build-ck-config.js` generates CKEditor color, font-size, and serialized style outputs.
`packages/design-system/src/scripts/build-tiptap-config.js` generates TipTap color options from the compiled CSS. It combines the static theme blocks in `styles/colors.css` and `styles/theme.css` into plain CSS variables on `:root`, with keyframes emitted separately.

For how those outputs are used in Strapi and the frontend, see [Rich Text Editors](/docs/design-system/rich-text-editors).

:::tip Rebuild After Token Changes
Next.js can pick up source CSS changes during local development, but Strapi editor outputs are generated files. Rebuild `@repo/design-system` and restart Strapi when editor colors, font sizes, or injected styles need to change.
:::

For the source layout, complete `dist` contents, development watcher, and application import paths, see [Source And Generated Files](/docs/reference/packages/design-system#source-and-generated-files).
