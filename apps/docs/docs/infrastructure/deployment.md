---
sidebar_position: 3
sidebar_label: "Deployment"
description: "Docker setup for both apps, standalone output mode, and GitHub Actions CI/CD workflows."
---

# Deployment

The project uses Docker for production builds and GitHub Actions for CI/CD. Both apps have multi-stage Dockerfiles optimized for image size and build caching. All Docker builds must be run from the **repository root**.

## UI Dockerfile (`apps/ui/Dockerfile`)

Four-stage multi-stage build producing a standalone Next.js server.

### Stage 1: `base`

`node:22-slim` (Debian glibc). Enables pnpm 10.28.1 via corepack. Sets `WORKDIR /app`.

### Stage 2: `prepare`

Installs turbo 2.7.3 globally and copies the full repo. Materializes `packages/strapi-types/generated/` from symlink to real files — symlinks do not survive `turbo prune`:

```dockerfile
# apps/ui/Dockerfile (prepare stage)
RUN set -eux; \
  rm -rf "packages/strapi-types/generated"; \
  mkdir -p "packages/strapi-types/generated"; \
  cp -f apps/strapi/types/generated/*.d.ts "packages/strapi-types/generated/"
```

Runs `turbo prune @repo/ui --docker` to create a minimal dependency tree.

### Stage 3: `builder`

Installs pruned dependencies with a pnpm cache mount for faster rebuilds. Sets two required ENV values:

| Variable             | Value                | Why                                                    |
| -------------------- | -------------------- | ------------------------------------------------------ |
| `NEXT_OUTPUT`        | `standalone`         | Activates standalone output mode (see below)           |
| `BETTER_AUTH_SECRET` | `dummy-build-secret` | Required at build time; real value injected at runtime |

Accepts optional build-time ARGs:

| ARG                            | Purpose                                |
| ------------------------------ | -------------------------------------- |
| `APP_PUBLIC_URL`               | Public-facing app URL                  |
| `STRAPI_URL`                   | Strapi API URL                         |
| `STRAPI_REST_READONLY_API_KEY` | API key for read-only content fetching |

Runs `turbo run build`.

### Stage 4: `runner`

`node:22-alpine` (smaller runtime image). Creates non-root user `nextjs` (uid 1001). Copies only the production artifacts from builder:

- `apps/ui/.next/standalone/` — self-contained Node.js server
- `apps/ui/.next/static/` — static assets
- `apps/ui/public/` — public assets

Exposes port 3000. CMD: `node server.js`.

:::warning
Always build from the **repo root**, not from `apps/ui/`. The Dockerfile copies the full monorepo and uses turbo prune to isolate the UI workspace.
:::

:::tip
The build stages use Debian slim (`node:22-slim`) for glibc compatibility during compilation, while the runner stage uses Alpine (`node:22-alpine`) for a smaller runtime image — best of both worlds.
:::

## Standalone Output Mode

`NEXT_OUTPUT=standalone` is set as an `ENV` in the Dockerfile at build time. `next.config.mjs` reads `process.env.NEXT_OUTPUT` and sets `output: "standalone"` when that value is present.

Standalone mode bundles a self-contained Node.js server at `.next/standalone/server.js` — no `next start` needed. This produces a smaller deployment footprint because only the required dependencies are included. The runner stage copies this bundle alongside static and public assets.

## Strapi Dockerfile (`apps/strapi/Dockerfile`)

Four-stage multi-stage build for the Strapi CMS.

### Stage 1: `base`

`node:22-alpine`. Installs native build dependencies needed for sharp/vips image processing:

```bash
build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git
```

Sets up pnpm 10.28.1 via corepack. Sets `NODE_ENV=production`.

### Stage 2: `prepare`

Installs turbo 2.7.3. Copies the full repo. Runs `turbo prune @repo/strapi --docker`.

### Stage 3: `builder`

Installs turbo 2.7.3 and `node-gyp` globally for native addon compilation. **Temporarily** sets `NODE_ENV=development` for `pnpm install` so that devDependencies (TypeScript, Tailwind) are available for the build step. Runs `turbo run build`, then `pnpm prune --prod` to strip devDependencies from the final layer.

### Stage 4: `runner`

`node:22-alpine`. Installs only `vips-dev` (runtime dependency for image processing). Creates non-root user `strapi` (uid 1001). Copies the entire built app from builder. Exposes `${PORT:-1337}` (default 1337). CMD: `./node_modules/.bin/strapi start`.

:::tip
Key differences from the UI Dockerfile: all stages use Alpine (Strapi's native modules compile fine with musl), and the builder uses a `NODE_ENV=development` then `pnpm prune --prod` pattern to include devDependencies only during the build.
:::

## Docker Build Commands

```bash
# Build UI image (from repo root)
docker build -f apps/ui/Dockerfile -t ui:latest .

# Build UI with build-time env vars
docker build -f apps/ui/Dockerfile \
  --build-arg APP_PUBLIC_URL=https://example.com \
  --build-arg STRAPI_URL=https://api.example.com \
  -t ui:latest .

# Build Strapi image (from repo root)
docker build -f apps/strapi/Dockerfile -t strapi:latest .
```

:::warning
Do NOT pass `STRAPI_REST_READONLY_API_KEY` as a build arg in production — it will be baked into the image layer. Use runtime environment variables instead.
:::

## Local PostgreSQL (Docker Compose)

`apps/strapi/docker-compose.yml` runs PostgreSQL 16 for **local development only** — it does not containerize Strapi itself.

| Property   | Value                                    |
| ---------- | ---------------------------------------- |
| Image      | `postgres:16.0-alpine`                   |
| Platform   | `linux/amd64` (M1/M2 workaround)         |
| Env source | `.env` in `apps/strapi/`                 |
| Volume     | Named Docker volume for data persistence |
| Port       | `5432:5432`                              |

Environment variables read from `.env`: `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`.

```bash
# Start PostgreSQL only
pnpm run:db

# Start Strapi (auto-starts DB)
pnpm dev:strapi
```

See [Environment Variables](./environment-variables.md) for the full env var reference.

## GitHub Actions Workflows

| Workflow | File          | Trigger                       | Purpose                                               |
| -------- | ------------- | ----------------------------- | ----------------------------------------------------- |
| CI       | `ci.yml`      | PR to `main` or `dev`         | Lint, format check, unit tests, build both apps       |
| Release  | `release.yml` | Push to `main`                | Semantic release (changelog + GitHub release)         |
| QA       | `qa.yml`      | Manual dispatch               | E2E, accessibility, SEO, performance against live URL |
| Docs     | `docs.yml`    | Push to `main` (docs changes) | Build and deploy Docusaurus to GitHub Pages           |

### CI (`ci.yml`)

Runs on every pull request targeting `main` or `dev`. Cancels in-progress runs for the same branch. Timeout: 10 minutes.

**Steps:**

1. Checkout code
2. Setup pnpm with cache (`.github/actions/setup-pnpm`)
3. Copy `.env.example` files to `.env`
4. `pnpm lint` — ESLint
5. `pnpm format:check` — Prettier
6. `pnpm test:ci` — unit tests (excluding Strapi)
7. `pnpm build:ui` — Next.js build
8. `pnpm build:strapi` — Strapi build

### Release (`release.yml`)

Runs on push to `main`. Requires full git history (`fetch-depth: 0`) for semantic-release to analyze conventional commits.

**Permissions:** `contents: write`, `issues: write`, `pull-requests: write`, `id-token: write`.

**Command:** `pnpm exec semantic-release --extends @repo/semantic-release-config`

Generates a GitHub release and changelog when conventional commits indicate a version bump.

### QA (`qa.yml`)

Manual dispatch only (`workflow_dispatch`). Requires a `base_url` input and boolean flags for each suite.

**Inputs:**

| Input            | Type    | Default  | Description                                 |
| ---------------- | ------- | -------- | ------------------------------------------- |
| `run_e2e`        | boolean | `false`  | Run E2E Playwright tests                    |
| `run_axe`        | boolean | `false`  | Run accessibility tests                     |
| `run_seo`        | boolean | `false`  | Run SEO tests                               |
| `run_lhci_perfo` | boolean | `false`  | Run Lighthouse performance                  |
| `base_url`       | string  | required | URL to test against (must include protocol) |

**Jobs (each conditional on its input flag):**

| Job          | Command                                   | Timeout | Artifacts                          |
| ------------ | ----------------------------------------- | ------- | ---------------------------------- |
| `e2e`        | `pnpm tests:playwright:e2e:test`          | 30 min  | `playwright-report/` + `trace.zip` |
| `axe`        | `pnpm tests:playwright:axe`               | 15 min  | `axe/reports/` tarball             |
| `seo`        | `pnpm tests:playwright:seo --project=seo` | 30 min  | report + test-results tarball      |
| `lhci_perfo` | `pnpm tests:lhci:perfo`                   | 15 min  | `.lighthouseci/` tarball           |

Playwright browser install runs before e2e, axe, and seo jobs. Artifact retention: 7 days.

### Docs (`docs.yml`)

Two-job pipeline (build + deploy). Triggers on push to `main` when `apps/docs/**` or the workflow file itself changes. Also supports manual dispatch.

**Build job:** Uses `actions/configure-pages@v5` to set `DOCUSAURUS_URL` and `DOCUSAURUS_BASE_URL` from the GitHub Pages environment. Runs `pnpm --filter @repo/docs build`.

**Deploy job:** Depends on build. Uses `actions/deploy-pages@v4` to deploy to the `github-pages` environment.

**Concurrency:** Group `pages`, does not cancel in-progress deploys (lets them finish).
