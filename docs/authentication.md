# Authentication

The application uses a dual authentication system: Better Auth for session management and Strapi JWT for API access.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Next.js (apps/ui)                              │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                          Better Auth (v1)                            │   │
│  │  - Session management via cookies                                    │   │
│  │  - Stateless JWE cookie cache (30 days)                              │   │
│  │  - Custom plugins for Strapi integration                             │   │
│  └────────────────────────────────┬─────────────────────────────────────┘   │
│                                   │                                         │
│                    stores strapiJWT in session                              │
│                                   │                                         │
│  ┌────────────────────────────────▼─────────────────────────────────────┐   │
│  │                       PrivateStrapiClient                            │   │
│  │  - Retrieves JWT from session                                        │   │
│  │  - Adds Authorization header to requests                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Strapi (apps/strapi)                              │
│  - users-permissions plugin                                                 │
│  - JWT validation on protected endpoints                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Files

| File                                         | Purpose                                    |
| -------------------------------------------- | ------------------------------------------ |
| `apps/ui/src/lib/auth.ts`                    | Better Auth server config + Strapi plugins |
| `apps/ui/src/lib/auth-client.ts`             | Better Auth client hooks                   |
| `apps/ui/src/types/better-auth.ts`           | TypeScript interfaces for sessions         |
| `apps/ui/src/lib/strapi-api/request-auth.ts` | Auth header utilities                      |

## Better Auth Plugins

Three custom plugins integrate Better Auth with Strapi:

### strapiAuthPlugin

Handles credential-based authentication:

```typescript
// Endpoints
POST /api/auth/sign-in-strapi          // Login
POST /api/auth/register-strapi         // Registration
POST /api/auth/forgot-password-strapi  // Password reset email
POST /api/auth/reset-password-strapi   // Set new password from reset link
POST /api/auth/update-password-strapi  // Change password (authenticated)
```

### strapiSessionPlugin

Validates Strapi JWT on every session access:

- Calls `/users/me` to verify JWT is still valid
- Checks if user is blocked in Strapi
- Clears session if JWT is invalid/expired

### strapiOAuthPlugin

Syncs OAuth logins with Strapi:

```typescript
POST / api / auth / sync - oauth - strapi // After OAuth success, create Strapi user
```

## Session Data

The session contains Strapi-specific fields:

```typescript
interface BetterAuthUserWithStrapi {
  id: string
  email: string
  name: string
  strapiJWT: string // Strapi access token
  blocked: boolean // Strapi block status
  provider: string // "credentials" | "github" | "google" | etc.
  emailVerified: boolean
}
```

## Accessing Sessions

### Server-Side (RSC, Server Actions, API Routes)

```typescript
import { headers } from "next/headers"

import { getSessionSSR } from "@/lib/auth"

const session = await getSessionSSR(await headers())

if (session?.user?.strapiJWT) {
  // User is authenticated
}
```

### Client-Side

```typescript
import { getSessionCSR } from "@/lib/auth-client"

const { data: session, error } = await getSessionCSR()

if (session?.user?.strapiJWT) {
  // User is authenticated
}
```

## Using PrivateStrapiClient

The client automatically retrieves JWT from the session:

```typescript
import { PrivateStrapiClient } from "@/lib/strapi-api"

// Server-side: JWT fetched from cookies
const userData = await PrivateStrapiClient.fetchOne(
  "plugin::users-permissions.user",
  userId
)

// Client-side: use proxy
const userData = await PrivateStrapiClient.fetchOne(
  "plugin::users-permissions.user",
  userId,
  undefined,
  { useProxy: true }
)

// Direct JWT injection (e.g., in API routes)
const userData = await PrivateStrapiClient.fetchOne(
  "plugin::users-permissions.user",
  userId,
  undefined,
  { userJWT: "specific-jwt-token" }
)
```

## Auth Flow: Session Validation

On every request that accesses the session:

1. `strapiSessionPlugin` intercepts
2. Calls Strapi `/users/me` with stored JWT
3. If valid: refreshes user data from Strapi
4. If invalid/blocked: clears session, user logged out

## Environment Variables

```bash
BETTER_AUTH_SECRET=    # Random secret for session encryption
APP_PUBLIC_URL=        # Base URL for auth callbacks
```

## Related Documentation

- [Strapi API Client](./strapi-api-client.md) — How the clients handle auth headers
