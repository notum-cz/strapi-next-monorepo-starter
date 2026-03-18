---
sidebar_position: 1
sidebar_label: "Architecture Overview"
description: "High-level system architecture showing how Strapi CMS connects to the Next.js frontend."
---

# Architecture Overview

## System Overview

```mermaid
flowchart TD
    Browser["Browser"]

    subgraph NextJS["Next.js Frontend (apps/ui)"]
        Middleware["Middleware Pipeline"]
        AppRouter["App Router (ISR/SSR)"]
        PageBuilder["Page Builder Registry"]
        AuthClient["Better Auth Client"]
        Proxies["API Proxy Routes"]
    end

    subgraph Strapi["Strapi CMS (apps/strapi)"]
        REST["REST API"]
        DocMiddleware["Document Middleware"]
        ContentTypes["Content Types"]
        UsersPerms["Users & Permissions"]
    end

    subgraph Shared["Shared Packages"]
        SharedData["@repo/shared-data"]
        StrapiTypes["@repo/strapi-types"]
        DesignSystem["@repo/design-system"]
    end

    DB[("PostgreSQL")]

    Browser -->|"request"| Middleware
    Middleware --> AppRouter
    AppRouter --> PageBuilder
    Browser -->|"public-proxy\nprivate-proxy\nasset-proxy"| Proxies
    Proxies -->|"inject token"| REST
    AppRouter -->|"fetchPage()"| REST
    REST --> DocMiddleware
    DocMiddleware --> ContentTypes
    ContentTypes --> DB
    AuthClient -->|"signIn / session"| UsersPerms

    SharedData -.-> NextJS
    SharedData -.-> Strapi
    StrapiTypes -.-> NextJS
    DesignSystem -.-> NextJS
```

| Layer            | Location       | Responsibility                                                     |
| ---------------- | -------------- | ------------------------------------------------------------------ |
| Strapi CMS       | `apps/strapi/` | Content management, REST API, user authentication, media storage   |
| Next.js Frontend | `apps/ui/`     | SSR/ISR rendering, middleware pipeline, page builder, auth session |
| Shared Packages  | `packages/`    | Path utilities, type definitions, design tokens, tooling configs   |

:::note
Next.js never exposes the Strapi URL to the browser. All client-side requests go through proxy routes (`/api/public-proxy`, `/api/private-proxy`, `/api/asset`).
:::

## Page Request Flow

```mermaid
sequenceDiagram
    participant Browser
    participant MW as Middleware Pipeline
    participant Router as App Router
    participant PV as StrapiPageView
    participant Client as PublicStrapiClient
    participant Strapi as Strapi REST API
    participant DM as Document Middleware

    Browser->>MW: GET /en/about
    Note over MW: basicAuth -> httpsRedirect<br/>-> authGuard -> dynamicRewrite<br/>-> intlProxy
    MW->>Router: [locale]/[[...rest]]/page.tsx
    Note over Router: ISR revalidate=300<br/>dynamic="force-static"
    Router->>PV: render StrapiPageView
    PV->>Client: fetchPage(fullPath, locale)
    Client->>Strapi: GET /api/pages?fullPath=about&locale=en<br/>populateDynamicZone[content]=true
    Strapi->>DM: intercept request
    Note over DM: Read component types<br/>Build populate tree<br/>from populateDynamicZone/
    DM-->>Strapi: populated query
    Strapi-->>Client: Page JSON with resolved dynamic zone
    Client-->>PV: page data
    Note over PV: Map each __component<br/>to React component via<br/>PageContentComponents registry
    PV-->>Browser: rendered HTML
```

**Middleware pipeline** runs on every request in order: `basicAuth` -> `httpsRedirect` -> `authGuard` -> `dynamicRewrite` -> `intlProxy`. Defined in `apps/ui/src/proxy.ts`.

**Dynamic page variant:** When the URL has search params (e.g., `/en/search?q=foo`), `dynamicRewrite` rewrites to `/[locale]/dynamic/[[...rest]]/page.tsx` with `dynamic="force-dynamic"` for SSR on every request.

:::tip
The `populateDynamicZone` system keeps populate trees out of frontend code. Add a new component populate config in `apps/strapi/src/populateDynamicZone/{category}/` and it auto-discovers.
:::

## Auth Flow

```mermaid
sequenceDiagram
    participant Browser
    participant BAClient as Better Auth Client
    participant BAServer as Better Auth Server
    participant Plugin as strapiAuthPlugin
    participant Strapi as Strapi /api/auth/local

    Browser->>BAClient: signIn(email, password)
    BAClient->>BAServer: POST /api/auth/sign-in
    BAServer->>Plugin: strapiAuthPlugin hook
    Plugin->>Strapi: POST /api/auth/local
    Strapi-->>Plugin: { jwt, user }
    Plugin-->>BAServer: create session with strapiJWT
    BAServer-->>Browser: Set-Cookie (JWE encrypted, 30d)

    Note over Browser: Subsequent requests
    Browser->>BAServer: request with session cookie
    BAServer->>Plugin: strapiSessionPlugin validate
    Plugin->>Strapi: GET /api/users/me (Bearer jwt)
    alt valid
        Strapi-->>Plugin: user data
        Plugin-->>BAServer: session valid
    else blocked or expired
        Strapi-->>Plugin: 401
        Plugin-->>BAServer: clear session
    end
```

| Concern           | Implementation                                                   |
| ----------------- | ---------------------------------------------------------------- |
| Session layer     | Better Auth (cookies, JWE encrypted, stateless)                  |
| Identity provider | Strapi users-permissions plugin                                  |
| JWT storage       | `user.strapiJWT` in session cookie                               |
| SSR access        | `getSessionSSR(headers())` from `apps/ui/src/lib/auth.ts`        |
| CSR access        | `getSessionCSR()` from `apps/ui/src/lib/auth-client.ts`          |
| Route protection  | `authGuard` middleware in `apps/ui/src/lib/proxies/authGuard.ts` |

## Proxy Flow

```mermaid
sequenceDiagram
    participant CC as Client Component
    participant PC as PrivateStrapiClient
    participant Proxy as /api/private-proxy
    participant Session as Better Auth Session
    participant Strapi as Strapi

    CC->>PC: fetchAPI(path, params, { useProxy: true })
    PC->>Proxy: POST /api/private-proxy/[...slug]
    Proxy->>Session: read user JWT from cookie
    Session-->>Proxy: strapiJWT
    Proxy->>Strapi: forward request + Bearer token
    Strapi-->>Proxy: response
    Proxy-->>CC: JSON data

    Note over CC,Strapi: Public Proxy (read-only)
    CC->>Proxy: /api/public-proxy/[...slug]
    Note over Proxy: Validate against<br/>ALLOWED_STRAPI_ENDPOINTS
    Proxy->>Strapi: request + API key
    Strapi-->>CC: JSON data

    Note over CC,Strapi: Asset Proxy
    CC->>Proxy: /api/asset/[...slug]
    Proxy->>Strapi: forward to /uploads/...
    Strapi-->>CC: file data
```

| Proxy Route                    | Auth Method           | Use Case                                        |
| ------------------------------ | --------------------- | ----------------------------------------------- |
| `/api/public-proxy/[...slug]`  | Read-only API key     | Public content from client components           |
| `/api/private-proxy/[...slug]` | User JWT from session | Authenticated actions from client components    |
| `/api/asset/[...slug]`         | None (passthrough)    | Strapi media files without exposing backend URL |

:::warning
The public proxy validates each endpoint against `ALLOWED_STRAPI_ENDPOINTS` in `apps/ui/src/lib/strapi-api/request-auth.ts`. Requests to unlisted endpoints are rejected.
:::

## Page Builder

Strapi component UIDs map to React components via a central registry.

- Strapi: Dynamic zone components in `apps/strapi/src/components/{category}/`
- Next.js: React components in `apps/ui/src/components/page-builder/components/{category}/`
- Registry: `apps/ui/src/components/page-builder/index.tsx`

See [Page Builder](./page-builder.md) for details.

## Strapi API Clients

Two client classes handle content fetching:

| Client                | Auth     | Use Case                                    |
| --------------------- | -------- | ------------------------------------------- |
| `PublicStrapiClient`  | API key  | Read-only content (server components, ISR)  |
| `PrivateStrapiClient` | User JWT | Authenticated endpoints (client components) |

Both extend `BaseStrapiClient` (`apps/ui/src/lib/strapi-api/base.ts`) which provides `fetchOne`, `fetchMany`, `fetchAll`, `fetchOneBySlug`, and `fetchOneByFullPath`.

See [Strapi API Client](../frontend/api-client.md) for details.

## Routing

- Catch-all `[locale]/[[...rest]]` renders Strapi-managed pages (ISR, revalidate=300)
- `[locale]/dynamic/[[...rest]]` handles pages with searchParams (SSR per request)
- Auth pages under `[locale]/auth/`
- Locale extracted from URL via `next-intl`, passed to API queries

## Internationalization

| System      | Purpose    | Location                        |
| ----------- | ---------- | ------------------------------- |
| next-intl   | UI strings | `apps/ui/locales/{locale}.json` |
| Strapi i18n | Content    | `locale` query parameter        |

Locales: `en` (default, no prefix), `cs`. Configured as `"as-needed"` prefix strategy in `apps/ui/src/lib/navigation.ts`.

## Authentication

- **Better Auth v1**: Session management (cookies, JWE encrypted, 30-day max age)
- **Strapi JWT**: Stored in session as `user.strapiJWT`, used for private API calls
- **strapiAuthPlugin**: Bridges Better Auth with Strapi's users-permissions (`apps/ui/src/lib/auth.ts`)

See the [Auth Flow diagram](#auth-flow) above for the complete sequence.

## Environment Variables

Validated via `@t3-oss/env-nextjs`. Access through `getEnvVar()`. Client-side vars injected via `window.CSR_CONFIG`.

Files bootstrapped from `.example` files on `pnpm install`.

## Pages Hierarchy

Pages use parent-child relations for URL structure. `fullPath` auto-generated from slug chain via lifecycle hooks in `apps/strapi/src/utils/hierarchy/`.

See [Pages Hierarchy](../backend/pages-hierarchy.md) for workflow.
