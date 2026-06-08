---
sidebar_position: 3
---

# Private Strapi Proxy

Route: `/api/private-proxy/[...slug]`

File:

```txt
apps/ui/src/app/api/private-proxy/[...slug]/route.ts
```

This route proxies authenticated, user-specific Strapi requests from the browser. It hides `STRAPI_URL`, forwards the user's authorization header, and rejects paths that are not allowed by `isStrapiEndpointAllowed()`.

:::warning End-user authentication
Use this when a client-side request needs a Strapi Users & Permissions JWT rather than an application API token. This is related to end-user authentication, not Strapi Admin users.
:::

## Why It Exists

Private Strapi calls are user-specific. The browser can hold the user's session, but it should still not need to know the Strapi origin URL or call Strapi directly.

It also supports deployments where Strapi runs on a private network. The browser cannot reach Strapi directly, but the Next.js server can communicate with it and proxy the allowed request.

This proxy keeps the backend URL hidden while allowing authenticated UI flows to reach selected Strapi Users & Permissions endpoints.

## Endpoint Allowlist

`isStrapiEndpointAllowed()` lives in:

```txt
apps/ui/src/lib/strapi-api/request-auth.ts
```

It checks the requested Strapi path against `ALLOWED_STRAPI_ENDPOINTS` for the current HTTP method.

:::warning Do not make this a CMS tunnel
This still matters for private requests: authentication proves who the user is, but it does not mean every Strapi endpoint should be reachable through the browser proxy. The allowlist prevents the route from becoming a general-purpose tunnel to the CMS.
:::

:::tip Add only what the flow needs
When adding a new private proxy use case, add only the specific path and HTTP method required by that flow.
:::

Supported methods:

- `GET`
- `HEAD`
- `POST`
- `PUT`
- `DELETE`

Related docs:

- [Strapi API Client](../strapi-api-client.md)
- [Authentication](../../auth/ui/authentication.md)
