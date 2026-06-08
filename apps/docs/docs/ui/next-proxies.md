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

## Adding A Proxy

Create a focused proxy function in `apps/ui/src/lib/proxies`, then register it in `apps/ui/src/proxy.ts` in the correct order.
