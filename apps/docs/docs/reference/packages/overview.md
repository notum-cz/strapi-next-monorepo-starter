---
sidebar_position: 1
slug: /reference/packages
---

# Packages

Shared workspace code lives in `packages`. Packages are wired through `pnpm-workspace.yaml` and run on Node `^24.0.0`.

## Active Packages

| Package                                                         | Role                                                       | Consumers                |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------ |
| [`@repo/shared-data`](./shared-data.md)                         | Runtime constants and path helpers shared by Strapi and UI | `apps/ui`, `apps/strapi` |
| [`@repo/logging`](./logging.md)                                 | Server-side structured logging (pino + OpenTelemetry)      | `apps/ui`, `apps/strapi` |
| [`@repo/design-system`](./design-system.md)                     | Tailwind theme, compiled CSS, editor style exports         | `apps/ui`, `apps/strapi` |
| [`@repo/strapi-types`](./strapi-types.md)                       | Strapi schema types and typed query helpers                | `apps/ui`                |
| [`@repo/eslint-config`](./eslint-config.md)                     | Shared flat ESLint config                                  | root ESLint config       |
| [`@repo/typescript-config`](./typescript-config.md)             | Shared `tsconfig` presets                                  | apps and packages        |
| [`@repo/semantic-release-config`](./semantic-release-config.md) | Shared semantic-release config                             | root release pipeline    |

Empty placeholders: `packages/prettier-config/` and `packages/strapi-plugin-tiptap-editor/`.

## Monorepo Plumbing

### `pnpm-workspace.yaml`

- Globs: `packages/*`, `apps/*`, `qa/**`.
- `minimumReleaseAge: 5760` makes pnpm reject dependency versions younger than four days.
- `allowBuilds` whitelists native build scripts such as `sharp`, `esbuild`, and `@parcel/watcher`.
- `overrides` pins shared dependency versions where needed.

### `turbo.json`

Turbo wires package builds into app workflows. Notable examples:

| Task         | Notes                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `dev`        | Depends on `@repo/shared-data#build` and `@repo/design-system#build`; persistent and uncached. |
| `build`      | Depends on upstream package builds and caches app/package outputs.                             |
| `sync-types` | Uncached, because it mirrors generated Strapi type files.                                      |

`globalEnv` lists environment variables that invalidate Turbo cache, including Strapi, auth, Sentry, app URL, and seed-related values.

### Git Hooks

`lefthook.yml` defines:

- `pre-commit`: branch name validation and staged-file linting.
- `commit-msg`: commitlint validation for Conventional Commits.

## Related Documentation

- [Features](../../getting-started/features.md) — stack and included capabilities
- [`@repo/strapi-types`](./strapi-types.md) — practical use and generated type workflow
- [Commands](../commands.md) — root and workspace scripts
