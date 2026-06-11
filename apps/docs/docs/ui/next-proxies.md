---
sidebar_position: 8
---

# Proxies

Next.js request proxy logic lives in:

```txt
apps/ui/src/proxy.ts
```

It composes small proxy functions from:

```txt
apps/ui/src/lib/proxies
```

Each proxy handles one concern and can either return a `NextResponse` to stop the chain or return `null` to let the next proxy run.

## Execution Order

`apps/ui/src/proxy.ts` runs proxies from `apps/ui/src/lib/proxies` in this order:

| Order | Proxy           | File                | Purpose                                                                          |
| ----- | --------------- | ------------------- | -------------------------------------------------------------------------------- |
| 1     | Basic Auth      | `basicAuth.ts`      | Enables HTTP Basic Auth for the whole app when `BASIC_AUTH_ENABLED=true`.        |
| 2     | HTTPS Redirect  | `httpsRedirect.ts`  | Redirects non-HTTPS requests to HTTPS outside local development.                 |
| 3     | Auth Guard      | `authGuard.ts`      | Protects pages listed in `authPages`; anonymous users are redirected to sign-in. |
| 4     | Dynamic Rewrite | `dynamicRewrite.ts` | Rewrites requests with search params to the `/dynamic/` route for SSR.           |

If none of these proxies handles the request, `next-intl` middleware handles locale routing.

Whichever response is chosen is then passed through `withSecurityHeaders` (`securityHeaders.ts`) before being returned, so **every** response — redirects, guarded routes, and rendered pages alike — carries the security headers.

## Basic Auth

`basicAuth` protects the whole app with HTTP Basic Auth when `BASIC_AUTH_ENABLED` is enabled.

Required values:

```env
BASIC_AUTH_ENABLED=true
BASIC_AUTH_USERNAME=
BASIC_AUTH_PASSWORD=
```

Use this for environments that should not be publicly accessible.

## HTTPS Redirect

`httpsRedirect` redirects non-HTTPS requests to HTTPS outside local development. It checks `x-forwarded-proto`, which is commonly set by platforms and reverse proxies such as Heroku.

Localhost and development mode are skipped.

## Auth Guard

`authGuard` protects routes listed in `authPages` inside `authGuard.ts`. It checks the server-side session and redirects unauthenticated users to sign-in with a `callbackUrl`.

Use this for route-level authentication before the request reaches the App Router page.

## Dynamic Rewrite

`dynamicRewrite` rewrites public page requests with search params to the dynamic route:

```txt
apps/ui/src/app/[locale]/dynamic/[[...rest]]/page.tsx
```

This is needed because the static catch-all page route cannot read `searchParams`. Requests without search params continue to the static/ISR page route:

```txt
apps/ui/src/app/[locale]/[[...rest]]/page.tsx
```

The proxy ignores `/api`, `/dev`, and `/auth`, and blocks direct access to the bare `/dynamic` path.

## Security Headers

Security headers are split by how they are computed:

- **Static headers** — set in `apps/ui/next.config.mjs` via `headers()` for every route, because they are build-time constants:

  | Header                      | Value                                          |
  | --------------------------- | ---------------------------------------------- |
  | `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
  | `X-Content-Type-Options`    | `nosniff`                                      |
  | `Referrer-Policy`           | `strict-origin-when-cross-origin`              |
  | `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`     |

- **Runtime headers** — set in `apps/ui/src/lib/proxies/securityHeaders.ts`, because they depend on request/runtime state:
  - `Content-Security-Policy` — its `frame-ancestors` is derived from the runtime `STRAPI_URL` (unavailable at build time, so it cannot live in `next.config`).
  - `X-Frame-Options: DENY` — sent only when framing is disallowed (modern browsers honor `frame-ancestors` and ignore `X-Frame-Options`).

### Content-Security-Policy

The baseline CSP is intentionally strict: it allows this app's own origin plus Strapi media over `https` (and the local Strapi origin in development). To allow a third-party service (analytics, tag manager, embeds, captcha), add its origin to the relevant directive in `buildCsp`. Commented examples for a Google Tag Manager / Analytics / Ads setup are left inline as a starting point.

### Preview Framing

By default `frame-ancestors` is `'none'`. After a valid `/api/preview` flow, the route sets `STRAPI_PREVIEW_FRAME_COOKIE` cookie; when present, `securityHeaders` widens `frame-ancestors` to include `STRAPI_URL` so the Strapi admin can iframe the previewed page (draft or published). Preview responses are also marked `Cache-Control: private, no-store` so a fronting CDN never serves a preview (which carries `STRAPI_URL`) to the public. With this, **public Strapi URL is hidden** from the public and only exposed in preview mode when needed. See [Preview support](../ui/built-in-api-routes/preview.md) for the full flow.

:::warning Configure the CDN to bypass cache for preview requests
`Cache-Control: private, no-store` is set by the app, but a shared CDN keys cache by URL and may ignore or not see it. If your deployment puts a CDN in front of the app (e.g. Azure Front Door), add a cache rule that **bypasses the cache whenever the preview cookie is present**. Without it, a previewer's request can be served a stale public copy (so drafts never show), or — worse — the preview response (which loosens `frame-ancestors` to expose `STRAPI_URL`) gets cached and served to the public, poisoning the shared cache. The rule ensures previewers always reach the origin and preview responses never enter the shared cache.
:::

## Adding A Proxy

Create a focused proxy function in `apps/ui/src/lib/proxies`, then register it in `apps/ui/src/proxy.ts` in the correct order.
