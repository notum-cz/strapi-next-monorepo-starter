# SEO

The UI generates SEO output at runtime from Strapi content and app config.

| Output                    | File                                                                                                                                                                               | Source                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Page `<head>` metadata    | [`src/lib/metadata/index.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/metadata/index.ts) `getMetadataFromStrapi`                        | Strapi page `seo` component and locale fallbacks                                 |
| Structured data (JSON-LD) | [`StrapiStructuredData`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/components/page-builder/components/seo-utilities/StrapiStructuredData.tsx) | Page `seo.structuredData`                                                        |
| `sitemap.xml`             | [`src/app/sitemap.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/app/sitemap.ts)                                                              | `fetchAll("api::page.page", ...)`. Production-only (`APP_ENV === "production"`). |
| `robots.txt`              | [`src/app/robots.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/app/robots.ts)                                                                | Static, production-only.                                                         |

To include more collections in the sitemap, extend `fetchAll` in `sitemap.ts` with additional UIDs.
