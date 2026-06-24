---
name: add-locale
description: 'Use when adding a new language/locale to the application — e.g. "add language", "add locale", "new language", "new translation", "internationalization". Touches Strapi admin config, Next.js i18n routing, and translation files.'
---

# Add Locale

Add a new language/locale across both apps. For the full file map and how i18n is wired, see `apps/docs/docs/reference/internationalization.md`.

## Inputs

Ask the user for both, then validate before proceeding:

- **Locale code** — ISO 639-1, two lowercase letters (e.g. `de`, `fr`, `sk`). Reject uppercase or invalid codes.
- **Locale name** — capitalized, no special characters (e.g. `German`).

## Steps

1. **Translation catalog** — Copy `apps/ui/locales/en.json` to `apps/ui/locales/{code}.json`. Keep the keys identical; translate the values (or leave English and flag them for translation). Existing catalogs for reference: `en.json`, `cs.json`.

2. **Routing** — In `apps/ui/src/lib/navigation.ts`, add `{code}` to `routing.locales`, keeping the array alphabetical:

   ```ts
   locales: ["cs", "en", "{code}"],
   ```

   This is the only code change. The `[locale]` segment, `generateStaticParams`, the dynamic catalog import in `apps/ui/src/lib/i18n.ts`, and the `Locale` type (derived from `routing.locales` in `apps/ui/src/types/global.d.ts`) all pick up the new locale automatically.

3. **Strapi + content** — these are manual; tell the user:
   - Enable the locale: Strapi admin → Settings → Internationalization → Add new locale.
   - Translate localized content for each i18n-enabled content type, plus single types (Navbar, Footer) and any localized seed/demo content.

   See `apps/docs/docs/reference/internationalization.md` (Creating Localized Content) for details.
