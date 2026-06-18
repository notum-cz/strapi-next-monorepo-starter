---
sidebar_position: 3
---

# Dynamic Strapi Pages

Route: `/dynamic/[[...rest]]`

File:

```txt
apps/ui/src/app/[locale]/dynamic/[[...rest]]/page.tsx
```

This catch-all route renders the same Strapi page-builder content as the static route, but it is `force-dynamic` and receives `searchParams` at request time.

Requests normally reach this route through the [Dynamic Rewrite proxy](../next-proxies.md#dynamic-rewrite), which rewrites public page requests that include search params. This keeps ordinary CMS pages cached while allowing dynamic behavior for filtered pages, form state, tracking params, or other query-driven rendering.

Related docs:

- [Caching](../caching.md)
- [Proxies](../next-proxies.md)
- [Page Builder](../../page-builder/introduction.md)
