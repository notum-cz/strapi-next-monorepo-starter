# 🔥 UI — `@repo/ui`

[Next.js v16](https://nextjs.org/docs) frontend for the Strapi + Next.js Monorepo Starter.

Conceptual + feature docs live in [/apps/docs](../docs/docs). This README covers **setup and deployment** only.

- [Architecture](../docs/docs/architecture.md) — request lifecycle, proxies, draft mode, i18n
- [Frontend Features](../docs/docs/frontend/frontend-features.md) — project layout, shadcn, middleware proxies, Sentry, reCAPTCHA, logs
- [Image Optimization](../docs/docs/frontend/images.md) — `StrapiBasicImage`, `StaticImage`, imgproxy, `sizes`
- [Authentication](../docs/docs/auth/frontend/authentication.md) · [Strapi API Client](../docs/docs/content-system/strapi-api-client.md) · [Page Builder](../docs/docs/content-system/page-builder.md)

## 🥞 Stack

- Next.js 16 App Router · React 19 · TypeScript
- shadcn/ui · Tailwind v4 · Lucide
- Better Auth · next-intl · TanStack Query/Table · Zod · react-hook-form
- Sentry · dayjs · class-variance-authority

## 🚀 Get Up and Develop

### 1. Environment variables

Copy `.env.local.example` to `.env.local` and update values. **All variables are optional in [src/env.mjs](./src/env.mjs)** — the schema uses `@t3-oss/env-nextjs` and intentionally allows building without secrets baked in. Runtime code (`getEnvVar()` in [src/lib/env-vars.ts](./src/lib/env-vars.ts)) must check presence where it matters.

Required for build-time pre-rendering (`generateStaticParams()`):

| Var                            | Purpose                                                        |
| ------------------------------ | -------------------------------------------------------------- |
| `STRAPI_URL`                   | Strapi base URL. Required at build if pre-rendering ISR pages. |
| `STRAPI_REST_READONLY_API_KEY` | Read-only Strapi API token (see below).                        |
| `APP_PUBLIC_URL`               | Used for canonical URLs and metadata.                          |

If ISR pages render at runtime only, these can be supplied at runtime instead. See [Docker](#-production-docker) and [Architecture → Env Vars](../docs/docs/architecture.md#environment-variables) for the full list.

#### Read-only API token

Required for fetching public content from Strapi.

Strapi admin → [Settings → API Tokens](http://localhost:1337/admin/settings/api-tokens) → **Create new API token**:

```
Name: any name
Token duration: Unlimited
Token type: Read-only
```

Set value in `STRAPI_REST_READONLY_API_KEY`. **Token displays once.**

#### Custom API token

Required for non-GET requests (POST/PUT/DELETE). Permissions are scoped manually per content type.

Strapi admin → API Tokens → **Create new API token**:

```
Name: any name
Token duration: Unlimited
Token type: Custom
Permissions: e.g. "Create subscriber"
```

Set value in `STRAPI_REST_CUSTOM_API_KEY`.

`getEnvVar()` reads env vars on both server and client; always prefer it over `process.env` or direct `env` imports. See [Architecture → Env Vars](../docs/docs/architecture.md#environment-variables).

### 2. Run locally (with hot-reloading)

All commands from the **monorepo root**.

```bash
nvm use           # switch to Node 24
pnpm install
pnpm dev:ui       # Next.js only — or `pnpm dev` to start everything
```

App runs on [http://localhost:3000](http://localhost:3000).

## 🛠️ Production Docker

Builds Next.js in [`standalone`](https://nextjs.org/docs/app/api-reference/next-config-js/output) mode for minimal image size. Hardcoded in [Dockerfile](Dockerfile) via `NEXT_OUTPUT=standalone`.

:::warning
Turborepo requires root `package.json`, `pnpm-lock.yaml`, and `turbo.json`. Run `docker build` from the monorepo root, not from `apps/ui`.
[Reference](https://turbo.build/repo/docs/handbook/deploying-with-docker)
:::

### Build

Two strategies:

**A. Build once, deploy many** — no env vars at build time. ISR pages render entirely at runtime. Same image deploys to staging + prod.

```bash
# from monorepo root
docker build -t starter-ui:latest -f apps/ui/Dockerfile .
```

**B. Build per environment** — pre-renders pages depending on `STRAPI_URL` at build. Faster first request, but image is tied to one environment and **bakes the Strapi readonly API key into the image**.

```bash
docker build -t starter-ui:latest -f apps/ui/Dockerfile \
  --build-arg STRAPI_URL="http://host.docker.internal:1337" \
  --build-arg STRAPI_REST_READONLY_API_KEY="your-readonly-api-key" \
  --build-arg APP_PUBLIC_URL="http://localhost:3000" \
  --progress=plain \
  .
```

### Run

```bash
docker run -it --rm --name starter-ui -p 3000:3000 \
  --env-file apps/ui/.env.local starter-ui:latest
```

### Output modes

| Mode         | Use                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `standalone` | Self-hosting in Docker. **Default for this starter.**                                                                                                                          |
| `undefined`  | Default `.next` build. For `next start` or hosting providers (Vercel etc.).                                                                                                    |
| `export`     | Static HTML/CSS/JS. **Not supported out-of-box** — Better Auth, the POST [auth API route](src/app/api/auth/%5B...all%5D/route.ts), and other dynamic features must be removed. |

`pnpm build:ui:static` (from root) triggers `output: "export"` but will fail unless you've removed dynamic features. To validate static builds in CI, enable the relevant step in [ci.yml](../../.github/workflows/ci.yml).

### ISR (Incremental Static Regeneration)

ISR with time-based revalidation is enabled globally. Default revalidate: `60s` in production, `0` in development. Overridden per-request via [BaseStrapiClient](src/lib/strapi-api/base.ts) fetch options. See [Architecture → Caching](../docs/docs/architecture.md#caching).

For dynamic routes where slugs are not known at build time:

```ts
export const dynamic = "force-static"
export const dynamicParams = true
export const revalidate = 300
```

Unknown slugs are generated **once on first request**, cached, revalidated every 300s. Request-time APIs (`cookies()`, `headers()`, `auth`) are not allowed in this mode — they force fully dynamic rendering. Without [`cacheComponents`](https://nextjs.org/docs/app/getting-started/cache-components) enabled, touching them disables ISR.

Don't use this setup for user-specific pages.

[More on ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration).

## 🧹 `removeThisWhenYouNeedMe`

A placeholder function at the top of starter routes/components logs a warning. Strip the call when the component is needed; remove the file entirely if not. Helps identify boilerplate left over during development.

## Health check

`GET /api/health` returns a small JSON for uptime probes. Route at [src/app/api/health/route.ts](src/app/api/health/route.ts).
