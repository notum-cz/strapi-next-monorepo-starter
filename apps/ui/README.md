# 🔥 UI — `@repo/ui`

[Next.js v16](https://nextjs.org/docs) UI for the Strapi + Next.js Monorepo Starter.

Conceptual + feature docs live in [/apps/docs](../docs/docs). This README covers **setup and deployment** only.

- [Features](../docs/docs/getting-started/features.md) — stack and included capabilities
- [UI Features](../docs/docs/ui/ui-features.md) — overview of project layout, middleware, errors, Sentry, reCAPTCHA, SEO, logs
- [Environment Variables](../docs/docs/ui/environment-variables.md) — `.env.local`, API tokens, `env.mjs`, `getEnvVar()`
- [Docker Build](../docs/docs/ui/docker-build.md) · [Rendering Modes](../docs/docs/ui/rendering-modes.md)
- [Image Optimization](../docs/docs/ui/images.md) — `StrapiBasicImage`, `StaticImage`, imgproxy, `sizes`
- [Authentication](../docs/docs/auth/ui/authentication.md) · [Strapi API Client](../docs/docs/ui/strapi-api-client.md) · [Page Builder](../docs/docs/page-builder/introduction.md)

## 🥞 Stack

- Next.js 16 App Router · React 19 · TypeScript
- shadcn/ui · Tailwind v4 · Lucide
- Better Auth · next-intl · TanStack Query/Table · Zod · react-hook-form
- Sentry · dayjs · class-variance-authority

## 🚀 Get Up and Develop

### 1. Environment variables

Copy `.env.local.example` to `.env.local` and update values. Detailed behavior is documented in [Environment Variables](../docs/docs/ui/environment-variables.md).

Required for build-time pre-rendering (`generateStaticParams()`):

| Var                            | Purpose                                                        |
| ------------------------------ | -------------------------------------------------------------- |
| `STRAPI_URL`                   | Strapi base URL. Required at build if pre-rendering ISR pages. |
| `STRAPI_REST_READONLY_API_KEY` | Read-only Strapi API token (see below).                        |
| `APP_PUBLIC_URL`               | Used for canonical URLs and metadata.                          |

If ISR pages render at runtime only, these can be supplied at runtime instead. See [Docker Build](../docs/docs/ui/docker-build.md) and [Environment Variables](../docs/docs/ui/environment-variables.md) for details.

#### Read-only API token

Required for fetching public content from Strapi.

Open [Strapi admin → Settings → API Tokens](http://localhost:1337/admin/settings/api-tokens), then open the seeded **Read Only** token and click **Regenerate**.

Set value in `STRAPI_REST_READONLY_API_KEY`. **The regenerated token displays once.**

#### Custom API token

Required for non-GET requests (POST/PUT/DELETE). Permissions are scoped manually per content type.

Strapi admin → API Tokens → **Create new API token**:

```text
Name: any name
Token duration: Unlimited
Token type: Custom
Permissions: e.g. "Create subscriber"
```

Set value in `STRAPI_REST_CUSTOM_API_KEY`.

### 2. Run locally (with hot-reloading)

All commands from the **monorepo root**.

```bash
nvm use           # switch to Node 24
pnpm install
pnpm dev:ui       # Next.js only — or `pnpm dev` to start everything
```

App runs on [http://localhost:3000](http://localhost:3000).

## 🛠️ Production Docker

Docker build strategies are documented in [Docker Build](../docs/docs/ui/docker-build.md). See also [Rendering Modes](../docs/docs/ui/rendering-modes.md).

## 🧹 `removeThisWhenYouNeedMe`

A placeholder function at the top of starter routes/components logs a warning. Strip the call when the component is needed; remove the file entirely if not. Helps identify boilerplate left over during development.

## Health check

`GET /api/health` returns a small JSON for uptime probes. Route at [src/app/api/health/route.ts](src/app/api/health/route.ts).
