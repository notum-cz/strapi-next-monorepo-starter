---
sidebar_position: 11
---

# SEO

`getMetadataFromStrapi()` combines page SEO, global configuration, and technical defaults. Paths below are relative to `apps/ui/src`.

| Output        | Implementation                                                              |
| ------------- | --------------------------------------------------------------------------- |
| Page metadata | `lib/metadata/index.ts`                                                     |
| JSON-LD       | `components/page-builder/components/seo-utilities/StrapiStructuredData.tsx` |
| Sitemap       | `app/sitemap.ts`                                                            |
| Robots        | `app/robots.ts`                                                             |

## Configuration and fallbacks

The non-localized `SEO Configuration` single type (`/api/seo-configuration`) contains:

| Component             | Fields                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `globalMetadata`      | `openGraphConfiguration.siteName`, `twitterConfiguration` (`siteId`, `creator`, `creatorId`), `applicationName` |
| `robotsConfiguration` | Repeatable rules: `userAgent`, `allowPaths`, `disallowPaths`                                                    |

Create this configuration once for the site. `fetchGlobalMetadata()` and `fetchRobotsConfiguration()` load their respective components independently.

Page-level SEO controls titles, descriptions, images, `metaRobots`, and `structuredData`. Blank or whitespace-only SEO strings use fallbacks. For missing titles, the fallback order is social title → SEO title → page title. Missing titles, descriptions, images, global names, and account fields are omitted. Technical defaults are `website` for Open Graph, `summary` for Twitter, and `index, follow` for production page metadata. There are no SEO translation placeholders. The page-level `og.type` selects `website` or `article`. `seo.structuredData` is rendered separately as JSON-LD.

## Canonical URLs and hreflang

Canonical and Open Graph URLs use `APP_PUBLIC_URL`, the page path, and the locale. The default locale has no URL prefix.

Hreflangs use each published translation's own `fullPath`, include the current language, and add `x-default` when the default-language version exists. next-intl's automatic alternate Link headers are disabled to avoid advertising unverified translations.

## Sitemap

The sitemap lists published pages with public URLs and Strapi timestamps, excluding `noindex` variants and `none`. To support another pageable collection, extend `pageEntityUids` in `sitemap.ts` and `fetchAllPages()`.

Production and local development allow access. Other environments require `?allow-sitemap=yes` to bypass the `authSitemap` proxy's 404 response, but the generator still returns an empty list outside production/development. Missing `APP_PUBLIC_URL` also produces an empty sitemap.

## Robots

Production reads `robotsConfiguration`. Enter one path per line in `allowPaths` and `disallowPaths`; blank lines and surrounding whitespace are ignored. Missing or empty rules allow all crawlers. The sitemap URL is included when `APP_PUBLIC_URL` is configured.

Non-production and Basic Auth-protected environments return `Disallow: /` before fetching CMS rules. Page-level `metaRobots` is configured separately; `none` means `noindex, nofollow`.

## Migration notes

Before upgrading an existing deployment, preserve names and account identifiers from the removed page-level fields and enter them in SEO Configuration. Manual canonical and Open Graph URL overrides are replaced by generated URLs. The unused `keywords` field is removed.
