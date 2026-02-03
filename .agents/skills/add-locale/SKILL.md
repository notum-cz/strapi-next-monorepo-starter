---
name: add-locale
description: "Adds a new language/locale to the application. Involves Strapi admin config, Next.js i18n routing, and translation files. Triggers: add language, add locale, new language, new translation, internationalization."
---

Add a new language/locale to the application. Involves Strapi admin config, Next.js i18n routing, and translation files.

## Input Validation

Before proceeding, validate inputs:
- **Locale code**: must be valid ISO 639-1 (2 letters, lowercase, e.g. `de`, `fr`, `sk`). Reject uppercase or invalid codes.
- **Locale name**: capitalized, no special characters (e.g. `German`, `French`, `Slovak`).

If invalid format provided, ask user to correct before proceeding.

## Inputs

Ask the user for:
- **Locale code**: ISO 639-1 code (e.g. `de`, `fr`, `sk`)
- **Locale name**: human-readable name (e.g. `German`, `French`, `Slovak`)

## Steps

### 1. Create locale translation file

Copy `apps/ui/locales/en.json` to `apps/ui/locales/{locale}.json`.

The file structure must match `en.json` exactly — same keys, translated values. Initially copy as-is and mark values for translation.

Existing locales for reference: `en.json`, `cs.json`.

### 2. Update routing config

Edit `apps/ui/src/lib/navigation.ts`.

Add the new locale code to the `locales` array:

```typescript
export const routing = defineRouting({
  locales: ["cs", "en", "{locale}"],
  defaultLocale: "en",
  localePrefix: "as-needed",
})
```

Keep the array sorted alphabetically.

### 3. Update i18n config (if needed)

The i18n config at `apps/ui/src/lib/i18n.ts` uses dynamic imports and automatically picks up new locale files:

```typescript
messages: (
  await (locale === "en"
    ? import("../../locales/en.json")
    : import(`../../locales/${locale}.json`))
).default,
```

No changes needed unless you want HMR support for the new locale during development (currently only `en` has HMR via static import).

### 4. Manual steps (inform user)

After the automated steps complete, inform the user:

> The translation file and routing config are set up. You need to manually:
>
> 1. **Enable locale in Strapi**: Go to Settings > Internationalization > Add new locale > select {locale}
> 2. **Translate content**: For each content type with i18n enabled, switch to the new locale in Strapi admin and translate

## Notes

- The `[locale]` route segment in `apps/ui/src/app/[locale]/` handles locale routing automatically via `next-intl`
- `generateStaticParams` in the root layout iterates `routing.locales` — new locale pages are generated automatically
- The `localePrefix: "as-needed"` setting means the default locale (`en`) has no prefix, all others get `/{locale}/` prefix
