---
sidebar_position: 3
sidebar_label: "Middleware Pipeline"
description: "Five-stage middleware chain in proxy.ts: basicAuth, httpsRedirect, authGuard, dynamicRewrite, and intlProxy."
---

# Middleware Pipeline

A single middleware file (`apps/ui/src/proxy.ts`) chains five stages. Each stage receives the incoming `NextRequest` and returns either a `NextResponse` (short-circuiting the chain) or `null` (passing through to the next stage). The final stage (`intlProxy`) always runs if nothing intercepts.

## Execution Order

```mermaid
flowchart LR
    A["basicAuth"] --> B["httpsRedirect"]
    B --> C["authGuard"]
    C --> D["dynamicRewrite"]
    D --> E["intlProxy"]
```

:::info[Short-circuit pattern]
Each stage returns `NextResponse | null`. A non-null return **immediately ends** the chain -- no subsequent stages run. This means earlier stages have higher priority.
:::

The chain implementation in `proxy.ts`:

```typescript title="apps/ui/src/proxy.ts"
export default async function proxy(req: NextRequest) {
  const basicAuthResponse = basicAuth(req)
  if (basicAuthResponse) return basicAuthResponse

  const httpsResponse = httpsRedirect(req)
  if (httpsResponse) return httpsResponse

  const authResponse = await authGuard(req, intlProxy)
  if (authResponse) return authResponse

  const dynamicResponse = dynamicRewrite(req, intlProxy)
  if (dynamicResponse) return dynamicResponse

  return intlProxy(req)
}
```

## Stage Reference

### 1. basicAuth

**File:** `apps/ui/src/lib/proxies/basicAuth.ts`

HTTP Basic Authentication for staging environments. Only active when `BASIC_AUTH_ENABLED` is set.

| Condition                    | Response                                                 |
| ---------------------------- | -------------------------------------------------------- |
| `BASIC_AUTH_ENABLED` not set | `null` (pass through)                                    |
| No `Authorization` header    | `401` with `WWW-Authenticate: Basic realm="Secure Area"` |
| Invalid credentials          | `401` with `WWW-Authenticate` header                     |
| Valid credentials            | `null` (pass through)                                    |

**Environment variables:** `BASIC_AUTH_ENABLED`, `BASIC_AUTH_USERNAME`, `BASIC_AUTH_PASSWORD`

```typescript title="apps/ui/src/lib/proxies/basicAuth.ts"
export const basicAuth = (req: NextRequest): NextResponse | null => {
  if (!getEnvVar("BASIC_AUTH_ENABLED")) {
    return null
  }

  const authHeader = req.headers.get("authorization")

  if (!authHeader?.startsWith("Basic ")) {
    return UNAUTHORIZED_RESPONSE("Authentication required")
  }

  try {
    const credentials = atob(authHeader.substring(6))
    const [username, password] = credentials.split(":")

    if (
      username !== getEnvVar("BASIC_AUTH_USERNAME") ||
      password !== getEnvVar("BASIC_AUTH_PASSWORD")
    ) {
      return UNAUTHORIZED_RESPONSE("Invalid credentials")
    }
  } catch {
    return UNAUTHORIZED_RESPONSE("Invalid credentials format")
  }

  return null
}
```

### 2. httpsRedirect

**File:** `apps/ui/src/lib/proxies/httpsRedirect.ts`

Redirects HTTP requests to HTTPS in non-development environments. Checks the `x-forwarded-proto` header (set by reverse proxies like Heroku, Vercel).

| Condition                            | Response                                |
| ------------------------------------ | --------------------------------------- |
| Development or localhost             | `null` (pass through)                   |
| `x-forwarded-proto` includes `https` | `null` (pass through)                   |
| Non-HTTPS in production              | `301` redirect to `https://` equivalent |

```typescript title="apps/ui/src/lib/proxies/httpsRedirect.ts"
export const httpsRedirect = (req: NextRequest): NextResponse | null => {
  const xForwardedProto = req.headers.get("x-forwarded-proto")
  const host = req.headers.get("host") ?? ""
  const isDev = isDevelopment() || host.includes("localhost")

  if (
    !isDev &&
    (xForwardedProto === null || !xForwardedProto.includes("https"))
  ) {
    return NextResponse.redirect(
      `https://${req.headers.get("host")}${req.nextUrl.pathname}${req.nextUrl.search}`,
      301
    )
  }

  return null
}
```

### 3. authGuard

**File:** `apps/ui/src/lib/proxies/authGuard.ts`

Protects authentication-related pages (`/auth/change-password`, `/auth`) by requiring an active session. Unlike other stages, this one receives the `intlProxy` function so it can return locale-aware responses for authenticated users.

| Condition                 | Response                                         |
| ------------------------- | ------------------------------------------------ |
| Path is not an auth page  | `null` (pass through)                            |
| Auth page + valid session | `intlProxy(req)` response (locale-routed page)   |
| Auth page + no session    | `302` redirect to `/auth/signin?callbackUrl=...` |

The auth page regex accounts for locale prefixes:

```typescript title="apps/ui/src/lib/proxies/authGuard.ts"
const authPages = ["/auth/change-password", "/auth"]

const authPathnameRegex = new RegExp(
  `^(/(${routing.locales.join("|")}))?(${authPages.join("|")})/?$`,
  "i"
)
```

### 4. dynamicRewrite

**File:** `apps/ui/src/lib/proxies/dynamicRewrite.ts`

Rewrites requests that have search parameters to the `/dynamic/` route segment, enabling dynamic rendering for pages that need `searchParams`. Also blocks direct access to the bare `/dynamic` path.

| Condition                                   | Response                                                            |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Path starts with `/api`, `/dev`, or `/auth` | `null` (pass through)                                               |
| No search params                            | `null` (pass through)                                               |
| Already under `/dynamic/` prefix            | `null` (pass through)                                               |
| Direct access to `/dynamic`                 | Rewrite to `/not-found`                                             |
| Has search params                           | Rewrite to `/{locale}/dynamic/{path}` with `x-original-path` header |

```typescript title="apps/ui/src/lib/proxies/dynamicRewrite.ts (rewrite logic)"
const rewriteUrl = new URL(
  [locale, dynamicPrefix, rest].filter(Boolean).join("/"),
  req.url
)

rewriteUrl.search = search

const rewriteResponse = NextResponse.rewrite(rewriteUrl, intlProxy(req))
rewriteResponse.headers.set("x-original-path", pathname)

return rewriteResponse
```

The `x-original-path` header preserves the original request path so components can reference it after the rewrite.

### 5. intlProxy

The final stage, always reached if no earlier stage short-circuits. This is the `next-intl` middleware created via `createMiddleware(routing)`. It handles locale detection, cookie-based locale persistence, and URL prefixing.

```typescript title="apps/ui/src/proxy.ts"
import createMiddleware from "next-intl/middleware"
import { routing } from "@/lib/navigation"

const intlProxy = createMiddleware(routing)
```

Locale routing config is defined in `apps/ui/src/lib/navigation.ts` with locales `["cs", "en"]`, default locale `"en"`, and prefix mode `"as-needed"` (no URL prefix for the default locale).

## Matcher Configuration

The middleware only runs on paths matching these patterns:

```typescript title="apps/ui/src/proxy.ts"
export const config = {
  matcher: [
    "/",
    "/(cs|en)/:path*",
    "/((?!_next|_vercel|api|robots.txt|favicon.ico|sitemap|.*\\..*).*)",
  ],
}
```

| Pattern                               | Purpose                                                      |
| ------------------------------------- | ------------------------------------------------------------ |
| `"/"`                                 | Root path -- triggers locale redirect                        |
| `"/(cs\|en)/:path*"`                  | All locale-prefixed paths                                    |
| `"/((?!_next\|_vercel\|api\|...).*)"` | Everything except static files, API routes, and known assets |

**Excluded from middleware:** `_next/` (Next.js internals), `_vercel/` (Vercel internals), `api/` (API routes), `robots.txt`, `favicon.ico`, `sitemap*`, any path containing a file extension (e.g., `.css`, `.js`, `.png`).

## How to Modify

To add a new middleware stage:

1. Create a function in `apps/ui/src/lib/proxies/` that accepts `NextRequest` (and optionally `intlProxy`) and returns `NextResponse | null`.
2. Import it in `proxy.ts`.
3. Insert the call at the correct position in the chain. Earlier stages have higher priority.

```typescript title="Example: adding a maintenance mode stage"
// apps/ui/src/lib/proxies/maintenanceMode.ts
export const maintenanceMode = (req: NextRequest): NextResponse | null => {
  if (!getEnvVar("MAINTENANCE_MODE")) return null
  return new NextResponse("Under maintenance", { status: 503 })
}

// In proxy.ts, add before httpsRedirect:
const maintenanceResponse = maintenanceMode(req)
if (maintenanceResponse) return maintenanceResponse
```

## Related Documentation

- [Communication Between Layers](../architecture/communication.md) -- proxy system for Strapi API calls
- [Authentication](./authentication.md) -- auth guard context and session management
