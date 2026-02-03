# Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Strapi CMS (apps/strapi)                       │
│  - Content management                                                       │
│  - REST API with document middleware                                        │
│  - PostgreSQL (Docker)                                                      │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ REST API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Next.js Frontend (apps/ui)                        │
│  - App Router with catch-all routing                                        │
│  - Server/client Strapi clients with proxy                                  │
│  - Page builder component registry                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Page Builder

Strapi component UIDs map to React components via a central registry.

- Strapi: Dynamic zone components in `src/components/{category}/`
- Next.js: React components in `components/page-builder/components/{category}/`
- Registry: `components/page-builder/index.tsx`

See [Page Builder](./page-builder.md) for details.

## Strapi API Clients

Two client classes handle content fetching:

| Client | Auth | Use Case |
|--------|------|----------|
| `PublicStrapiClient` | API key | Read-only content |
| `PrivateStrapiClient` | User JWT | Authenticated endpoints |

Client-side requests use proxy routes (`/api/public-proxy`, `/api/private-proxy`) to hide Strapi URL.

See [Strapi API Client](./strapi-api-client.md) for details.

## Routing

- Catch-all `[locale]/[[...rest]]` renders Strapi-managed pages
- Auth pages under `[locale]/auth/`
- Locale extracted from URL, passed to API queries

## Internationalization

Dual i18n system:

| System | Purpose | Location |
|--------|---------|----------|
| next-intl | UI strings | `src/locales/{locale}.json` |
| Strapi i18n | Content | `locale` query parameter |

## Authentication

- **Better Auth v1**: Session management (cookies)
- **Strapi JWT**: Stored in session as `user.strapiJWT`, used for private API calls

## Environment Variables

Validated via `@t3-oss/env-nextjs`. Access through `getEnvVar()`.

Files bootstrapped from `.example` files on `pnpm install`.

## Pages Hierarchy

Pages use parent-child relations for URL structure. `fullPath` auto-generated from slug chain.

See [Pages Hierarchy](./pages-hierarchy.md) for workflow.
