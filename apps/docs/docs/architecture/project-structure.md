---
sidebar_position: 3
sidebar_label: "Project Structure"
description: "Monorepo directory layout with descriptions of each app and package."
---

# Project Structure

pnpm monorepo managed by Turborepo with 3 apps, 8 packages, and a QA test suite.

## Top-Level Layout

```
strapi-next-monorepo-starter/
├── apps/                   # Deployable applications
│   ├── strapi/             # Strapi CMS backend
│   ├── ui/                 # Next.js frontend
│   └── docs/               # Docusaurus documentation site
├── packages/               # Shared libraries and config
├── qa/                     # Playwright test suites
├── scripts/                # Build/dev helper scripts
├── .github/                # CI/CD workflows and actions
├── pnpm-workspace.yaml     # Workspace: packages/*, apps/*, qa/**
├── turbo.json              # Turborepo task graph and env vars
├── package.json            # Root scripts and devDependencies
└── tsconfig.json           # Root tsconfig (references only)
```

## Apps

### apps/strapi -- Strapi CMS

Content backend providing REST API, content-type definitions, user authentication, and media storage.

```
apps/strapi/
├── config/
│   ├── database.ts         # SQLite (dev) / PostgreSQL (prod)
│   ├── plugins.ts          # Upload (local/S3), email, Sentry, config-sync
│   ├── middlewares.ts       # Strapi middleware stack
│   ├── cron-tasks.ts       # Scheduled tasks
│   └── env/production/     # Production overrides
├── src/
│   ├── api/                # Content-type APIs (one dir per type)
│   ├── components/         # Strapi component schemas (JSON)
│   ├── documentMiddlewares/# populateDynamicZone middleware
│   ├── populateDynamicZone/# Per-component populate configs (auto-discovered)
│   ├── lifeCycles/         # User/admin lifecycle hooks
│   └── utils/              # Breadcrumbs, fullPath hierarchy, constants
├── types/generated/        # Auto-generated TypeScript types (do not edit)
└── docker-compose.yml      # Local PostgreSQL via Docker
```

| Directory                  | Purpose                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/api/`                 | One directory per content type: `page`, `blog`, `author`, `navbar`, `footer`, `redirect`, `subscriber`, `internal-job`, `admin-panel-config`, `health` |
| `src/components/`          | Strapi component schemas organized by category: `elements/`, `forms/`, `sections/`, `seo-utilities/`, `utilities/`                                     |
| `src/documentMiddlewares/` | Intercepts Documents API requests to auto-populate dynamic zones                                                                                       |
| `src/populateDynamicZone/` | Per-component populate configs with filesystem auto-discovery via `index.ts`                                                                           |

### apps/ui -- Next.js Frontend

Server-side and statically rendered web application with App Router, page builder, and API proxy layer.

```
apps/ui/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx          # Root layout: navbar, footer, providers
│   │   │   ├── [[...rest]]/        # ISR catch-all (revalidate=300)
│   │   │   ├── dynamic/[[...rest]]/# SSR variant (searchParams)
│   │   │   └── auth/               # Auth pages
│   │   └── api/
│   │       ├── auth/[...all]/      # Better Auth handler
│   │       ├── public-proxy/       # Read-only Strapi proxy
│   │       ├── private-proxy/      # Authenticated Strapi proxy
│   │       ├── asset/              # Strapi media proxy
│   │       └── preview/            # Draft mode entry point
│   ├── components/
│   │   ├── page-builder/           # Component registry + all page sections
│   │   ├── layouts/                # StrapiPageView (dynamic zone renderer)
│   │   ├── elementary/             # Low-level UI primitives
│   │   └── providers/              # Client/Server context providers
│   ├── lib/
│   │   ├── auth.ts                 # Better Auth + Strapi plugins
│   │   ├── auth-client.ts          # CSR session access
│   │   ├── env-vars.ts             # Safe env var accessor
│   │   ├── proxies/                # Middleware pipeline stages
│   │   └── strapi-api/             # BaseStrapiClient + Public/Private clients
│   └── proxy.ts                    # Next.js middleware export
├── locales/                        # next-intl translations (cs.json, en.json)
└── next.config.mjs                 # Sentry, next-intl, image, output config
```

| Entry Point   | File                                            | Purpose                                                                          |
| ------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| Middleware    | `src/proxy.ts`                                  | Pipeline: basicAuth -> httpsRedirect -> authGuard -> dynamicRewrite -> intlProxy |
| Root layout   | `src/app/[locale]/layout.tsx`                   | Navbar, footer, providers, CSR env injection                                     |
| ISR pages     | `src/app/[locale]/[[...rest]]/page.tsx`         | All CMS-managed pages (static/ISR)                                               |
| Dynamic pages | `src/app/[locale]/dynamic/[[...rest]]/page.tsx` | Pages with searchParams (SSR)                                                    |
| Auth handler  | `src/app/api/auth/[...all]/route.ts`            | All `/api/auth/*` routes                                                         |

### apps/docs -- Docusaurus

Documentation site (this site). Built with Docusaurus 3.9, deployed to GitHub Pages.

## Packages

| Package                         | Purpose                                                    | Used By    |
| ------------------------------- | ---------------------------------------------------------- | ---------- |
| `@repo/design-system`           | Shared CSS/theme tokens                                    | UI         |
| `@repo/shared-data`             | Path utilities (`ROOT_PAGE_PATH`, `normalizePageFullPath`) | Strapi, UI |
| `@repo/strapi-types`            | Re-exports Strapi SDK types + generated content-type types | UI         |
| `@repo/eslint-config`           | Shared ESLint config presets                               | All apps   |
| `@repo/prettier-config`         | Shared Prettier config                                     | All apps   |
| `@repo/typescript-config`       | Shared tsconfig bases                                      | All apps   |
| `@repo/semantic-release-config` | Release tooling config                                     | CI         |
| `strapi-plugin-tiptap-editor`   | Custom Strapi rich text plugin (local dev)                 | Strapi     |

## QA

Playwright test suites in `qa/tests/playwright/`:

| Directory  | Purpose                              |
| ---------- | ------------------------------------ |
| `e2e/`     | End-to-end test specs                |
| `axe/`     | Accessibility tests (axe-core)       |
| `seo/`     | SEO audit tests                      |
| `visual/`  | Visual regression tests              |
| `perfo/`   | Lighthouse performance checks (LHCI) |
| `helpers/` | Shared test utilities                |

## Key File Locations

| Task                         | File                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a page-builder component | `apps/strapi/src/components/{category}/`, `apps/ui/src/components/page-builder/components/{category}/`, `apps/ui/src/components/page-builder/index.tsx` |
| Add a content type           | `apps/strapi/src/api/{type}/`, `apps/ui/src/lib/strapi-api/base.ts` (API_ENDPOINTS), `apps/ui/src/lib/strapi-api/content/server.ts`                     |
| Add an API route             | `apps/ui/src/app/api/{route}/route.ts`                                                                                                                  |
| Add an auth page             | `apps/ui/src/app/[locale]/auth/{page}/`, `apps/ui/src/lib/proxies/authGuard.ts`                                                                         |
| Configure env vars           | `apps/ui/src/env.mjs` (validation), `apps/ui/src/lib/env-vars.ts` (accessor)                                                                            |
| Add a populate config        | `apps/strapi/src/populateDynamicZone/{category}/{component}.ts`                                                                                         |
| Add a locale                 | `apps/ui/locales/{locale}.json`, `apps/ui/src/lib/navigation.ts`                                                                                        |
| Modify middleware            | `apps/ui/src/lib/proxies/`, `apps/ui/src/proxy.ts`                                                                                                      |

See [Architecture Overview](./architecture.md) for system diagrams and data flow.
