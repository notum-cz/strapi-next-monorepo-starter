# Codebase Structure

**Analysis Date:** 2026-03-17

## Directory Layout

```
strapi-next-monorepo-starter/
├── apps/
│   ├── strapi/                  # Strapi CMS backend
│   ├── ui/                      # Next.js frontend
│   └── docs/                    # Docusaurus documentation site
├── packages/
│   ├── design-system/           # Shared CSS/theme tokens
│   ├── eslint-config/           # Shared ESLint config
│   ├── prettier-config/         # Shared Prettier config
│   ├── semantic-release-config/ # Release tooling
│   ├── shared-data/             # Path utilities shared between Strapi and UI
│   ├── strapi-plugin-tiptap-editor/ # Custom Strapi plugin (local dev)
│   ├── strapi-types/            # Re-exports Strapi SDK types + generated types
│   └── typescript-config/       # Shared tsconfig bases
├── qa/
│   └── tests/playwright/        # Playwright E2E, SEO, visual, axe, perf tests
├── scripts/
│   └── utils/                   # Build/dev helper scripts
├── .agents/
│   └── skills/                  # Agent task skill definitions
├── .github/
│   ├── workflows/               # CI/CD GitHub Actions
│   └── actions/setup-pnpm/      # Reusable pnpm setup action
├── pnpm-workspace.yaml          # Workspace: packages/*, apps/*, qa/**
├── turbo.json                   # Turborepo task graph and env vars
├── package.json                 # Root scripts and devDependencies
└── tsconfig.json                # Root tsconfig (references only)
```

---

## apps/strapi — Strapi CMS

```
apps/strapi/
├── config/
│   ├── api.ts                   # Strapi API config (rate limits, REST response settings)
│   ├── admin.ts                 # Admin panel config
│   ├── database.ts              # Database connection (SQLite dev / Postgres prod)
│   ├── middlewares.ts           # Strapi middleware stack
│   ├── plugins.ts               # Plugin config: upload (local/S3), email, sentry, config-sync
│   ├── server.ts                # Server port/host config
│   ├── cron-tasks.ts            # Scheduled tasks
│   └── env/production/          # Production overrides for database and server
├── database/
│   └── migrations/              # Knex DB migration files
├── src/
│   ├── admin/
│   │   ├── ckeditor/            # CKEditor customization for Strapi admin
│   │   └── extensions/
│   │       └── InternalJobs/    # Custom Strapi admin panel extension
│   ├── api/                     # Content-type APIs (one dir per type)
│   │   ├── page/                # Page collection type (core CMS entity)
│   │   ├── blog/                # Blog collection type
│   │   ├── author/              # Author collection type
│   │   ├── navbar/              # Navbar single type
│   │   ├── footer/              # Footer single type
│   │   ├── redirect/            # Redirect rules collection type
│   │   ├── subscriber/          # Newsletter subscriber collection type
│   │   ├── internal-job/        # Internal job posting collection type
│   │   ├── admin-panel-config/  # Admin panel configuration single type
│   │   └── health/              # Health check endpoint
│   ├── components/              # Strapi component schemas (JSON)
│   │   ├── elements/            # Atomic UI element components
│   │   ├── forms/               # Form component schemas
│   │   ├── sections/            # Page section component schemas
│   │   ├── seo-utilities/       # SEO component schemas
│   │   └── utilities/           # Utility component schemas (links, images, rich text)
│   ├── documentMiddlewares/
│   │   ├── page.ts              # Registers populateDynamicZone middleware
│   │   └── helpers.ts           # Middleware helpers for component introspection
│   ├── extensions/
│   │   └── email/               # Email plugin extension/documentation
│   ├── lifeCycles/
│   │   ├── user.ts              # Sends activation email after user creation
│   │   └── adminUser.ts         # Admin user lifecycle hooks
│   ├── populateDynamicZone/     # Per-component populate configs (auto-discovered)
│   │   ├── index.ts             # Filesystem scanner that builds populate config map
│   │   ├── forms/               # Populate configs for form components
│   │   ├── sections/            # Populate configs for section components
│   │   └── utilities/           # Populate configs for utility components
│   └── utils/
│       ├── breadcrumbs.ts       # Breadcrumb generation from page hierarchy
│       ├── constants.ts         # Shared constants
│       └── hierarchy/           # fullPath computation for parent/child pages
├── types/
│   └── generated/               # Strapi auto-generated TypeScript types (do not edit)
└── tests/
    └── helpers/                 # Test helpers for Strapi integration tests
```

---

## apps/ui — Next.js Frontend

```
apps/ui/
├── src/
│   ├── app/
│   │   ├── [locale]/            # i18n root layout — all user-facing pages live here
│   │   │   ├── layout.tsx       # Root layout: navbar, footer, providers, CSR env injection
│   │   │   ├── [[...rest]]/     # ISR/static catch-all for all CMS pages (revalidate=300)
│   │   │   ├── dynamic/[[...rest]]/  # Force-dynamic (SSR) variant for pages with searchParams
│   │   │   ├── auth/            # Auth pages: signin, register, forgot-password, etc.
│   │   │   ├── dev/             # Development-only pages (component/page overviews)
│   │   │   ├── error.tsx        # Route-level error boundary
│   │   │   └── not-found.tsx    # 404 page
│   │   └── api/
│   │       ├── auth/[...all]/   # Better Auth handler (all /api/auth/* routes)
│   │       ├── public-proxy/[...slug]/  # Proxy: public Strapi calls with read-only token
│   │       ├── private-proxy/[...slug]/ # Proxy: authenticated Strapi calls with user JWT
│   │       ├── asset/[...slug]/ # Proxy: Strapi uploads/static assets
│   │       ├── preview/         # Strapi draft mode preview entry point
│   │       └── health/          # Next.js health check endpoint
│   ├── components/
│   │   ├── elementary/          # Low-level UI primitives (Breadcrumbs, Container, ErrorBoundary, etc.)
│   │   │   └── StrapiPreviewListener/ # Detects Strapi preview mode in browser
│   │   ├── forms/               # Reusable form components
│   │   ├── helpers/             # Non-rendering helper components
│   │   ├── layouts/
│   │   │   └── StrapiPageView.tsx  # Core layout: fetches page data, iterates dynamic zone
│   │   ├── page-builder/
│   │   │   ├── index.tsx        # PageContentComponents registry (UID → React component map)
│   │   │   ├── components/
│   │   │   │   ├── forms/       # React components for Strapi form components
│   │   │   │   ├── sections/    # React components for Strapi section components
│   │   │   │   ├── seo-utilities/ # SEO-specific components (StructuredData, etc.)
│   │   │   │   └── utilities/   # Utility components (links, images, rich text renderers)
│   │   │   └── single-types/
│   │   │       ├── navbar/      # StrapiNavbar and auth section
│   │   │       └── footer/      # StrapiFooter
│   │   ├── providers/
│   │   │   ├── ClientProviders.tsx  # Client-side context providers wrapper
│   │   │   ├── ServerProviders.tsx  # Server-side context providers wrapper
│   │   │   └── TrackingScripts.tsx  # Analytics/tracking script injection
│   │   ├── typography/          # Typography components
│   │   └── ui/                  # shadcn/ui primitive components
│   ├── hooks/
│   │   ├── useAppForm.ts        # Form hook wrapper (react-hook-form + zod)
│   │   ├── usePages.ts          # Hook for fetching pages
│   │   ├── useUserMutations.ts  # Mutations for user auth actions
│   │   └── useTranslatedZod.ts  # Zod schema with translated error messages
│   ├── lib/
│   │   ├── auth.ts              # Better Auth config + custom Strapi plugins
│   │   ├── auth-client.ts       # Better Auth client (CSR session access)
│   │   ├── env-vars.ts          # Safe env var accessor (SSR + CSR via window.CSR_CONFIG)
│   │   ├── navigation.ts        # next-intl routing, locale helpers, link formatting
│   │   ├── logging.ts           # logNonBlockingError helper
│   │   ├── i18n.ts              # next-intl server-side i18n config
│   │   ├── fonts.ts             # Next.js font definitions
│   │   ├── styles.ts            # cn() Tailwind class merger utility
│   │   ├── build.ts             # Build-time helpers (generateStaticParams debug, fallback paths)
│   │   ├── general-helpers.ts   # isDevelopment, safeJSONParse, etc.
│   │   ├── recaptcha.ts         # reCAPTCHA integration helpers
│   │   ├── metadata/            # SEO metadata helpers and defaults
│   │   ├── proxies/             # Middleware pipeline stages
│   │   │   ├── authGuard.ts     # Protects auth-required pages
│   │   │   ├── basicAuth.ts     # HTTP basic auth gate
│   │   │   ├── httpsRedirect.ts # Redirect HTTP to HTTPS in prod
│   │   │   └── dynamicRewrite.ts # Rewrite requests with searchParams to /dynamic/ route
│   │   └── strapi-api/
│   │       ├── base.ts          # BaseStrapiClient abstract class + API_ENDPOINTS map
│   │       ├── public.ts        # PublicClient (read-only or custom API token)
│   │       ├── private.ts       # PrivateClient (user JWT or private API token)
│   │       ├── request-auth.ts  # Token selection logic + endpoint allowlist
│   │       ├── index.ts         # Exports PublicStrapiClient and PrivateStrapiClient singletons
│   │       └── content/
│   │           └── server.ts    # "server-only" content fetchers: fetchPage, fetchNavbar, fetchFooter, etc.
│   ├── styles/
│   │   └── globals.css          # Global CSS (Tailwind base + design-system tokens)
│   ├── types/
│   │   ├── api/index.ts         # Strapi REST response wrapper types, media types, breadcrumbs
│   │   ├── general.ts           # AppError, CustomFetchOptions types
│   │   ├── next.ts              # PageProps, LayoutProps helpers
│   │   ├── global.d.ts          # Window.CSR_CONFIG declaration
│   │   └── better-auth.d.ts     # Augmented Better Auth session/user types (strapiJWT, blocked, provider)
│   ├── proxy.ts                 # Next.js middleware export (middleware pipeline)
│   └── instrumentation.ts       # Sentry server/edge instrumentation
├── locales/                     # next-intl translation JSON files (cs.json, en.json)
├── public/                      # Static public assets
├── next.config.mjs              # Next.js config (Sentry, next-intl, image, output)
├── vitest.config.ts             # Unit test config
├── eslint.config.mjs            # ESLint config
└── postcss.config.js            # PostCSS config (Tailwind)
```

---

## packages/ — Shared Packages

```
packages/
├── design-system/src/
│   ├── styles.css               # Base design token styles
│   ├── theme.css                # Theme variable overrides
│   ├── custom-styles.css        # Custom global styles
│   └── build-ck-config.js       # CKEditor config builder
├── shared-data/
│   └── index.ts                 # ROOT_PAGE_PATH constant, normalizePageFullPath()
├── strapi-types/src/
│   └── index.ts                 # Re-exports @strapi/strapi types + generated types
├── eslint-config/src/
│   ├── configs/                 # ESLint config presets
│   └── utils/                   # Config helper utilities
├── prettier-config/             # Prettier config package
├── typescript-config/           # tsconfig base packages
└── semantic-release-config/     # Semantic release shared config
```

---

## qa/ — Quality Assurance

```
qa/tests/playwright/
├── e2e/                         # End-to-end test specs
├── axe/                         # Accessibility (axe-core) test specs
├── seo/                         # SEO audit test specs
├── visual/                      # Visual regression test specs
├── perfo/                       # Lighthouse performance (LHCI) specs
└── helpers/                     # Shared Playwright test helpers
```

---

## Key File Locations

**Entry Points:**

- `apps/ui/src/proxy.ts`: Next.js middleware (i18n, auth guard, dynamic rewrite, basic auth)
- `apps/ui/src/app/[locale]/layout.tsx`: Root HTML layout for all locale pages
- `apps/ui/src/app/[locale]/[[...rest]]/page.tsx`: ISR CMS page handler
- `apps/ui/src/app/[locale]/dynamic/[[...rest]]/page.tsx`: SSR CMS page handler (searchParams)

**Strapi API Communication:**

- `apps/ui/src/lib/strapi-api/base.ts`: Abstract client with all HTTP methods
- `apps/ui/src/lib/strapi-api/index.ts`: Singleton exports (`PublicStrapiClient`, `PrivateStrapiClient`)
- `apps/ui/src/lib/strapi-api/content/server.ts`: All server-side content fetch functions
- `apps/ui/src/lib/strapi-api/request-auth.ts`: Token selection and endpoint allowlist

**Authentication:**

- `apps/ui/src/lib/auth.ts`: Better Auth server config with Strapi plugins
- `apps/ui/src/lib/auth-client.ts`: Better Auth client for CSR session access
- `apps/ui/src/app/api/auth/[...all]/route.ts`: Better Auth HTTP handler

**Page Builder:**

- `apps/ui/src/components/page-builder/index.tsx`: Component UID → React component registry
- `apps/ui/src/components/layouts/StrapiPageView.tsx`: Dynamic zone renderer
- `apps/strapi/src/populateDynamicZone/index.ts`: Auto-discover populate configs
- `apps/strapi/src/documentMiddlewares/page.ts`: Populate middleware registration

**Configuration:**

- `apps/strapi/config/plugins.ts`: Plugin config (S3, email, Sentry, config-sync)
- `apps/ui/next.config.mjs`: Next.js config (Sentry, next-intl, images)
- `turbo.json`: Turborepo task graph
- `pnpm-workspace.yaml`: Workspace member globs

**Types:**

- `apps/ui/src/types/api/index.ts`: REST response wrapper types
- `apps/ui/src/types/better-auth.d.ts`: Augmented session type with `strapiJWT`
- `packages/strapi-types/src/index.ts`: Shared Strapi SDK types
- `apps/strapi/types/generated/`: Auto-generated Strapi content-type types (do not edit)

---

## Naming Conventions

**Files:**

- React components: PascalCase, e.g., `StrapiHero.tsx`, `StrapiPageView.tsx`
- Utility/library modules: camelCase, e.g., `auth.ts`, `env-vars.ts`, `general-helpers.ts`
- Next.js special files: lowercase as required: `page.tsx`, `layout.tsx`, `route.ts`, `error.tsx`
- Strapi API modules: kebab-case matching content type name, e.g., `admin-panel-config.ts`
- Strapi schemas: `schema.json` inside `content-types/<name>/`
- Test files: `*.test.ts` co-located under `src/lib/__tests__/`

**Directories:**

- Next.js routes: kebab-case, e.g., `forgot-password/`, `[...rest]/`
- Strapi content types: kebab-case matching Strapi uid, e.g., `admin-panel-config/`, `internal-job/`
- Page-local components: `_components/` prefix (co-located, not exported globally)
- Shared packages: kebab-case with `@repo/` scope prefix

**Strapi Component UIDs:**

- Pattern: `<category>.<component-name>` matching directory structure under `apps/strapi/src/components/`
- Examples: `sections.hero`, `forms.contact-form`, `utilities.ck-editor-content`
- Same UID keys are used in `PageContentComponents` registry and `populateDynamicZone/` files

---

## Where to Add New Code

**New CMS Page Section (Strapi component + React component):**

1. Create Strapi component schema JSON in `apps/strapi/src/components/sections/<component-name>/schema.json`
2. Add populate config in `apps/strapi/src/populateDynamicZone/sections/<component-name>.ts`
3. Add the component UID to the `content` dynamic zone array in `apps/strapi/src/api/page/content-types/page/schema.json`
4. Create React component in `apps/ui/src/components/page-builder/components/sections/Strapi<ComponentName>.tsx`
5. Add an entry to `PageContentComponents` in `apps/ui/src/components/page-builder/index.tsx`

**New Strapi Content Type (fetchable from frontend):**

1. Create directory under `apps/strapi/src/api/<type-name>/` with `content-types/`, `controllers/`, `services/`, `routes/` subdirs
2. Add the UID → path mapping to `API_ENDPOINTS` in `apps/ui/src/lib/strapi-api/base.ts`
3. Add a fetcher function in `apps/ui/src/lib/strapi-api/content/server.ts`
4. If client-side access is needed, add the path to `ALLOWED_STRAPI_ENDPOINTS` in `apps/ui/src/lib/strapi-api/request-auth.ts`

**New API Route Handler (Next.js):**

- Place in `apps/ui/src/app/api/<route-name>/route.ts`
- Export named HTTP method functions (`GET`, `POST`, etc.)

**New Shared Package:**

- Create directory under `packages/<package-name>/`
- Add `package.json` with `name: "@repo/<package-name>"` and add to `pnpm-workspace.yaml` (already covered by `packages/*`)

**New Auth Page:**

- Create directory under `apps/ui/src/app/[locale]/auth/<page-name>/`
- If the page requires authentication, add the path to `authPages` in `apps/ui/src/lib/proxies/authGuard.ts`
- Place page-local components in `apps/ui/src/app/[locale]/auth/<page-name>/_components/`

**New Utility Library:**

- Place in `apps/ui/src/lib/<utility-name>.ts`
- If server-only, add `import "server-only"` at the top
- Export from the file directly; no barrel index in `lib/`

**New Strapi Plugin (custom):**

- Create a new package under `packages/strapi-plugin-<name>/`
- Reference via `.yalc` during development or publish to npm

---

## Special Directories

**`apps/strapi/types/generated/`:**

- Purpose: Auto-generated TypeScript types from Strapi content type schemas
- Generated: Yes — run `pnpm run sync-types` in `apps/strapi`
- Committed: Yes (part of source control)
- Do not edit manually

**`apps/strapi/config/sync/`:**

- Purpose: Config-sync plugin export files (Strapi configuration as code)
- Generated: By `strapi-plugin-config-sync`
- Committed: Yes

**`apps/ui/src/app/[locale]/dev/`:**

- Purpose: Development-only pages for component and page overview tooling
- Committed: Yes, but intended for local development visibility only

**`.agents/skills/`:**

- Purpose: Claude agent task skill definitions (add-locale, create-content-component)
- Generated: No — manually maintained
- Committed: Yes

**`.planning/codebase/`:**

- Purpose: Auto-generated architecture analysis documents for GSD agent tooling
- Generated: Yes — by `gsd:map-codebase` command
- Committed: Yes

**`apps/strapi/public/uploads/`:**

- Purpose: Local file storage for Strapi media uploads (used when AWS S3 is not configured)
- Generated: Yes
- Committed: No (in `.gitignore`)

---

_Structure analysis: 2026-03-17_
