---
sidebar_position: 1
sidebar_label: "Commands Reference"
description: "Available pnpm commands for development, building, testing, and deployment."
---

# Commands Reference

All commands use pnpm and run from the **repository root** unless noted otherwise. Turborepo orchestrates cross-package tasks -- dependencies, caching, and parallelism are handled automatically.

## Development

| Command           | What It Does                         | Notes                                                |
| ----------------- | ------------------------------------ | ---------------------------------------------------- |
| `pnpm dev`        | Start all apps via Turborepo         | Strapi needs Docker running                          |
| `pnpm dev:strapi` | Start Strapi (auto-starts Docker DB) | Runs `docker compose up -d db` then `strapi develop` |
| `pnpm dev:ui`     | Start Next.js                        | Requires Strapi running for content                  |
| `pnpm dev:docs`   | Start Docusaurus dev server          | Hot-reload at `localhost:3000`                       |

:::tip
Typical workflow: start Strapi first (`pnpm dev:strapi`), wait for it to be ready, then start UI in a separate terminal (`pnpm dev:ui`).
:::

:::warning
Docker Desktop must be running before `pnpm dev:strapi`. The command starts a PostgreSQL container via Docker Compose.
:::

## Build

| Command                | What It Does                | Notes                                                    |
| ---------------------- | --------------------------- | -------------------------------------------------------- |
| `pnpm build`           | Build all packages and apps | Turborepo resolves build order                           |
| `pnpm build:strapi`    | Build Strapi                |                                                          |
| `pnpm build:ui`        | Build Next.js               |                                                          |
| `pnpm build:ui:static` | Next.js static export       | Sets `NEXT_OUTPUT=export`, increases Node memory to 2 GB |
| `pnpm build:docs`      | Build Docusaurus site       | Output in `apps/docs/build/`                             |

:::note
The `NEXT_OUTPUT` env var controls the Next.js build output mode. Values: `standalone` (Docker), `export` (static), or omit for default (`next start`).
:::

## Production

| Command             | What It Does                     | Notes                              |
| ------------------- | -------------------------------- | ---------------------------------- |
| `pnpm start:strapi` | Start Strapi in production mode  | Requires prior `pnpm build:strapi` |
| `pnpm start:ui`     | Start Next.js in production mode | Requires prior `pnpm build:ui`     |

## Code Quality

| Command             | What It Does                                 | Notes                               |
| ------------------- | -------------------------------------------- | ----------------------------------- |
| `pnpm lint`         | ESLint across all packages                   | Via Turborepo                       |
| `pnpm lint:fix`     | ESLint with auto-fix                         |                                     |
| `pnpm format`       | Prettier format (md, css, scss)              |                                     |
| `pnpm format:check` | Check formatting without writing             | Used in CI                          |
| `pnpm typecheck`    | TypeScript type checking across all packages | Via Turborepo                       |
| `pnpm commit`       | Commitizen guided commit                     | Enforces conventional commit format |

## Testing

### Unit Tests

| Command            | What It Does                | Notes                      |
| ------------------ | --------------------------- | -------------------------- |
| `pnpm test`        | Run all unit tests          | Vitest across all packages |
| `pnpm test:ci`     | Unit tests excluding Strapi | Used in CI pipelines       |
| `pnpm test:strapi` | Strapi unit tests only      |                            |
| `pnpm test:ui`     | UI unit tests only          |                            |

### Integration and E2E Tests

| Command                                      | What It Does                   | Notes                   |
| -------------------------------------------- | ------------------------------ | ----------------------- |
| `pnpm tests:playwright:e2e:test`             | Playwright E2E tests           | Requires running apps   |
| `pnpm tests:playwright:e2e:test:interactive` | Playwright UI mode             | Interactive test runner |
| `pnpm tests:playwright:axe`                  | Accessibility tests (axe-core) |                         |
| `pnpm tests:playwright:seo`                  | SEO audit tests                |                         |
| `pnpm tests:playwright:visual`               | Visual regression tests        |                         |
| `pnpm tests:lhci:perfo`                      | Lighthouse performance checks  |                         |

## Strapi-Specific Commands

Run from `apps/strapi/`:

| Command               | What It Does                              | Notes                                    |
| --------------------- | ----------------------------------------- | ---------------------------------------- |
| `pnpm develop`        | Start Strapi dev server                   | Without Docker DB setup                  |
| `pnpm develop:watch`  | Start with admin panel rebuild on changes | Useful when editing admin customizations |
| `pnpm generate:types` | Regenerate TypeScript types               | Run after **any** schema change          |
| `pnpm run:db`         | Start Docker PostgreSQL only              | `docker compose up -d db`                |
| `pnpm export:all`     | Export all Strapi data                    | Unencrypted tar.gz                       |
| `pnpm export:content` | Export content only                       |                                          |
| `pnpm import`         | Import Strapi data                        | From `strapi-export.tar.gz`              |
| `pnpm config:dump`    | Dump Strapi config to JSON                | Outputs `dump.json`                      |
| `pnpm config:restore` | Restore Strapi config from JSON           | Reads `dump.json`                        |
| `pnpm transfer`       | Transfer data between Strapi instances    |                                          |

:::warning
Always run `generate:types` after schema changes. Forgetting causes silent type mismatches in the UI app -- the TypeScript compiler won't catch stale types from `@repo/strapi-types`.
:::

## Troubleshooting

| Problem                                 | Solution                                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| "Cannot connect to the Docker daemon"   | Start Docker Desktop                                                                               |
| "Module not found" after pulling        | Run `pnpm install` from repo root                                                                  |
| Port already in use                     | Kill the process on that port, or change `PORT` in the app's `.env`                                |
| Strapi types out of date                | `cd apps/strapi && pnpm generate:types`                                                            |
| UI shows no content after first install | Create an API token in Strapi admin and set `STRAPI_REST_READONLY_API_KEY` in `apps/ui/.env.local` |
