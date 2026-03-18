---
sidebar_position: 1
sidebar_label: "Workspace Packages"
description: "Shared packages in the monorepo: design system, shared data, Strapi types, and tooling configurations."
---

# Workspace Packages

The monorepo contains six shared packages under `packages/`. Three application packages (design system, shared data, Strapi types) get full sections below. Three tooling configurations are summarized in a [quick-reference table](#tooling-configurations).

## Design System (`@repo/design-system`)

Tailwind v4 theme with CSS custom properties, compiled styles, and CKEditor config generation.

### Exports

| Export path                 | Resolved file                        | Description                                       |
| --------------------------- | ------------------------------------ | ------------------------------------------------- |
| `./styles.css`              | `dist/styles.css`                    | Compiled Tailwind CSS -- apps import this         |
| `./theme.css`               | `src/theme.css`                      | Raw theme CSS variables (direct import if needed) |
| `./custom-styles.css`       | `src/custom-styles.css`              | CKEditor custom styles                            |
| `./styles-strapi.json`      | `dist/styles-strapi.json`            | CSS string for Strapi CKEditor theme injection    |
| `./ck-color-config.json`    | `dist/ckeditor-color-config.json`    | CKEditor color palette config                     |
| `./ck-fontSize-config.json` | `dist/ckeditor-fontSize-config.json` | CKEditor font size config                         |

### How It Works

1. `@theme static` in `src/theme.css` defines all design tokens -- colors, fonts (`--font-sans: Roboto`), spacing, breakpoints, container widths, shadows, animations, and radii
2. Tailwind CLI compiles `src/styles.css` to `dist/styles.css`
3. Post-build, `build-ck-config.js` extracts CSS variables from the compiled output and generates the three CKEditor JSON configs (`ck-color-config.json`, `ck-fontSize-config.json`, `styles-strapi.json`)

### Usage

```css
/* apps/ui/src/app/globals.css */
@import "@repo/design-system/styles.css";
```

:::warning
The package declares `sideEffects: ["**/*.css"]` so bundlers do not tree-shake CSS imports. Do not remove this flag.
:::

### Extending the Theme

**Override a token:** Edit `packages/design-system/src/theme.css` inside the `@theme static { ... }` block.

```css
/* packages/design-system/src/theme.css */
@theme static {
  --font-sans: Roboto;
  /* Override a color token */
  --color-blue-500: oklch(0.623 0.214 259.815);
}
```

**Add a utility or component style:** Edit `packages/design-system/src/custom-styles.css`.

Then rebuild:

```bash
# From repo root
pnpm build
# Or watch mode from packages/design-system/
pnpm dev
```

### Dependencies

`tailwindcss ^4.1.4`, `@tailwindcss/cli ^4.1.4`, `class-variance-authority ^0.7.1`

## Shared Data (`@repo/shared-data`)

Constants and utility functions shared between apps. Built with `tsc` to `dist/`.

### Exports

| Export                                  | Type             | Description                                                                                                                                                        |
| --------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ROOT_PAGE_PATH`                        | `string` (`"/"`) | Canonical root path constant -- must match the root page `fullPath` value in Strapi                                                                                |
| `normalizePageFullPath(paths, locale?)` | `function`       | Joins Strapi page path segments into a normalized URL. Handles null/undefined entries, deduplicates slashes, and optionally prefixes a locale segment (idempotent) |

### Usage

```typescript
// apps/ui/src/lib/example.ts
import { normalizePageFullPath } from "@repo/shared-data"

const path = normalizePageFullPath(["/parent", "child"], "en")
// => "/en/parent/child"
```

### Adding New Exports

1. Add to `packages/shared-data/index.ts`
2. Run `pnpm build` from repo root
3. TypeScript consumers get updated `dist/index.d.ts` automatically on the next turbo run

## Strapi Types (`@repo/strapi-types`)

Typed Strapi document service helpers and re-exported generated content types. Private package (`"private": true`) -- types-only, no build needed (the `build` script is a no-op).

### Exports

| Export                                      | Source                            | Description                                                             |
| ------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| `Data`, `Modules`, `UID`                    | Re-exported from `@strapi/strapi` | Core Strapi type namespaces                                             |
| `ID`                                        | Alias for `Modules.Documents.ID`  | Document identifier type                                                |
| `FindMany<T>`, `FindFirst<T>`, `FindOne<T>` | Custom generics                   | Typed document service parameter types                                  |
| `Result<TSchemaUID, TParams>`               | Custom generic                    | Typed document result -- avoids importing directly from `@strapi/types` |
| Component and content type definitions      | `generated/*.d.ts`                | All generated Strapi schema types                                       |

### Usage

```typescript
// apps/ui/src/lib/example.ts
import type { Result, UID } from "@repo/strapi-types"

type PageResult = Result<"api::page.page", { populate: { seo: true } }>
```

### Generated Types Mechanism

The `generated/` directory contains `.d.ts` files copied from `apps/strapi/types/generated/` via the `sync-types` script (`cp -r`). In Docker builds, the `prepare` stage materializes these files because symlinks do not survive `turbo prune`.

:::tip
For the full type generation workflow -- when to regenerate, how the sync works, and Docker considerations -- see [Types Usage](../backend/types-usage.md).
:::

## Tooling Configurations

| Package                         | Purpose                                                                                                         | Usage                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `@repo/eslint-config`           | Shared ESLint flat config bundling 15+ plugins (unicorn, sonarjs, import-x, react, jsx-a11y, etc.)              | `import { prettierOptions } from "@repo/eslint-config/configs"` in root `eslint.config.mjs` |
| `@repo/typescript-config`       | Three TypeScript base configs: `base.json` (strict), `nextjs.json` (Next.js), `react-library.json` (React libs) | `{ "extends": "@repo/typescript-config/nextjs.json" }` in app `tsconfig.json`               |
| `@repo/semantic-release-config` | Semantic release config: `main` branch, commit-analyzer + release-notes + GitHub plugins                        | `pnpm exec semantic-release --extends @repo/semantic-release-config` in `release.yml`       |

:::tip
Prettier configuration is delivered through `@repo/eslint-config/configs`, not as a standalone package. The root `prettier.config.mjs` imports `prettierOptions` from the ESLint config package.
:::
