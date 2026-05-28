---
sidebar_position: 4
---

# Internationalization

Internationalization has two layers:

| Layer      | What                                               | Source                                                                                                                                                                                                                                                          |
| ---------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI strings | `next-intl` JSON message catalogs                  | [`apps/ui/locales/en.json`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/locales/en.json), [`cs.json`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/locales/cs.json)                                |
| Content    | Strapi i18n plugin; locale forwarded as `?locale=` | [`config/plugins.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/plugins.ts), [`content/server.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/strapi-api/content/server.ts) |

## Routing

Routing config is in [`apps/ui/src/lib/navigation.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/navigation.ts):

```ts
defineRouting({
  locales: ["cs", "en"],
  defaultLocale: "en",
  localePrefix: "as-needed",
})
```

`as-needed` strips the locale segment for the default locale. For example, `/about` is the default-locale URL, while `/cs/o-nas` keeps the locale prefix.

## Messages

Request config loads the matching JSON catalog in [`apps/ui/src/lib/i18n.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/i18n.ts). The default timezone is `Europe/Prague`.

## Content Locales

Strapi content requests pass locale through API params. Page metadata, navigation, page-builder content, and single types should all be fetched with the active UI locale.

When creating schemas, localizable fields need Strapi i18n plugin options. See [Strapi Schemas](../strapi/strapi-schemas.md).

## Adding A Locale

Use the bundled [`add-locale`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/.agents/skills/add-locale) instructions. A locale change usually touches both apps:

- Strapi admin locale and i18n content setup
- UI routing locale list
- UI message catalogs
- localized seed/demo content

## Related Documentation

- [UI Environment Variables](../ui/environment-variables.md)
- [Data Seeding](../strapi/data-seeding.md)
- [Pages Hierarchy](../page-builder/pages-hierarchy.md)
