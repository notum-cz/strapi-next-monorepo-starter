---
sidebar_position: 3
---

# Features

This starter is built around a Strapi-managed page builder, reusable AI skills, and a typed Next.js UI. It gives teams a working foundation for content, rendering, auth, media, workflow, and docs before project-specific features begin.

## Stack

| App           | Stack                                                                   | Entry                                 |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| `apps/strapi` | Strapi 5, PostgreSQL through Docker or SQLite                           | `apps/strapi/src/index.ts`            |
| `apps/ui`     | Next.js 16 App Router, React 19, Better Auth, next-intl, TailwindCSS v4 | `apps/ui/src/app/[locale]/layout.tsx` |
| `apps/docs`   | Docusaurus 3                                                            | `apps/docs/docusaurus.config.ts`      |

Shared code lives in [`packages/*`](../reference/packages/overview.md).

## Content And Page Builder

- **[Editable pages](../page-builder/introduction.md)** — editors compose pages from Strapi dynamic-zone components.
- **[Typed rendering](../reference/packages/strapi-types.md)** — React components receive typed Strapi component data through `@repo/strapi-types`.
- **[Component registry](../page-builder/introduction.md)** — Strapi component UIDs map to UI components in one predictable place.
- **[Smart population](../page-builder/introduction.md)** — small per-component populate configs are combined automatically.
- **[Page hierarchy](../page-builder/pages-hierarchy.md)** — full paths, parent/child pages, breadcrumbs, and redirects are handled in Strapi.
- **[Seed data](../strapi/data-seeding.md)** — baseline pages, navbar, footer, and demo content can be shared with the team.
- **[Add content type workflow](./add-content-type.md)** — extend Strapi schemas, regenerate types, and render new data in the UI.

## UI

- **[App Router UI](../ui/project-structure.md)** — localized Next.js routes render Strapi-managed pages.
- **[Static and dynamic Strapi pages](../ui/built-in-pages/pages-overview.md)** — built-in routes cover static pages, dynamic Strapi pages, auth pages, and development overview pages.
- **[Strapi API clients](../ui/strapi-api-client.md)** — typed server and browser-safe clients fetch public and private content.
- **[Built-in API routes](../ui/built-in-api-routes/auth.md)** — route handlers cover auth, Strapi proxying, preview, assets, and health checks.
- **[Preview support](../ui/built-in-api-routes/preview.md)** — editors can open draft or published content from Strapi.
- **[Caching defaults](../ui/caching.md)** — Strapi responses cache, Next.js page cache, ISR, and static export tradeoffs are documented.
- **[Cache revalidation](../reference/cache-revalidation.md)** — Strapi publish/update/delete events can invalidate affected Next.js paths and shared data tags.
- **[CDN cache purge](../reference/integrations/cdn.md)** — optional operator-triggered CDN eviction is available for urgent cache updates.
- **[Next proxies](../ui/next-proxies.md)** — controlled proxy middleware handles locale redirects, HTTPS redirects, Strapi-defined redirects, basic auth, and auth guards.
- **[SEO helpers](../ui/seo.md)** — metadata, sitemap, robots, canonical URLs, and structured data are generated from content.
- **[Image handling](../ui/images.md)** — Strapi media helpers and optional imgproxy support are included.
- **[Environment variables](../ui/environment-variables.md)** — runtime config, CSR env injection, public variables, and debug flags are documented.
- **[Error handling](../ui/error-handling.md)** — React error boundaries and Sentry integration are covered.
- **[Next configuration](../ui/next-config.md)** — Next.js output modes, React Compiler, Sentry wrapping, and image configuration are documented.

## Strapi

- **[Local setup](../strapi/installation.md)** — PostgreSQL runs through Docker for development.
- **[Schema conventions](../strapi/strapi-schemas.md)** — content types, components, relations, lifecycle hooks, and document middlewares are documented.
- **[Generated Strapi types](../reference/packages/strapi-types.md)** — schema-generated types are shared with the UI.
- **[CMS redirects](../strapi/cms-redirects.md)** — editors manage `source` → `destination` redirects as content; the UI proxy applies them, and page moves create them automatically.
- **Rich text editors** — [CKEditor](../strapi/plugins/ckeditor.md) and [Tiptap](../strapi/plugins/tiptap-editor.md) editor integrations are documented.
- **[Upload providers](../strapi/plugins/upload-providers.md)** — local storage, Azure Blob Storage, and AWS S3 are supported.
- **[Email providers](../strapi/plugins/email-providers.md)** — Mailgun production email and Mailtrap development email are wired through Strapi provider config.
- **[Preview](../strapi/strapi-preview.md)** — Strapi preview is configured for draft/live editorial review.
- **[Users & Permissions](../strapi/plugins/users-permissions.md)** — Strapi end-user accounts and JWT behavior are documented.
- **[Config Sync](../strapi/plugins/config-sync.md)** — admin configuration can be exported and synchronized between environments.
- **[Cron jobs](../strapi/cron-jobs.md)** — scheduled work and multi-replica deployment concerns are documented.
- **[Docker build](../strapi/docker-build.md)** — container build guidance is available for Strapi deployments.

## Authentication

- **[End-user auth](../auth/ui/authentication.md)** — Better Auth owns the session cookie in the UI.
- **[Strapi JWT](../auth/ui/authentication.md)** — Users & Permissions issues the JWT used for per-user Strapi calls.
- **[OAuth providers](../auth/ui/oauth-providers.md)** — social providers use the same Better Auth + Strapi bridge.
- **[Admin SSO](../auth/strapi-admin/microsoft-sso.md)** — Strapi admin Microsoft SSO is documented separately from end-user auth.

## Development Workflow

- **[Monorepo scripts](../reference/commands.md)** — Turbo runs app and package tasks from the root.
- **[AI skills and workflows](../reference/AI/skills/overview.md)** — agent-ready skills cover common tasks such as starting work, adding page-builder sections, writing tests, reviewing changes, and opening PRs.
- **[Shared packages](../reference/packages/overview.md)** — design tokens, path helpers, generated Strapi types, lint config, TypeScript config, and release config live in `packages/*`.
- **[Code quality](../reference/workflow.md)** — ESLint, Prettier, Lefthook, Commitizen, and Conventional Commits are included.
- **[Internationalization](../reference/internationalization.md)** — UI messages and Strapi content locales are documented together.
- **[Testing and QA](../reference/testing/overview.md)** — Vitest, Playwright, axe, visual tests, SEO checks, and Lighthouse CI are covered.
- **[Deployment](../reference/deployment/overview.md)** — GitHub Actions, Heroku, Vercel, and Docker deployment notes are documented.
- **[Design system](../design-system/overview.md)** — shared tokens, typography, rich text styling, and CMS component design rules are documented.
- **Integrations** — [Observability](../reference/integrations/logging.md) (structured logging, Azure Monitor, Sentry), [reCAPTCHA](../reference/integrations/recaptcha.md), and [CDN / Azure Front Door](../reference/integrations/cdn.md) setup have dedicated reference pages.
