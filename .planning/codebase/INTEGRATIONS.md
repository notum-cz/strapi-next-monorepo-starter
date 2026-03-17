# External Integrations

**Analysis Date:** 2026-03-17

## APIs & External Services

**Headless CMS:**

- Strapi 5 REST API — primary data source for all frontend content
  - SDK/Client: Custom `BaseStrapiClient` (`apps/ui/src/lib/strapi-api/base.ts`), `PublicStrapiClient` + `PrivateStrapiClient` (`apps/ui/src/lib/strapi-api/index.ts`)
  - Auth: `STRAPI_REST_READONLY_API_KEY`, `STRAPI_REST_CUSTOM_API_KEY` (server-side env vars)
  - Default cache revalidation: 60 seconds (production); 0 (development)
  - Max page size: 100 items

**Error Monitoring:**

- Sentry — error tracking for both Next.js (UI) and Strapi
  - SDK/Client UI: `@sentry/nextjs` 10.35.0; configured in `apps/ui/sentry.server.config.ts`, `apps/ui/sentry.client.config.ts`, `apps/ui/sentry.edge.config.ts`; registered via `apps/ui/src/instrumentation.ts`
  - SDK/Client Strapi: `@strapi/plugin-sentry` 5.36.0; configured in `apps/strapi/config/plugins.ts`
  - Auth UI: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `NEXT_PUBLIC_SENTRY_DSN`
  - Auth Strapi: `SENTRY_DSN` (only active in `NODE_ENV=production`)

**Bot Protection:**

- Google reCAPTCHA v3 — form submission protection
  - SDK/Client: `next-recaptcha-v3` 1.5.3 (client-side token generation); server-side verification at `apps/ui/src/lib/recaptcha.ts` via `https://www.google.com/recaptcha/api/siteverify`
  - Auth: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (client), `RECAPTCHA_SECRET_KEY` (server)
  - Score threshold: `>= 0.5`

**Maps:**

- Google Maps — embedded in Strapi admin content (CSP configured in `apps/strapi/config/middlewares.ts`)
  - Script source: `https://maps.googleapis.com`
  - Image sources: various `*.google.com`, `*.googleapis.com` domains

## Data Storage

**Databases:**

- PostgreSQL 16 (primary, production and development)
  - Connection: `DATABASE_URL` (connection string, highest priority) or individual vars: `DATABASE_HOST`, `DATABASE_PORT` (default: 5432), `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
  - Client: `pg` ^8.13.1 via Strapi's Knex-based ORM (`@strapi/database` 5.36.0)
  - SSL: optional via `DATABASE_SSL`, `DATABASE_SSL_*` vars
  - Pool: min 2, max 10 connections
  - Local dev: Docker via `apps/strapi/docker-compose.yml` (`postgres:16.0-alpine`)
- SQLite (fallback / testing only)
  - Connection: `DATABASE_FILENAME` (default: `.tmp/data.db`)
  - Set `DATABASE_CLIENT=sqlite` to activate

**File Storage:**

- AWS S3 (production, optional) — media/asset uploads for Strapi
  - SDK/Client: `@strapi/provider-upload-aws-s3` 5.36.0
  - Auth: `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_SECRET`, `AWS_REGION`, `AWS_BUCKET`
  - Optional CDN: `CDN_URL`, `CDN_ROOT_PATH`
  - ACL: `AWS_ACL` (default: `public-read`)
  - Signed URL expiry: `AWS_SIGNED_URL_EXPIRES` (default: 900 seconds)
  - Config in `apps/strapi/config/plugins.ts` `prepareAwsS3Config()`
  - Falls back to local filesystem if any AWS env var is missing (max 256MB per file)

**Caching:**

- Next.js Data Cache (`revalidate: 60`) — HTTP-level cache for Strapi API responses
- Turborepo build cache — task output caching (`.turbo/cache/`)
- Better Auth cookie cache — session caching via JWE cookies (30-day maxAge)

## Authentication & Identity

**Auth Provider:**

- Better Auth ^1.4.17 — stateless session management layer in the UI app
  - Implementation: `apps/ui/src/lib/auth.ts` (server) + `apps/ui/src/lib/auth-client.ts` (client)
  - Session strategy: JWE cookie cache (`cookieCache`, 30-day maxAge, `refreshCache: true`)
  - Custom plugins:
    - `strapiAuthPlugin` — credential sign-in/register/forgot-password/reset-password/update-password via Strapi endpoints
    - `strapiSessionPlugin` — validates Strapi JWT on every session access; blocks access if user is blocked in Strapi
    - `strapiOAuthPlugin` — syncs OAuth tokens with Strapi's OAuth callback endpoints
  - Auth: `BETTER_AUTH_SECRET` (server-side signing secret)
  - Base URL: `APP_PUBLIC_URL`
  - Routes exposed at `/api/auth/[...all]` (`apps/ui/src/app/api/auth/[...all]/route.ts`)

- Strapi Users & Permissions plugin — underlying user store and JWT issuance
  - JWT expiry: 30 days (synced with Better Auth session maxAge)
  - Auth: `JWT_SECRET`, `ADMIN_JWT_SECRET`
  - Supports credential auth and OAuth providers (GitHub, Google via Strapi's OAuth callback)

**Admin Auth:**

- Strapi admin panel JWT (`ADMIN_JWT_SECRET`, `API_TOKEN_SALT`)
- Optional `ADMIN_PANEL_CONFIG_API_AUTH_TOKEN` — runtime variable injection into admin panel

**Basic Auth (staging):**

- Optional HTTP Basic Auth middleware for staging environments
  - Config: `BASIC_AUTH_ENABLED`, `BASIC_AUTH_USERNAME`, `BASIC_AUTH_PASSWORD`
  - Implementation: `apps/ui/src/lib/proxies/basicAuth.ts`

## Monitoring & Observability

**Error Tracking:**

- Sentry — see APIs section above

**Logs:**

- Strapi: built-in Strapi logger middleware (`strapi::logger`)
- Next.js: `console.error` in `BaseStrapiClient` for API errors; `DEBUG_STRAPI_CLIENT_API_CALLS=true` enables verbose request logging
- Debug flags: `DEBUG_STATIC_PARAMS_GENERATION`, `SHOW_NON_BLOCKING_ERRORS`

## Email

**Production — Mailgun:**

- SDK/Client: `@strapi/provider-email-mailgun` 5.36.0
- Auth: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`
- Host: `MAILGUN_HOST` (default: `https://api.eu.mailgun.net`)
- From/Reply-To: `MAILGUN_EMAIL`

**Development/Testing — Mailtrap:**

- SDK/Client: `@strapi/provider-email-nodemailer` 5.36.0 (SMTP)
- Auth: `MAILTRAP_USER`, `MAILTRAP_PASS`
- Host: `MAILTRAP_HOST` (default: `sandbox.smtp.mailtrap.io`), port `MAILTRAP_PORT` (default: `2525`)

Config logic in `apps/strapi/config/plugins.ts` `prepareEmailConfig()` — Mailgun takes priority over Mailtrap.

## CI/CD & Deployment

**Hosting:**

- UI: Docker container (Next.js standalone) — `apps/ui/Dockerfile`
- Strapi: Docker container — `apps/strapi/Dockerfile`
- Docs: GitHub Pages — `.github/workflows/docs.yml`

**CI Pipeline:**

- GitHub Actions — `.github/workflows/ci.yml`
  - Triggers: PRs targeting `main` or `dev`
  - Steps: lint, format check, unit tests (excluding Strapi), UI build, Strapi build
  - Runner: `ubuntu-latest`, 10-minute timeout

**Release:**

- GitHub Actions — `.github/workflows/release.yml`
  - Triggers: push to `main`
  - Tool: `semantic-release` 24.2.0 with `@repo/semantic-release-config`
  - Git conventional commits enforced by `commitlint` + husky

**QA:**

- GitHub Actions — `.github/workflows/qa.yml`
  - Playwright E2E, visual, SEO, and accessibility (axe) test suites
  - Lighthouse CI performance checks

## Content Preview

**Strapi Draft Mode (Next.js):**

- Strapi preview feature enabled via `STRAPI_PREVIEW_ENABLED=true`
- Shared secret: `STRAPI_PREVIEW_SECRET`
- Preview endpoint: `{CLIENT_URL}/api/preview?url=...&locale=...&secret=...&status=...`
- Enabled content types: `api::page.page`
- Handler in `apps/strapi/config/admin.ts`
- Preview API route in `apps/ui/src/app/api/preview/route.ts`

## Webhooks & Callbacks

**Incoming (Strapi webhooks):**

- Strapi can fire webhooks on content events; `WEBHOOKS_POPULATE_RELATIONS` controls whether relation data is included (default: `false`)
- No custom incoming webhook endpoints detected in the UI app

**Outgoing:**

- None detected beyond Strapi's built-in webhook dispatch mechanism

## Internationalization

**next-intl 4.7.0:**

- Locale routing configured in `apps/ui/src/lib/navigation.ts` (routing config)
- Active locales visible in middleware matcher: `cs`, `en`
- Translation files in `apps/ui/locales/`
- Middleware: `apps/ui/src/proxy.ts` (wraps `next-intl` middleware with auth guard, basic auth, HTTPS redirect, dynamic rewrite)

## Environment Configuration

**Required env vars (Strapi):**

- `APP_KEYS` — session cookie signing keys (array)
- `API_TOKEN_SALT` — API token salt
- `ADMIN_JWT_SECRET` — admin panel JWT
- `JWT_SECRET` — users-permissions plugin JWT
- `DATABASE_CLIENT`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`

**Required env vars (UI):**

- `APP_PUBLIC_URL` — canonical frontend URL
- `STRAPI_URL` — Strapi server URL
- `STRAPI_REST_READONLY_API_KEY` — read-only API key for public content
- `BETTER_AUTH_SECRET` — session encryption secret
- `STRAPI_PREVIEW_SECRET` — preview mode shared secret

**Secrets location:**

- `apps/strapi/.env` (gitignored, generated from `.env.example`)
- `apps/ui/.env.local` (gitignored, generated from `.env.local.example`)
- CI secrets stored in GitHub Actions repository secrets

---

_Integration audit: 2026-03-17_
