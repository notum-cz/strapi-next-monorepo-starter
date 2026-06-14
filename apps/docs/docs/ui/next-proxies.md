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
| 3     | Redirects       | `redirects.ts`      | Issues Strapi-defined source → destination redirects before the page renders.    |
| 4     | Auth Guard      | `authGuard.ts`      | Protects pages listed in `authPages`; anonymous users are redirected to sign-in. |
| 5     | Dynamic Rewrite | `dynamicRewrite.ts` | Rewrites requests with search params to the `/dynamic/` route for SSR.           |

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

## Redirects

`redirectsProxy` (`redirects.ts`) applies redirects authored in the Strapi **Redirect** collection (`source` → `destination`); see [CMS Redirects](../strapi/cms-redirects.md). It matches the incoming path against the published redirect list and issues the redirect before the page renders, so old URLs are honored without any per-page code.

The starter resolves these Strapi-defined redirects **in-app**, inside Next.js middleware. That is the right default for most sites, but for a larger website fronted by a programmable CDN it is not the best solution — see [Alternative: redirect at the CDN / edge](#alternative-redirect-at-the-cdn--edge).

How it works:

- It acts only on real navigations (`GET`/`HEAD`) and ignores Next.js link prefetches, so background prefetching never triggers a redirect lookup.
- The published redirect list is kept in memory for 2 minutes instead of being fetched from Strapi on every request. While that cache is fresh, lookups are instant; once it expires, the proxy keeps serving the last known list and refreshes in the background, so visitors never wait on Strapi. The one exception: if an expired cache has _no_ match for the requested path, the proxy refreshes and waits — the path might be a brand-new redirect that a fronting CDN has already started routing here, and serving a miss would let the CDN cache the wrong response.
- Because of that cache, a newly published redirect goes live within ~2 minutes (per running instance). Publishing in Strapi cannot clear this cache instantly — the proxy runs separately from the rest of the app — so the cache lifetime is the activation window. Lower `REDIRECTS_CACHE_TTL_MS` (`apps/ui/src/lib/redirects.ts`) for faster activation.

:::info Why a TTL instead of Strapi-triggered revalidation
The proxy is Next.js **middleware**, which runs in its own runtime — separate from the **server runtime** that renders pages and route handlers — and the redirect list lives as a plain in-memory value inside it. Next's on-demand revalidation (`revalidateTag` / `revalidatePath`, what the Strapi publish pipeline calls) only invalidates the server runtime's Data Cache and rendered routes. There is no API to reach into middleware memory, and middleware cannot subscribe to those revalidation events — so a publish refreshes pages but cannot clear this cache. A time-based TTL is the only invalidation the middleware has, and each running instance holds its own copy (hence "per instance").
:::

- Editor-entered `source` values are matched forgivingly: extra spaces, a missing leading slash, or a trailing slash are ignored, so small typos don't create dead redirects.
- Default-locale URLs match with or without the locale prefix, and the locale prefix is stripped from internal destinations so the visitor isn't redirected twice.
- Only same-origin destinations are followed; external URLs are ignored. The visitor's query string carries over unless the destination defines its own.
- If the lookup fails (for example, Strapi is down), the request simply renders normally — redirects never block the site.

:::info Temporary by design
CMS-managed redirects always respond with `307`. The Redirect collection has no permanent/301 option: a `308`/`301` is sticky in browser and crawler caches and cannot be purged once an editor fixes or removes the redirect, so a method-preserving temporary redirect is the only safe default for editor-managed content.
:::

### Alternative: redirect at the CDN / edge

This proxy resolves redirects inside the app runtime. A different approach is to push the redirect list to the **CDN or edge layer** and decide there — before the request ever reaches the app — using a small key-value lookup. Services that support this include Cloudflare Workers / Bulk Redirects, Vercel Edge Middleware, AWS CloudFront Functions or Lambda@Edge, Fastly Compute, Akamai EdgeWorkers, and Azure Front Door Rules.

It is an architectural fork worth deciding **early**, because it changes where redirect data lives and how it is deployed.

**Pros**

- Lowest latency: the redirect is issued at the network edge, closest to the visitor, with no round trip to the origin.
- Fully offloads the origin — redirected requests never spend app runtime or hit Strapi.
- Decides before any cache or render, so there is no stale-page-at-the-source-URL concern.

**Cons**

- Requires a sync pipeline to copy redirects from Strapi into the edge store (KV namespace, ruleset, or config push) on every publish — extra infrastructure and a new failure mode.
- Provider-specific configuration and lock-in; harder to reproduce and test in local development.
- Activation still has a delay, now governed by the edge deploy / KV propagation instead of a cache TTL.

The in-app proxy is the portable default: it works on any Node host with no extra infrastructure and keeps redirect logic beside the app. Prefer the edge approach when redirect volume or traffic makes origin offload worthwhile and you already operate a programmable CDN.

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
