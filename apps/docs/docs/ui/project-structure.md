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
| `lib/logging`             | Server-side structured logging wrapper around `@repo/logging`. See [Logging](#logging).                                                     |
| `lib/metadata`            | Strapi SEO to Next.js `Metadata` helpers.                                                                                                   |
| `lib/proxies`             | Next.js request proxy functions, such as `basicAuth`, `dynamicRewrite`. See [Proxies](./next-proxies.md).                                   |
| `lib/strapi-api`          | Strapi clients, typed fetch helpers, and app-level content fetches in `content/server.ts`. See [Strapi API Client](./strapi-api-client.md). |
| `lib/telemetry`           | Pluggable telemetry provider registry (Azure Monitor, Sentry). See [Logging](#logging).                                                     |
| `styles`                  | Global styles.                                                                                                                              |
| `types`                   | Type definitions.                                                                                                                           |
| `../locales`              | next-intl message catalogs.                                                                                                                 |

## Strapi API

Shared Strapi client code lives in `lib/strapi-api`. The base clients are kept in `base.ts`, `public.ts`, and `private.ts`; request authorization helpers live in `request-auth.ts`.

App-level fetch functions should be grouped in `lib/strapi-api/content/server.ts` or `lib/strapi-api/content/client.ts` depending on where they run. This keeps route components focused on rendering and gives repeated Strapi queries one stable place to evolve.

## Logging

Server-side code logs through `lib/logging.ts`, a thin wrapper around the shared
[`@repo/logging`](../reference/packages/logging.md) package. Import `logger`,
`logError`, and `withSpan` from it instead of using `console.*`:

```ts
import { logger, logError } from "@/lib/logging"

logger.info("Preview enabled", { slug, locale })
```

Logs are structured, secret-redacting, and trace-correlated. Where they are
shipped (Azure Monitor, Sentry) is decided by the pluggable provider registry in
`lib/telemetry`, initialized from `src/instrumentation.ts`.

Use the logger in server code (including the `proxy.ts` middleware — Node
runtime in Next.js 16+) and in dual server/client modules such as the Strapi API
client. In the browser pino degrades to a `console` shim with no backend export,
so keep plain `console.*` in purely client-side or hot paths (component dev
warnings, small client helpers). See [Observability](../reference/integrations/logging.md)
for the full setup.

## shadcn/ui

The UI app ships with [shadcn/ui](https://ui.shadcn.com/) components. These files are generated and updated by the shadcn CLI, so keep their names and folder structure intact.

Add new components with:

```bash
pnpm dlx shadcn@latest add accordion
```

Config lives in `apps/ui/components.json`. Theme tokens live in `apps/ui/src/styles/globals.css` and `@repo/design-system/theme.css`.

For shared tokens and global styling rules, see [Tokens And Global Styles](/docs/design-system/tokens-and-global-styles). For reusable component variants and states, see [CMS And Components](/docs/design-system/cms-and-components).

Use `cn()` from `apps/ui/src/lib/styles.ts` when merging Tailwind classes:

```tsx
import { cn } from "@/lib/styles"

return <div className={cn("flex items-center", className)} />
```
