---
sidebar_position: 9
---

# Caching

The UI uses the Next.js [Data Cache](https://nextjs.org/docs/app/deep-dive/caching#data-cache) for Strapi fetches and the [Full Route Cache](https://nextjs.org/docs/app/deep-dive/caching#full-route-cache) for statically rendered public pages.

Official docs:

- [Next.js caching deep dive](https://nextjs.org/docs/app/deep-dive/caching)
- [Next.js ISR guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration)

## Default Strapi Request Cache

Default fetch options live in `apps/ui/src/lib/strapi-api/base.ts`.

| Environment | Default                                                                           |
| ----------- | --------------------------------------------------------------------------------- |
| Development | `revalidate: 0`; the Next dev server effectively disables cached Strapi responses |
| Production  | `revalidate: 60`, Strapi responses can be reused for 60 seconds                   |

Callers can override this through `requestInit.next.revalidate`.

## Full Route Cache And ISR

ISR lets public pages serve cached output and refresh in the background. The main Strapi page route is:

```txt
apps/ui/src/app/[locale]/[[...rest]]/page.tsx
```

This catch-all route renders individual Strapi pages by `fullPath`. Known paths can be generated during build; unknown paths can be generated on first request through `dynamicParams`. Each generated page is then cached and revalidated by ISR.

This route uses:

| Setting         | Purpose                                                                    |
| --------------- | -------------------------------------------------------------------------- |
| `force-static`  | Keeps the route eligible for the Full Route Cache and ISR.                 |
| `dynamicParams` | Allows paths not returned by `generateStaticParams()` to render on demand. |
| `revalidate`    | Sets the page regeneration interval to 300 seconds.                        |

:::warning CDN cache headers
The `revalidate` value also affects the HTTP cache headers emitted by Next.js. A CDN in front of the app reads those headers to decide how long it can reuse a cached response before checking for fresh content — so it inherits this route's freshness window. See [CDN](../reference/integrations/cdn) for how that works and the optional incident-time purge.
:::

The route uses `force-static` because the root layout includes request-time behavior from auth and the navbar. `force-static` keeps the public Strapi pages eligible for ISR even though those dynamic APIs exist higher in the tree.

:::tip Strict static routes
In an application without auth or request-aware navbar behavior, the stricter option is `export const dynamic = "error"` so accidental dynamic APIs fail during build.
:::

## On-Demand Revalidation

Beyond TTL-based ISR, Strapi invalidates cached content immediately when publishing via the revalidation pipeline: page/redirect paths through `revalidatePath`, and shared content (navbar, footer) through `revalidateTag`. Fetchers in `apps/ui/src/lib/strapi-api/content/server.ts` tag shared content with `strapi:api::<uid>` so a publish can target it precisely.

See [Cache Revalidation](../reference/cache-revalidation) for the full Strapi → UI flow, and [CDN](../reference/integrations/cdn) for optional CDN cache purging.

## Dynamic Pages

Pages that need query string values cannot use the static catch-all route because `searchParams` are only available at request time. The [Dynamic Rewrite proxy](./next-proxies.md#dynamic-rewrite) rewrites requests with search params to:

```txt
apps/ui/src/app/[locale]/dynamic/[[...rest]]/page.tsx
```

That route is `force-dynamic`, receives `searchParams`, and renders on every request. This keeps normal content pages cached while preserving runtime behavior for pages that depend on query params, filters, form state, tracking params, or other request-specific inputs.

Do not use static/ISR rendering for user-specific pages. Request-time APIs such as `cookies()`, `headers()`, and auth session reads force dynamic rendering and should be used for authenticated or personalized pages.

## Static Export

Next.js can generate a fully static site with [`output: "export"`](https://nextjs.org/docs/app/guides/static-exports). This starter can be reworked for static export, but it is not supported out of the box because the current app uses server-side features that need a Next.js runtime.

Static export requires these adjustments:

- Remove Better Auth and any route or layout behavior that depends on cookies, sessions, or request headers.
- Do not use Strapi preview or draft mode.
- Do not use Next proxy behavior such as Basic Auth, HTTPS redirects, auth guard, or dynamic search-param rewrites.
- Do not rely on ISR; content changes require a full rebuild and redeploy.
- Know every Strapi page path during build and return it from `generateStaticParams()`.
- Disable `dynamicParams: true`; unknown routes cannot be generated on first request.
- Avoid route handlers that need request-time values. Static `GET` route handlers are possible, but request-dependent handlers are not.
- Use an image strategy compatible with static export. Next's default image optimizer needs a server runtime.
- Avoid server actions and other dynamic server functions.

:::tip Prefer ISR for BIG CMS Sites
We usually find static export less practical than ISR for Strapi websites. When a site has thousands of pages, every content change can require rebuilding the whole frontend, which increases CI/CD time, memory usage, artifact size, and deployment risk.
:::

## Related Documentation

- [Strapi API Client](./strapi-api-client.md)
- [Proxies](./next-proxies.md)
- [Next Configuration](./next-config.md)
- [Next.js ISR guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
- [Next.js static export guide](https://nextjs.org/docs/app/guides/static-exports)
