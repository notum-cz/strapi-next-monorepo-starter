---
sidebar_position: 1
sidebar_label: "Add a locale"
---

# Add a locale

Add German (`de`) as a new locale to the frontend and Strapi backend.

## Step 1: Create the translation file

1. Copy the English translation file to a new file named after the locale:

```bash
cp apps/ui/locales/en.json apps/ui/locales/de.json
```

2. Open `apps/ui/locales/de.json` and translate the values. Keep every key intact — only change the values. The file has these top-level sections:

```json title="apps/ui/locales/de.json"
{
  "seo": { ... },
  "general": { ... },
  "tables": { ... },
  "navbar": { ... },
  "comps": { ... },
  "errors": { ... },
  "contactForm": { ... },
  "auth": { ... }
}
```

3. You can leave placeholder English values initially. The important thing is that all keys from `en.json` exist in `de.json` so the app doesn't crash on missing translation keys.

## Step 2: Add the locale to the routing config

1. Open `apps/ui/src/lib/navigation.ts` and add `"de"` to the `locales` array inside `defineRouting()`:

```typescript title="apps/ui/src/lib/navigation.ts"
export const routing = defineRouting({
  locales: ["cs", "de", "en"],
  defaultLocale: "en",
  localePrefix: "as-needed",
})
```

2. Keep the array **alphabetically sorted** — `next-intl` behaviour is undefined if the order is inconsistent.

3. No other code changes are needed. The `generateStaticParams` call in the root layout reads from this array, so the new locale is picked up automatically.

For details on how the i18n system works, see the [i18n reference](../template/i18n).

## Step 3: Verify the i18n config needs no changes

Open `apps/ui/src/lib/i18n.ts`. The message loader uses a dynamic import that already handles every non-default locale:

```typescript title="apps/ui/src/lib/i18n.ts"
messages: (
  await (locale === "en"
    ? import("../../locales/en.json")
    : import(`../../locales/${locale}.json`))
).default,
```

No edit is needed. This step exists for transparency — when you see only two files changed, you might wonder whether `i18n.ts` needs updating. It does not.

## Step 4: Add the locale in Strapi admin

These steps happen in the Strapi admin panel and cannot be automated.

1. Open the Strapi admin and navigate to **Settings > Internationalization**.
2. Click **Add new locale** and select **German (de)**.
3. For each i18n-enabled content type (pages, navbar, footer), switch to the **de** locale in the content editor and add translated content.

:::warning
Until you add translated content in Strapi, pages in the new locale will return empty data from the API. The frontend handles this gracefully but pages will appear blank.
:::
