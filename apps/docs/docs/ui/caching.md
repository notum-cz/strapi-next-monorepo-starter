---
sidebar_position: 6
---

# Caching

The UI uses Next.js fetch caching and ISR for public Strapi content. The goal is to keep pages fast in production while still making local development refresh on every request.

## Default Strapi Request Cache

Default fetch options live in [`apps/ui/src/lib/strapi-api/base.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/strapi-api/base.ts):

```ts
next: {
  revalidate: isDevelopment() ? 0 : 60
}
```

That means:

| Environment | Default                                                         |
| ----------- | --------------------------------------------------------------- |
| Development | `revalidate: 0`, effectively no cached Strapi responses         |
| Production  | `revalidate: 60`, Strapi responses can be reused for 60 seconds |

Callers can override this through `requestInit.next.revalidate`.

## ISR

ISR lets public pages serve cached output and refresh in the background. See [Rendering Modes](./rendering-modes.md) for route-level rendering and ISR configuration.

For dynamic routes where slugs are not known at build time:

```ts
export const dynamic = "force-static"
export const dynamicParams = true
export const revalidate = 300
```

Unknown slugs are generated on first request, cached, then revalidated.

## Dynamic Pages

Do not use static/ISR rendering for user-specific pages. Request-time APIs such as `cookies()`, `headers()`, and auth session reads force dynamic rendering and should be used for authenticated or personalized pages.

## React Compiler

React Compiler is enabled in [`apps/ui/next.config.mjs`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/next.config.mjs). Most component memoization is handled by the compiler, so add manual memoization only when there is a measured reason.

## Related Documentation

- [Rendering Modes](./rendering-modes.md)
- [Strapi API Client](./strapi-api-client.md)
- [Next.js ISR guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
