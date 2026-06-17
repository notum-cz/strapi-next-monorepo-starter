---
sidebar_position: 11
---

# SEO

The UI generates SEO output at runtime from Strapi content and app config.

Base path: `apps/ui/src`

| Output                    | File                                                 |
| ------------------------- | ---------------------------------------------------- |
| Page `<head>` metadata    | `lib/metadata/index.ts`                              |
| Structured data (JSON-LD) | `components/page-builder/components/seo-utilities/*` |
| `sitemap.xml`             | `app/sitemap.ts`                                     |
| `robots.txt`              | `app/robots.ts`                                      |

## SEO

Page metadata is generated with `getMetadataFromStrapi()`. The static and dynamic Strapi page routes call it from `generateMetadata()`, resolve the current route to a Strapi `fullPath`, and build Next.js metadata from the page `seo` component.

`seo` is an attribute/component on the Strapi page content type. Content editors fill these fields in Strapi, and the UI maps them to Next.js metadata.

![Strapi page SEO component](/img/seo-strapi-component.png)

The helper merges Strapi values with locale-aware defaults, including title, description, robots settings, canonical URL, Open Graph, and Twitter metadata.

Structured data is rendered separately as JSON-LD by `StrapiStructuredData` from the page `seo.structuredData` field.

## Sitemap

`app/sitemap.ts` generates `sitemap.xml` from Strapi pages. It fetches all published page entries per locale with `fetchAllPages()`, converts each `fullPath` to a public URL, and uses Strapi timestamps for `lastModified`.

To include more pageable collections in the sitemap, add their UIDs to `pageEntityUids` in `sitemap.ts` and make sure `fetchAllPages()` supports them.

The sitemap returns an empty list when the app is not production or development, or when `APP_PUBLIC_URL` is not configured.

### Access

Access to `/sitemap.xml` is gated by the `authSitemap` proxy in `lib/proxies/authSitemap.ts`, wired into the middleware chain in `proxy.ts`:

- In **production** and **local development** the sitemap is unrestricted (so search engines can crawl it, and it stays easy to inspect locally).
- In **non-production deployments** (e.g. staging/preview) the request must include the `?allow-sitemap=yes` query parameter; otherwise it returns `404`. This keeps those sitemaps out of search indexes while still allowing on-demand inspection.

The proxy requires no environment variables. Note that `/sitemap.xml` is listed explicitly in the middleware `matcher` so the proxy runs for it.

## Robots

`app/robots.ts` generates `robots.txt`.

Production allows all crawlers and includes the sitemap URL when `APP_PUBLIC_URL` is configured. Non-production environments disallow all crawlers so testing and staging deployments are not indexed.
