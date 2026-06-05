---
sidebar_position: 2
---

# Project Structure

The UI app follows the Next.js App Router layout. Page-specific code should stay close to the route that owns it; shared code lives under `src/components`, `src/lib`, or `src/hooks`.

Base path: `apps/ui/src`

| Path                      | Purpose                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `app`                     | App Router. Page-specific components belong under `app/<route>/_components`, not in shared folders.                                         |
| `components/elementary`   | Standalone primitives reusable anywhere, such as `Container`, `ErrorBoundary`.                                                              |
| `components/forms`        | Form wrappers and field types, such as `AppField`, `AppCheckbox`.                                                                           |
| `components/page-builder` | Strapi page-builder mapping, such as `StrapiBasicImage`, `StrapiHero`. See [Page Builder](../page-builder/introduction.md).                 |
| `components/providers`    | Global context providers, such as `ClientProviders`, `TrackingScripts`.                                                                     |
| `components/typography`   | Heading/paragraph/blockquote elements, such as `Typography`.                                                                                |
| `components/ui`           | shadcn/ui wrappers around Radix, such as `Button`, `Card`. Managed by shadcn CLI.                                                           |
| `hooks`                   | React hooks.                                                                                                                                |
| `lib`                     | Shared helpers such as auth, env vars, i18n, dates, navigation, reCAPTCHA, styles, etc.                                                     |
| `lib/metadata`            | Strapi SEO to Next.js `Metadata` helpers.                                                                                                   |
| `lib/proxies`             | Next.js request proxy functions, such as `basicAuth`, `dynamicRewrite`. See [Proxies](./next-proxies.md).                                   |
| `lib/strapi-api`          | Strapi clients, typed fetch helpers, and app-level content fetches in `content/server.ts`. See [Strapi API Client](./strapi-api-client.md). |
| `styles`                  | Global styles.                                                                                                                              |
| `types`                   | Type definitions.                                                                                                                           |
| `../locales`              | next-intl message catalogs.                                                                                                                 |

## Strapi API

Shared Strapi client code lives in `lib/strapi-api`. The base clients are kept in `base.ts`, `public.ts`, and `private.ts`; request authorization helpers live in `request-auth.ts`.

App-level fetch functions should be grouped in `lib/strapi-api/content/server.ts` or `lib/strapi-api/content/client.ts` depending on where they run. This keeps route components focused on rendering and gives repeated Strapi queries one stable place to evolve.

## shadcn/ui

The UI app ships with [shadcn/ui](https://ui.shadcn.com/) components. These files are generated and updated by the shadcn CLI, so keep their names and folder structure intact.

Add new components with:

```bash
pnpm dlx shadcn@latest add accordion
```

Config lives in `apps/ui/components.json`. Theme tokens live in `apps/ui/src/styles/globals.css` and `@repo/design-system/theme.css`.

Use `cn()` from `apps/ui/src/lib/styles.ts` when merging Tailwind classes:

```tsx
import { cn } from "@/lib/styles"

return <div className={cn("flex items-center", className)} />
```
