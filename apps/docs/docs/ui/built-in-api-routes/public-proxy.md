---
sidebar_position: 2
---

# Public Strapi Proxy

Route: `/api/public-proxy/[...slug]`

File:

```txt
apps/ui/src/app/api/public-proxy/[...slug]/route.ts
```

This route proxies browser-safe requests to Strapi while hiding `STRAPI_URL` and server-side API tokens from the client.

It injects Strapi API token authentication, forwards the request to Strapi, and rejects paths that are not allowed by `isStrapiEndpointAllowed()`.

## Why It Exists

Browser code cannot safely know the Strapi origin URL or API tokens. Without this proxy, client components would either expose `STRAPI_URL` and bearer tokens or be unable to call Strapi at all.

It also supports deployments where Strapi runs on a private network. The browser cannot reach Strapi directly, but the Next.js server can communicate with it and proxy the allowed request.

The public proxy is useful for browser-side reads and selected browser-side writes that are safe to expose through the UI, such as newsletter subscription or auth-related Strapi endpoints.

## Endpoint Allowlist

`isStrapiEndpointAllowed()` lives in:

```txt
apps/ui/src/lib/strapi-api/request-auth.ts
```

It checks the requested Strapi path against `ALLOWED_STRAPI_ENDPOINTS` for the current HTTP method.

:::warning Keep the proxy narrow
This allowlist is important because the proxy injects a server-side Strapi API token. If every path were allowed, browser users could call arbitrary Strapi endpoints through the UI and potentially read or mutate CMS data that should not be exposed.
:::

:::tip Add only what the UI needs
When adding a new proxied Strapi endpoint, add only the narrow path and HTTP method the UI actually needs.
:::

Supported methods:

- `GET`
- `HEAD`
- `POST`
- `PUT`
- `DELETE`

Related docs:

- [Strapi API Client](../strapi-api-client.md)
