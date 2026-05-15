# Frontend Features

Reference for the operational features wired into `apps/ui` that are not directly part of content rendering: project layout, edge proxies, error tracking, anti-bot, debug flags.

For request/data flow see [Architecture](../architecture.md). For images see [Image Optimization](./images.md).

## Project Structure

| Path                                                                                                                                    | Purpose                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`src/app`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/app)                                         | App Router. Page-specific components belong under `src/app/<route>/_components`, not in shared folders. |
| [`src/components/elementary`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/components/elementary)     | Standalone primitives reusable anywhere.                                                                |
| [`src/components/forms`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/components/forms)               | Form wrappers, field types.                                                                             |
| [`src/components/page-builder`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/components/page-builder) | Strapi page-builder mapping. See [Page Builder](../content-system/page-builder.md).                     |
| [`src/components/providers`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/components/providers)       | Global context providers.                                                                               |
| [`src/components/typography`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/components/typography)     | Heading/paragraph/blockquote elements.                                                                  |
| [`src/components/ui`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/components/ui)                     | shadcn/ui wrappers around Radix. **Managed by shadcn CLI** — keep file/folder names intact.             |
| [`src/hooks`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/hooks)                                     | React hooks.                                                                                            |
| [`src/lib`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/lib)                                         | Auth, theme, i18n, dates, navigation, reCAPTCHA, styles.                                                |
| [`src/lib/metadata`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/lib/metadata)                       | Strapi SEO → Next.js `Metadata` helpers.                                                                |
| [`src/lib/strapi-api`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/lib/strapi-api)                   | Strapi clients + proxy helpers. See [Strapi API Client](../content-system/strapi-api-client.md).        |
| [`src/locales`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/locales)                                     | next-intl message catalogs.                                                                             |
| [`src/styles`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/styles)                                   | Global styles.                                                                                          |
| [`src/types`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/types)                                     | Type definitions.                                                                                       |

## shadcn/ui

Components are pre-installed in [`src/components/ui`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/components/ui). Add new ones via CLI:

```bash
pnpm dlx shadcn@latest add accordion
```

Config: [`components.json`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/components.json). Theme tokens live in [`src/styles/globals.css`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/styles/globals.css) and `@repo/design-system/theme.css`. Build a custom theme at [ui.shadcn.com/themes](https://ui.shadcn.com/themes) and export to `globals.css`.

**Class merging:** always use `cn()` from [`src/lib/styles.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/styles.ts):

```tsx
import { cn } from "@/lib/styles"

;<div className={cn("flex items-center", className)} />
```

## Edge Proxies (Next.js middleware)

The Next.js middleware lives in [`apps/ui/src/proxy.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/proxy.ts). It composes standalone proxy functions, each handling one concern. They run in sequence — the first to return a response short-circuits the chain.

| Proxy           | File                                                                                                                                | Trigger / Purpose                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Basic Auth      | [`basicAuth.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/proxies/basicAuth.ts)           | `BASIC_AUTH_ENABLED=true` — HTTP Basic Auth on every request. Used for staging gates.                      |
| HTTPS Redirect  | [`httpsRedirect.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/proxies/httpsRedirect.ts)   | Production only — redirects HTTP → HTTPS (e.g. behind Heroku).                                             |
| Auth Guard      | [`authGuard.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/proxies/authGuard.ts)           | Pages listed in `authPages` require an active Better Auth session — anonymous users redirected to sign-in. |
| Dynamic Rewrite | [`dynamicRewrite.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/proxies/dynamicRewrite.ts) | Requests with search params are rewritten to the `/dynamic/` route for SSR.                                |

To add a new proxy: drop a function in `src/lib/proxies/`, register it in `proxy.ts`, return `NextResponse` to halt the chain or `undefined` to fall through.

## Error Handling

Two layers:

| Layer                | File                                                                                                                                                                       | Catches                                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route-level boundary | [`src/app/[locale]/error.tsx`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/app/%5Blocale%5D/error.tsx)                                  | Rendering + lifecycle errors at the route segment. Next.js [error.tsx convention](https://nextjs.org/docs/app/building-your-application/routing/error-handling). |
| Component-level      | [`ErrorBoundary`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/components/elementary/ErrorBoundary.tsx) (`react-error-boundary` wrapper) | Smaller subtrees. Wraps every page-builder component by default so one bad CMS entry doesn't blank the page.                                                     |

Usage:

```tsx
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"

;<ErrorBoundary customErrorTitle="Uh-oh" showErrorMessage>
  <StrapiNavbar />
</ErrorBoundary>
```

Async errors and event-handler errors aren't caught — handle them with `try/catch` or React Query's `onError`.

## Sentry

Errors that bubble through `<ErrorBoundary />` or `error.tsx` are forwarded to Sentry automatically.

| Var                                                 | Required for                   | Notes                              |
| --------------------------------------------------- | ------------------------------ | ---------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`                            | enabling Sentry at runtime     | Without it the SDK is a no-op.     |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | source-map upload during build | Optional but recommended for prod. |

Config files: [`sentry.client.config.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/sentry.client.config.ts), [`sentry.server.config.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/sentry.server.config.ts), [`sentry.edge.config.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/sentry.edge.config.ts), [`src/instrumentation.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/instrumentation.ts), [`next.config.mjs`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/next.config.mjs).

## reCAPTCHA v3

Pre-configured in [`src/lib/recaptcha.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/recaptcha.ts). Requires:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
```

Wrap forms in `ReCaptchaProvider`, execute via `useReCaptcha`, validate server-side with `validateRecaptcha`:

```tsx
// Server action
import { validateRecaptcha } from "@/lib/recaptcha"

export const submitContactUsForm = async (payload: FormData) => {
  const token = payload.get("recaptchaToken")
  if (!(await validateRecaptcha(token))) throw new Error("Invalid reCAPTCHA")
}
```

```tsx
// Wrapper
import { ReCaptchaProvider } from "next-recaptcha-v3"
import { getEnvVar } from "@/lib/env-vars"

;<ReCaptchaProvider reCaptchaKey={getEnvVar("NEXT_PUBLIC_RECAPTCHA_SITE_KEY")}>
  <ContactUsForm />
</ReCaptchaProvider>
```

```tsx
// Form
import { useReCaptcha } from "next-recaptcha-v3"

const { executeRecaptcha } = useReCaptcha()
const token = await executeRecaptcha("submit_form")
```

## SEO Metadata, Sitemap, robots.txt

Generated at runtime, not stored statically:

| Output                    | File                                                                                                                                                                               | Source                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Page `<head>` metadata    | [`src/lib/metadata/index.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/metadata/index.ts) `getMetadataFromStrapi`                        | Strapi page `seo` component + locale fallbacks                                   |
| Structured data (JSON-LD) | [`StrapiStructuredData`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/components/page-builder/components/seo-utilities/StrapiStructuredData.tsx) | Page `seo.structuredData`                                                        |
| `sitemap.xml`             | [`src/app/sitemap.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/app/sitemap.ts)                                                              | `fetchAll("api::page.page", ...)`. Production-only (`APP_ENV === "production"`). |
| `robots.txt`              | [`src/app/robots.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/app/robots.ts)                                                                | Static, production-only.                                                         |

To include more collections in the sitemap, extend `fetchAll` in `sitemap.ts` with additional UIDs.

## Health Check

`GET /api/health` returns a small JSON payload for uptime probes. Route: [`src/app/api/health/route.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/app/api/health/route.ts).

## Log Verbosity Flags

All default to off. Enable per-environment in `.env.local`. Recommended **on** during development, **off** in production.

| Flag                             | Effect                                                                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEBUG_STATIC_PARAMS_GENERATION` | Logs the output of `generateStaticParams()` so missing/duplicate routes surface during build.                                                                                                 |
| `SHOW_NON_BLOCKING_ERRORS`       | Surfaces caught-but-ignored errors. Useful for `fetch` failures that return empty arrays via filters.                                                                                         |
| `DEBUG_STRAPI_CLIENT_API_CALLS`  | Logs every Strapi client request URL, errors, and stack trace from [`base.ts:79`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/strapi-api/base.ts#L79). |

Example output when `DEBUG_STRAPI_CLIENT_API_CALLS=true`:

```text
[BaseStrapiClient] Strapi API request error: {
  name: 'NotFoundError',
  message: 'Not Found',
  details: {},
  status: 404
}
```

Note: requests using `filters` return HTTP 200 with empty arrays — log flags do **not** surface those as errors. Handle empty results manually.

## CSR Env Injection

Defaults to off. Provides runtime injection of env vars into the client without `NEXT_PUBLIC_` prefix or build-time baking.

Mechanism: the root layout reads selected env vars on the server and injects them via `<script>` into `window.CSR_CONFIG`. `getEnvVar()` reads from `window.CSR_CONFIG` on the client. Configure the list via `CSR_ENVs` in [`src/app/[locale]/layout.tsx`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/app/%5Blocale%5D/layout.tsx).

Useful when one Docker image must serve multiple environments (staging vs prod) without rebuilding.

## Related Documentation

- [Architecture](../architecture.md) — request lifecycle, proxy routes, env-var table
- [Image Optimization](./images.md) — `StrapiBasicImage`, `StaticImage`, imgproxy
- [Authentication](../auth/authentication.md) — Better Auth + Strapi JWT
- [Strapi API Client](../content-system/strapi-api-client.md) — public/private client surface
