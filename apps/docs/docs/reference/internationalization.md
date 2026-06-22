---
sidebar_position: 4
---

# Internationalization

Internationalization has two layers:

| Layer      | What                                               | Source                               |
| ---------- | -------------------------------------------------- | ------------------------------------ |
| UI strings | `next-intl` hardcoded JSON message catalogs        | `apps/ui/locales/*`                  |
| Content    | Strapi i18n plugin; locale forwarded as `?locale=` | fetching through Strapi API clientch |

## Localization

The UI is ready for localization through [`next-intl`](https://next-intl.dev/docs/getting-started/app-router). The starter keeps a basic App Router setup and extends it with typed message keys, typed locales, and locale-aware navigation helpers.

Relevant files:

| File                            | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `apps/ui/src/lib/i18n.ts`       | Request config that loads the active message catalog.            |
| `apps/ui/src/proxy.ts`          | Runs `next-intl` middleware after the app proxy chain.           |
| `apps/ui/next.config.mjs`       | Registers the `next-intl` plugin.                                |
| `apps/ui/locales`               | JSON message catalogs.                                           |
| `apps/ui/src/types/global.d.ts` | Augmented `next-intl` types for messages and locale unions.      |
| `apps/ui/src/lib/navigation.ts` | Locale-aware `Link`, `redirect`, `usePathname`, and `useRouter`. |

## Routing

Routing config is in `apps/ui/src/lib/navigation.ts`:

```ts
defineRouting({
  locales: ["cs", "en"],
  defaultLocale: "en",
  localePrefix: "as-needed",
})
```

`as-needed` strips the locale segment for the default locale. For example, `/about` is the default-locale URL, while `/cs/o-nas` keeps the locale prefix.

Navigation utilities are wrapped with `createNavigation()` so `Link`, `redirect`, `usePathname`, and `useRouter` understand the configured locale prefixes.

## Messages

Request config loads the matching JSON catalog in `apps/ui/src/lib/i18n.ts`. The default timezone is `Europe/Prague`.

Message keys are typed through `apps/ui/src/types/global.d.ts`, using `apps/ui/locales/en.json` as the source shape. This gives autocomplete for `useTranslations()` and `getTranslations()`.

The same augmentation also types `Locale` from `next-intl` to the configured locales in `routing.locales`, so app code can use `Locale` directly instead of defining a separate app-specific locale type.

`Formats` can also be added to the same augmentation when `useFormatter()` should be type-safe.

### Usage

Client components and non-async server components can use `useTranslations()`:

```tsx
import { useTranslations } from "next-intl"

export default function Page() {
  const t = useTranslations("general")

  return <div>{t("loading")}...</div>
}
```

Async server components can use `getTranslations()`:

```tsx
import { getTranslations } from "next-intl/server"

export default async function ProfilePage() {
  const user = await fetchUser()
  const t = await getTranslations("ProfilePage")

  return (
    <PageLayout title={t("title", { username: user.name })}>
      <UserDetails user={user} />
    </PageLayout>
  )
}
```

Use `Locale` from `next-intl` for route params and utility APIs:

```tsx
import type { Locale } from "next-intl"

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = (await params) as { locale: Locale }

  return <html lang={locale}>{children}</html>
}
```

## Content Locales

Strapi handles localized CMS content through the i18n plugin. Each localized document has one version per locale, while fields without `i18n.localized: true` are shared across locales.

When creating schemas, localizable fields need Strapi i18n plugin options:

```json
{
  "title": {
    "type": "string",
    "pluginOptions": {
      "i18n": { "localized": true }
    }
  },
  "internalCode": {
    "type": "string"
  }
}
```

In this example, `title` can be translated per locale and `internalCode` is shared. See [Strapi Schemas](../strapi/strapi-schemas.md) for schema rules.

### Creating Localized Content

In Strapi admin, create the entry in one locale first, then use the locale switcher in the content editor to create or edit another locale version of the same document.

For pages, each locale can have its own `slug`, `fullPath`, parent relation, SEO fields, and page-builder content. Keep this in mind when changing hierarchy: moving or renaming a page in one locale does not automatically make the same change in every other locale. See [Pages Hierarchy](../page-builder/pages-hierarchy.md).

Single types such as Navbar and Footer should also be filled for every enabled locale when the UI needs localized navigation or footer content.

### Fetching Localized Content

The UI receives the active locale from the `[locale]` route segment and uses `Locale` from `next-intl` across fetching utilities.

App-level Strapi fetches live in:

```txt
apps/ui/src/lib/strapi-api/content/server.ts
```

These helpers pass `locale` to `PublicStrapiClient`, for example:

```ts
export async function fetchPage(fullPath: string, locale: Locale) {
  return PublicStrapiClient.fetchOneByFullPath("api::page.page", fullPath, {
    locale,
    status: "published",
    populate: { seo: true, content: "smart" },
  })
}
```

`BaseStrapiClient` forwards the locale as the Strapi REST API `?locale=` query param. Page metadata, navigation, page-builder content, and single types should all be fetched with the active UI locale.

See [Strapi API Client](../ui/strapi-api-client.md) for the typed client API.

## Adding A Locale

Use the bundled `.claude/skills/add-locale` instructions. A locale change usually touches both apps:

- Strapi admin locale and i18n content setup
- UI routing locale list
- UI message catalogs
- localized seed/demo content

## Related Documentation

- [next-intl App Router docs](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl TypeScript workflow](https://next-intl.dev/docs/workflows/typescript)
