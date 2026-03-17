# Architecture

**Analysis Date:** 2026-03-17

## Pattern Overview

**Overall:** Headless CMS + SSR/ISR Monorepo

**Key Characteristics:**

- Strapi (`apps/strapi`) acts as the content backend and user-auth provider; Next.js (`apps/ui`) is the rendering frontend
- Next.js never calls Strapi directly from the browser — all Strapi traffic is proxied through Next.js API routes to keep the backend URL and API tokens hidden
- Pages are driven by a Strapi Dynamic Zone (`content` field on `api::page.page`); the frontend resolves components at render time via a registry map
- Authentication uses Better Auth as the session layer, which delegates all credential and OAuth operations to Strapi's users-permissions plugin

---

## Layers

**Strapi CMS (Content Backend):**

- Purpose: Content management, content-type definitions, REST API, user authentication, media storage
- Location: `apps/strapi/src/`
- Contains: API controllers/services/routes, content-type schemas, Strapi component definitions, lifecycle hooks, document middlewares, cron tasks
- Depends on: PostgreSQL (prod) / SQLite (dev), AWS S3 (optional), Mailgun or Mailtrap (email)
- Used by: Next.js frontend (via REST API)

**Next.js Frontend (SSR/ISR Rendering Layer):**

- Purpose: Server-side and statically rendered user-facing web application
- Location: `apps/ui/src/`
- Contains: App Router pages and layouts, page-builder component registry, API proxy route handlers, auth configuration, middleware pipeline, utility libraries
- Depends on: Strapi REST API (via internal proxies), Better Auth session store

**Next.js Middleware Pipeline:**

- Purpose: Request interception before routing; handles HTTPS redirect, basic auth, auth guard, i18n locale, and dynamic route rewrites
- Location: `apps/ui/src/proxy.ts` (exported as `middleware`) and `apps/ui/src/lib/proxies/`
- Execution order: basicAuth → httpsRedirect → authGuard → dynamicRewrite → intlProxy (next-intl)

**Strapi Client Library:**

- Purpose: Typed HTTP client for fetching Strapi REST API data from Next.js server components and server actions
- Location: `apps/ui/src/lib/strapi-api/`
- Contains: `BaseStrapiClient` abstract class with `fetchOne`, `fetchMany`, `fetchAll`, `fetchOneBySlug`, `fetchOneByFullPath`; `PublicClient` and `PrivateClient` concrete classes; server-only content fetchers
- Used by: Server components (RSC), server actions, API route handlers

**Shared Packages:**

- Purpose: Cross-app utilities and type definitions shared between Strapi and Next.js
- Packages: `@repo/shared-data` (path normalization, ROOT_PAGE_PATH constant), `@repo/strapi-types` (re-exports Strapi SDK types plus generated content-type types), `@repo/design-system` (CSS/theme files), `@repo/eslint-config`, `@repo/prettier-config`, `@repo/typescript-config`
- Location: `packages/`

---

## Data Flow

**Static/ISR Page Request (primary flow):**

1. Browser requests `/en/about`
2. Next.js middleware (`apps/ui/src/proxy.ts`) runs: basicAuth → httpsRedirect → authGuard → dynamicRewrite → intlProxy passes through
3. Next.js App Router resolves `apps/ui/src/app/[locale]/[[...rest]]/page.tsx` (ISR, `revalidate=300`, `dynamic="force-static"`)
4. `StrapiPageView` layout component (`apps/ui/src/components/layouts/StrapiPageView.tsx`) calls `fetchPage(fullPath, locale)` from `apps/ui/src/lib/strapi-api/content/server.ts`
5. `PublicStrapiClient.fetchOneByFullPath("api::page.page", fullPath, { locale, populateDynamicZone: { content: true } })` builds the request
6. On Strapi, the Documents API middleware (`apps/strapi/src/documentMiddlewares/page.ts`) intercepts: reads `populateDynamicZone`, prefetches component types from the page, builds the full populate tree from `apps/strapi/src/populateDynamicZone/`
7. Strapi returns populated page data including resolved dynamic zone components
8. `StrapiPageView` maps each `__component` value to a React component via `PageContentComponents` registry (`apps/ui/src/components/page-builder/index.tsx`) and renders them

**Dynamic Page Request (with searchParams):**

1. Browser requests `/en/search?q=foo`
2. Middleware `dynamicRewrite` detects `search` query params; rewrites internally to `/en/dynamic/search?q=foo`
3. `apps/ui/src/app/[locale]/dynamic/[[...rest]]/page.tsx` handles it with `dynamic="force-dynamic"` (SSR every request, searchParams available)
4. Delegates to same `StrapiPageView` component

**Authentication Flow:**

1. User submits sign-in form
2. Form calls Better Auth client `signIn` (`apps/ui/src/lib/auth-client.ts`)
3. Better Auth's `strapiAuthPlugin` (`apps/ui/src/lib/auth.ts`) POSTs to Strapi `/api/auth/local`
4. On success, Strapi returns `{ jwt, user }`; Better Auth creates a session cookie containing the `strapiJWT`
5. On subsequent requests, `strapiSessionPlugin` validates the Strapi JWT by calling `/api/users/me` with the token; if blocked or expired, the session is cleared

**Client-Side API Call Flow (browser components):**

1. Client component calls `PrivateStrapiClient.fetchAPI(path, params, init, { useProxy: true })`
2. Request routes to `/api/private-proxy/[...slug]` Next.js route handler
3. Proxy injects Bearer token (from Better Auth session or API key) and forwards to Strapi
4. Strapi response is returned to the client

**State Management:**

- Server state: ISR/Next.js fetch cache with 60-second revalidation in production (`BaseStrapiClient`)
- Session state: Better Auth cookie (JWE encrypted, 30-day max age, stateless — no DB required for session)
- UI state: React component-level state; no global client state manager detected

---

## Key Abstractions

**BaseStrapiClient:**

- Purpose: Abstract HTTP client for all Strapi REST API calls; handles caching, error parsing, pagination for `fetchAll`, slug/fullPath filtering
- File: `apps/ui/src/lib/strapi-api/base.ts`
- Pattern: Template Method — `prepareRequest` is abstract; `PublicClient` and `PrivateClient` implement auth and URL building
- Concrete implementations: `apps/ui/src/lib/strapi-api/public.ts`, `apps/ui/src/lib/strapi-api/private.ts`

**PageContentComponents Registry:**

- Purpose: Maps Strapi component UIDs to React components; the page renderer iterates the dynamic zone array and looks up each component here
- File: `apps/ui/src/components/page-builder/index.tsx`
- Pattern: Registry/Strategy — add a new component by adding one entry to the map and one populate config in Strapi

**populateDynamicZone System:**

- Purpose: Server-side populate resolver on Strapi; allows frontend to request `populateDynamicZone: { content: true }` without knowing which components are on the page, keeping populate trees out of frontend code
- Files: `apps/strapi/src/documentMiddlewares/page.ts` (middleware), `apps/strapi/src/populateDynamicZone/` (per-component populate configs), `apps/strapi/src/populateDynamicZone/index.ts` (filesystem scanner)
- Pattern: Middleware with auto-discovery — adding a new Strapi component requires only a new file in the matching `populateDynamicZone/<category>/` directory

**API_ENDPOINTS Map:**

- Purpose: Typed mapping from Strapi content type UIDs to API path strings; enforces that all UID-to-path mappings are in one place
- File: `apps/ui/src/lib/strapi-api/base.ts` (lines 17-22)
- Pattern: Lookup table — must be extended when adding new content types the frontend queries

**Better Auth + strapiAuthPlugin:**

- Purpose: Bridges Next.js session management with Strapi's users-permissions system; all auth endpoints are custom Better Auth plugins that call Strapi under the hood
- File: `apps/ui/src/lib/auth.ts`
- Pattern: Adapter — Better Auth provides the session/cookie layer; Strapi provides the user identity and JWT

**Page Hierarchy (fullPath):**

- Purpose: Pages in Strapi have `parent` / `children` self-relations; a lifecycle hook auto-computes `fullPath` from the hierarchy on create; breadcrumbs are generated from `fullPath` segments
- Files: `apps/strapi/src/api/page/content-types/page/lifecycles.ts`, `apps/strapi/src/utils/hierarchy/`, `apps/strapi/src/utils/breadcrumbs.ts`

---

## Entry Points

**Next.js App Root Layout:**

- Location: `apps/ui/src/app/[locale]/layout.tsx`
- Triggers: Every page load under a locale
- Responsibilities: Injects CSR env vars via `window.CSR_CONFIG`, renders `StrapiNavbar`, `StrapiFooter`, `ClientProviders`, `ServerProviders`, `StrapiPreviewListener`

**Static/ISR Page Handler:**

- Location: `apps/ui/src/app/[locale]/[[...rest]]/page.tsx`
- Triggers: GET requests for any CMS-managed page
- Responsibilities: Generates static params from Strapi at build time, runs ISR revalidation at 300s, renders `StrapiPageView`

**Dynamic Page Handler:**

- Location: `apps/ui/src/app/[locale]/dynamic/[[...rest]]/page.tsx`
- Triggers: Rewrites from middleware when URL has search params
- Responsibilities: SSR with searchParams available, delegates to `StrapiPageView`

**Next.js Middleware:**

- Location: `apps/ui/src/proxy.ts`
- Triggers: All requests matching the `config.matcher`
- Responsibilities: Pipeline of basicAuth, httpsRedirect, authGuard, dynamicRewrite, i18n locale routing

**Better Auth API Handler:**

- Location: `apps/ui/src/app/api/auth/[...all]/route.ts`
- Triggers: All `/api/auth/*` requests
- Responsibilities: Handles all Better Auth endpoints including custom Strapi-bridged signin, register, OAuth sync

**Public Proxy:**

- Location: `apps/ui/src/app/api/public-proxy/[...slug]/route.ts`
- Triggers: Client-side requests when `useProxy: true`
- Responsibilities: Validates endpoint allowlist (`ALLOWED_STRAPI_ENDPOINTS`), injects read-only or custom API token, forwards to Strapi

**Private Proxy:**

- Location: `apps/ui/src/app/api/private-proxy/[...slug]/route.ts`
- Triggers: Authenticated client-side requests when `useProxy: true`
- Responsibilities: Injects user JWT from Better Auth session, forwards to Strapi

**Strapi App Entry:**

- Location: `apps/strapi/src/` (Strapi framework bootstraps from `config/`)
- Triggers: `strapi start` / `strapi develop`
- Responsibilities: Registers all content types, plugins, middlewares, cron tasks, lifecycle hooks

---

## Error Handling

**Strategy:** Non-throwing by default for content fetches; throw on auth errors; structured `AppError` type for API errors

**Patterns:**

- `BaseStrapiClient.fetchAPI` throws serialized `AppError` JSON strings on non-2xx responses or non-JSON responses
- Server content fetchers (`apps/ui/src/lib/strapi-api/content/server.ts`) catch all errors and call `logNonBlockingError`, returning `undefined` instead of throwing — pages then call `notFound()` if data is null
- `logNonBlockingError` (`apps/ui/src/lib/logging.ts`) suppresses errors unless `SHOW_NON_BLOCKING_ERRORS` env var is set — prevents memory buildup during static builds
- Better Auth plugin errors are converted to `APIError` with typed status codes via `throwBetterAuthError` (`apps/ui/src/lib/auth.ts`)
- `StrapiPageView` wraps each page-builder component in an `<ErrorBoundary>` to prevent one broken component from crashing the entire page

---

## Cross-Cutting Concerns

**Logging:** `console.error` via `logNonBlockingError` wrapper; gated by `SHOW_NON_BLOCKING_ERRORS` env var; `DEBUG_STRAPI_CLIENT_API_CALLS` env var enables API error logging in `BaseStrapiClient`

**Validation:** Zod schemas for all Better Auth endpoint bodies; Strapi schema-level validation for content types; `isStrapiEndpointAllowed` allowlist for proxy routes

**Authentication:**

- SSR/RSC: `getSessionSSR(headers())` from `apps/ui/src/lib/auth.ts` reads session from cookies
- CSR: `getSessionCSR()` from `apps/ui/src/lib/auth-client.ts` calls `/api/auth/session`
- Middleware: `authGuard` in `apps/ui/src/lib/proxies/authGuard.ts` protects `/auth/change-password` and `/auth` pages

**i18n:** `next-intl` with `cs` and `en` locales; locale prefix is `"as-needed"` (default locale `en` has no prefix); routing defined in `apps/ui/src/lib/navigation.ts`

**Draft/Preview:** Next.js Draft Mode via `apps/ui/src/app/api/preview/route.ts`; secret token validated; `draftMode().isEnabled` controls whether Strapi fetches draft or published content

---

_Architecture analysis: 2026-03-17_
