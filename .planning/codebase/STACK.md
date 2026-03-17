# Technology Stack

**Analysis Date:** 2026-03-17

## Languages

**Primary:**

- TypeScript 5.x - All apps and packages (strict mode, `tsc --noEmit` typecheck)
- JavaScript (ESM) - Config files (`*.mjs`, `*.config.mjs`)

**Secondary:**

- CSS - Design system styles (`packages/design-system/src/styles.css`, `theme.css`)

## Runtime

**Environment:**

- Node.js 22 (LTS) — enforced via `.nvmrc` (value: `22`) and `package.json` `engines: "node": "^22.0.0"`

**Package Manager:**

- pnpm 10.28.1 — enforced via `preinstall: "npx only-allow pnpm"` and `corepack prepare pnpm@10.28.1`
- Lockfile: `pnpm-lock.yaml` (present, committed)

## Frameworks

**Backend CMS:**

- Strapi 5.36.0 (`apps/strapi`) — headless CMS, REST API, content management

**Frontend:**

- Next.js 16.1.5 (`apps/ui`) — App Router, React Server Components, supports `standalone` and `export` output modes
- React 19.2.4 (`apps/ui`)

**Documentation:**

- Docusaurus 3.9.0 (`apps/docs`) — static documentation site

**Testing — Unit:**

- Vitest 4.x — used in both `apps/ui` (runs `src/**/*.test.ts`) and `apps/strapi` (runs `tests/**/*.test.{js,ts}`)

**Testing — E2E / QA:**

- Playwright (`@playwright/test` ^1.53.2) — in `qa/tests/playwright`
- axe-core + `@axe-core/playwright` — accessibility testing
- `@lhci/cli` — Lighthouse CI performance checks

**Build Orchestration:**

- Turborepo 2.7.6 — monorepo task runner with caching; config in `turbo.json`

## Key Dependencies

**Critical (UI app):**

- `better-auth` ^1.4.17 — stateless session auth layer with custom Strapi plugins (`apps/ui/src/lib/auth.ts`, `auth-client.ts`)
- `next-intl` 4.7.0 — i18n routing and translations; middleware in `apps/ui/src/proxy.ts`
- `@sentry/nextjs` 10.35.0 — error monitoring, configured in `apps/ui/sentry.*.config.ts` + `instrumentation.ts`
- `@tanstack/react-query` ^5.90.20 — server/client state management
- `@tanstack/react-table` ^8.21.3 — table components
- `zod` ^4.3.6 — runtime validation used throughout (forms, env vars)
- `react-hook-form` ^7.71.1 + `@hookform/resolvers` — form management
- `@t3-oss/env-nextjs` ^0.13.10 — typed env validation (`apps/ui/src/env.mjs`)
- `@tiptap/core` ^3.19.0 (+ extensions) — rich text editor rendering
- `next-recaptcha-v3` 1.5.3 — Google reCAPTCHA v3 integration

**Critical (Strapi app):**

- `@strapi/strapi` 5.36.0 — core CMS framework
- `@strapi/plugin-users-permissions` 5.36.0 — user auth, JWT management
- `@strapi/provider-upload-aws-s3` 5.36.0 — S3 media uploads (optional, falls back to local)
- `@strapi/provider-email-mailgun` 5.36.0 — transactional email (production)
- `@strapi/provider-email-nodemailer` 5.36.0 — SMTP email (dev/testing via Mailtrap)
- `@strapi/plugin-sentry` 5.36.0 — Sentry error tracking in Strapi
- `@strapi/plugin-color-picker` 5.36.0 — color picker field
- `strapi-plugin-config-sync` 2.1.0 — sync Strapi config across environments
- `@_sh/strapi-plugin-ckeditor` ^6.0.2 — CKEditor 5 rich text in Strapi admin
- `@notum-cz/strapi-plugin-tiptap-editor` ^1.0.1 — Tiptap editor in Strapi admin
- `pg` ^8.13.1 — PostgreSQL client (primary DB driver)

**Infrastructure:**

- `sharp` 0.34.5 — image processing in Next.js
- `lodash` ^4.17.x — utility functions (both apps)
- `qs` ^6.14.1 — query string serialization for Strapi REST API calls

## Workspace Packages

Internal packages shared across apps:

| Package                         | Purpose                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `@repo/design-system`           | Tailwind CSS v4 styles + CKEditor color/font configs; built to `dist/styles.css` |
| `@repo/shared-data`             | Shared TypeScript data/constants compiled to `dist/`                             |
| `@repo/strapi-types`            | Auto-generated Strapi content type definitions; synced via `sync-types` script   |
| `@repo/eslint-config`           | Shared ESLint 9 flat config (unicorn, sonarjs, import-x, react, a11y, etc.)      |
| `@repo/typescript-config`       | Shared `tsconfig.json` base configs                                              |
| `@repo/prettier-config`         | Shared Prettier config                                                           |
| `@repo/semantic-release-config` | Shared semantic-release config for changelog/release automation                  |

## Configuration

**Environment:**

- `apps/ui/.env.local.example` — template for all UI env vars
- `apps/strapi/.env.example` — template for all Strapi env vars
- `turbo.json` `globalEnv` — declares all env vars that affect Turborepo task caching
- `apps/ui/src/env.mjs` — typed env validation using `@t3-oss/env-nextjs` + zod

**Linting/Formatting:**

- `eslint.config.mjs` (root) — ESLint 9 flat config, applied across all workspaces
- `prettier.config.mjs` (root) — Prettier 3.8.1 config (formats `.md`, `.css`, `.scss`, `*.package.json`)
- `commitlint.config.js` — conventional commits enforced via husky pre-commit hooks

**Build:**

- `apps/ui/next.config.mjs` — Next.js config with Sentry wrapper and next-intl plugin
- `packages/design-system/package.json` — Tailwind CLI build: `tailwindcss -i ./src/styles.css -o ./dist/styles.css`
- `apps/ui/Dockerfile` — multi-stage production Docker build (node:22-slim → node:22-alpine)
- `apps/strapi/docker-compose.yml` — PostgreSQL 16 local dev database only

## Platform Requirements

**Development:**

- Node.js 22, pnpm 10.28.1
- Docker (for local PostgreSQL via `pnpm dev:strapi` → `docker compose up -d db`)
- `.env.local` (UI) and `.env` (Strapi) files copied from `*.example` by `postinstall` script

**Production:**

- UI: Docker container (`node:22-alpine`, Next.js standalone output) or `next start`
- Strapi: Docker container (`apps/strapi/Dockerfile`) or direct Node.js server
- Database: PostgreSQL 16 (primary), SQLite supported for development/testing
- CI: GitHub Actions (`.github/workflows/ci.yml`) — Ubuntu latest, 10-minute timeout

---

_Stack analysis: 2026-03-17_
