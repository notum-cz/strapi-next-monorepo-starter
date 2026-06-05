---
sidebar_position: 3
---

# Features

This starter is built around a Strapi-managed page builder and a typed Next.js UI. It gives teams a working foundation for content, rendering, auth, media, workflow, and docs before project-specific features begin.

## Stack

| App           | Stack                                                                   | Entry                                 |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| `apps/strapi` | Strapi 5, PostgreSQL through Docker or SQLite                           | `apps/strapi/src/index.ts`            |
| `apps/ui`     | Next.js 16 App Router, React 19, Better Auth, next-intl, TailwindCSS v4 | `apps/ui/src/app/[locale]/layout.tsx` |
| `apps/docs`   | Docusaurus 3                                                            | `apps/docs/docusaurus.config.ts`      |

Shared code lives in [`packages/*`](../reference/packages/overview.md).

## Content And Page Builder

- **Editable pages** — editors compose pages from Strapi dynamic-zone components.
- **Typed rendering** — React components receive typed Strapi component data through `@repo/strapi-types`.
- **Component registry** — Strapi component UIDs map to UI components in one predictable place.
- **Deep population** — small per-component populate configs are combined automatically.
- **Page hierarchy** — full paths, parent/child pages, breadcrumbs, and redirects are handled in Strapi.
- **Seed data** — baseline pages, navbar, footer, and demo content can be shared with the team.

## UI

- **App Router UI** — localized Next.js routes render Strapi-managed pages.
- **Strapi API clients** — typed server and browser-safe clients for public and private content.
- **Preview support** — editors can open draft or published content from Strapi.
- **Caching defaults** — Strapi responses cache, Next.js page cache and production ISR defaults.
- **Edge proxies** — controlled proxy routes expose selected Strapi endpoints to the browser.
- **SEO helpers** — metadata, sitemap, robots, canonical URLs, and structured data are generated from content.
- **Image handling** — Strapi media helpers and optional imgproxy support are included.
- **Operational tooling** — health checks, error boundaries, Sentry, log verbosity, and runtime env injection are documented.

## Strapi

- **Local database** — PostgreSQL runs through Docker for development.
- **Schema conventions** — content types, components, relations, lifecycle hooks, and document middlewares are documented.
- **Rich text editors** — CKEditor and Tiptap are preconfigured.
- **Upload providers** — local storage, Azure Blob Storage, and AWS S3 are supported.
- **Email providers** — Mailgun and Mailtrap are wired through Strapi provider config.
- **Preview** — Strapi preview is configured for draft/live editorial review.
- **Operational plugins** — Sentry, Config Sync, Users Permissions, cron jobs, and plugin setup have dedicated docs.

## Authentication

- **End-user auth** — Better Auth owns the session cookie in the UI.
- **Strapi JWT** — Users & Permissions issues the JWT used for per-user Strapi calls.
- **OAuth-ready** — social providers use the same Better Auth + Strapi bridge.
- **Admin SSO** — Strapi admin Microsoft SSO is documented separately from end-user auth.

## Development Workflow

- **Monorepo scripts** — Turbo runs app and package tasks from the root.
- **Shared packages** — design tokens, path helpers, generated Strapi types, lint config, TypeScript config, and release config live in `packages/*`.
- **Code quality** — ESLint, Prettier, Lefthook, Commitizen, and Conventional Commits are included.
- **Internationalization** — UI messages and Strapi content locales are documented together.
- **Testing and QA** — Vitest, Playwright, axe, visual tests, SEO checks, and Lighthouse CI are covered.
- **Deployment notes** — Docker build, Heroku, GitHub Actions, and environment variables have reference docs.

## Related Documentation

- [Page Builder](../page-builder/introduction.md)
- [UI Project Structure](../ui/project-structure.md)
- [Strapi Plugins](../strapi/plugins/overview.md)
- [Internationalization](../reference/internationalization.md)
- [Testing](../reference/testing.md)
- [Packages](../reference/packages/overview.md)
- [Deployment](../reference/deployment.md)
