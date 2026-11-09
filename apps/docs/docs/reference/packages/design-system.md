---
sidebar_position: 3
---

# `@repo/design-system`

Shared Tailwind v4 design-system package. It contains tokens, typography utilities, editor styles, and local font assets, and builds the CSS and editor configuration files used by the UI and Strapi admin.

The package lives in:

```text
packages/design-system
```

## Source And Generated Files

```text
src/
  styles.css                  # Tailwind source entry point
  fonts.css                   # Shared local @font-face declarations
  fonts/                      # Roboto WOFF2 files and provenance
  styles/
    colors.css                # Color tokens and dark-mode overrides
    theme.css                 # Remaining design tokens
    typography.css            # Typography utilities and rich text typography
    shared.css                # Shared editor rules
  scripts/
    build-ck-config.js         # CKEditor asset generation
    build-tiptap-config.js     # TipTap asset generation
    copy-fonts.mjs             # Copies local fonts into dist/fonts
dist/
  fonts/                      # Copies of src/fonts
  styles.css
  ckeditor-color-config.json
  ckeditor-fontSize-config.json
  styles-strapi.json
  tiptap-color-config.json
  tiptap-theme.css
```

Run `pnpm --filter @repo/design-system build` to copy local fonts into `dist/fonts` and compile `src/styles.css` into `dist/styles.css`. The CKEditor and TipTap generators run sequentially after CSS compilation. Their paths resolve relative to each script, and all generated files stay in the package's `dist` directory.

Run `pnpm --filter @repo/design-system dev` to watch source styles and regenerate `dist/styles.css`. This watcher does not copy fonts or regenerate editor configuration. Run `pnpm --filter @repo/design-system build` after changing font files or editor tokens, and restart Strapi to reload its configuration. Applications import generated outputs, not the build scripts.

## Application Imports

- **Next.js:** `apps/ui/src/styles/globals.css` imports `@repo/design-system/source-styles.css`. This resolves to `src/styles.css`, so the app's Tailwind pipeline receives the shared tokens and custom utilities. The entry imports Tailwind, local font declarations, colors, theme, shared rules, and typography. The frontend loads Roboto through `next/font/local` using the same source files and attaches its variable to `<html>`. The shared `--font-sans` token uses that variable with a `"Roboto"` fallback for Strapi, following the AxiCom shared-theme pattern.
- **Strapi admin:** `apps/strapi/src/admin/app.tsx` imports `@repo/design-system/styles.css`, which resolves to compiled `dist/styles.css`.
- **CKEditor:** `apps/strapi/src/admin/ckeditor/configs.ts` imports the color and font-size JSON exports and `styles-strapi.json`. The latter contains serialized editor CSS without `@font-face` declarations. Font URLs are handled by the Strapi admin CSS import, so they can be rewritten by Vite.
- **TipTap:** `apps/strapi/config/plugins/tiptap.ts` imports the color JSON export and reads the generated `tiptap-theme.css` export when configuring the editor.

Turborepo builds the design system before application builds and development startup. The `source-styles.css` export provides the complete Tailwind source entry. The `theme.css`, `colors.css`, `typography.css`, `shared.css`, and `fonts.css` exports provide individual source files when needed. The `theme.css` export contains non-color tokens; use `colors.css` for color tokens and dark-mode overrides.

The former `custom-styles.css` export has been replaced by `typography.css` and `shared.css`. For the complete frontend setup, import `source-styles.css` as shown above.

Use the [**Design System docs**](/docs/design-system) as the primary source for token, style, typography, and editor guidance.
