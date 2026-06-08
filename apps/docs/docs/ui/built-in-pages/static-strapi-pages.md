---
sidebar_position: 2
---

# Static Strapi Pages

Route: `/[[...rest]]`

File:

```txt
apps/ui/src/app/[locale]/[[...rest]]/page.tsx
```

This catch-all route renders Strapi-managed pages through the page builder. It resolves the current URL to a Strapi `page.fullPath`, fetches metadata and content, then renders `StrapiPageView`.

The route is configured for static rendering and ISR and suitable for public CMS pages that do not need `searchParams` at request time.

Related docs:

- [Caching](../caching.md)
- [Page Builder](../../page-builder/introduction.md)
- [Pages Hierarchy](../../page-builder/pages-hierarchy.md)
