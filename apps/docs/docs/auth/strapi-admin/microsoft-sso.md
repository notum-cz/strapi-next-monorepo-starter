---
sidebar_position: 1
---

# Microsoft SSO (Strapi admin panel)

Single sign-on for **Strapi admin users** — the people who log into the CMS admin panel to manage content. Authenticates via Microsoft Entra ID using `passport-azure-ad-oauth2`.

:::info Scope
This is **admin-panel only**. End-users of your Next.js application don't see this — for them, see [Frontend Authentication](../frontend/authentication.md) and [OAuth Providers](../frontend/oauth-providers.md).
:::

Official Strapi documentation:

- https://docs.strapi.io/cms/configurations/sso-providers/microsoft

## Requirements

- Strapi SSO for admin users is an Enterprise feature. A valid Strapi Enterprise license is required.
- A Microsoft Entra ID tenant is required.
- A Microsoft app registration must exist in the correct tenant.
- Users who should sign in must have an email address or UPN in that tenant.
- Valid callback URLs must be registered for every environment where SSO will be used.

> [Tip]
> For local development, it is important to set `STRAPI_LICENSE` and verify SSO displays correctly in the login screen.

## Dependencies

Libraries required by the provider - `passport-azure-ad-oauth2` and `jsonwebtoken`. By default, they are installed in Strapi project.

`passport-azure-ad-oauth2` is the Entra OAuth2 strategy used by the provider. `jsonwebtoken` is used to decode the returned `id_token` and extract user claims.

## Strapi-Side Configuration

The important Strapi-side pieces are:

- register the Microsoft provider in `admin.ts`
- set the required environment variables
- make the Microsoft logo available from Strapi `public/`
- trust proxy headers in environments where HTTPS is terminated before Strapi

Relevant `admin.ts` usage (in `config/admin.ts`):

```ts
import { microsoftSSOProvider } from "./auth-providers"

export default ({ env }) => {
  return {
    auth: {
      providers: [microsoftSSOProvider(env)].filter(Boolean),
    },
  }
}
```

### Required environment variables

```env
STRAPI_LICENSE=
APP_URL=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
```

Notes:

- `STRAPI_LICENSE` is required for local testing because SSO is a Strapi Enterprise feature.
- `APP_URL` must match the public URL of the current environment.
- The callback URL sent to Microsoft is derived from `APP_URL`.
- Without setting `MICROSOFT_XYZ` variables, the provider will not be included in Strapi admin auth providers, and the Microsoft SSO option will not appear on the login screen.

### Static logo asset

The example provider uses:

```ts
icon: "/microsoft-logo.svg"
```

That means `microsoft-logo.svg` must be placed in Strapi `public/` so it is served at `/microsoft-logo.svg`.

### Reverse proxy configuration

If Strapi runs behind Nginx, a load balancer, or another reverse proxy that terminates HTTPS, enable proxy trust in `config/server.ts` and `config/env/production/server.ts`. Typically with Azure App Service:

```ts
export default ({ env }) => ({
  proxy: { koa: true }, // <-- this is the key setting to trust X-Forwarded-Proto
  url: env("APP_URL"),
})
```

Without this, Strapi may fail after successful SSO with:

```text
Cannot send secure cookie over unencrypted connection
```

This happens because the browser uses HTTPS, but Strapi only sees the internal HTTP hop unless it trusts `X-Forwarded-Proto`.

Only enable proxy trust when Strapi is behind a trusted proxy and is not directly exposed to the public internet.

## Microsoft / Entra-Side Configuration

From the Microsoft side, the app registration owner needs to provide and configure:

- the correct Entra tenant
- a valid app registration in that tenant
- a client ID
- a client secret
- the tenant ID
- callback URLs for every environment

The minimum requirements for the Microsoft app creator are:

- The app must be registered in the same tenant where the users exist.
- Users signing in must exist in that tenant and have a usable identity field such as email or UPN.
- Redirect URIs must be configured for all environments where Strapi is used.
- The client secret must be stored securely and exposed to Strapi as `MICROSOFT_CLIENT_SECRET`.
- The app must be allowed to authenticate users from the intended tenant.

Each environment needs its own callback URL in the app registration:

```text
http://localhost:1337/admin/connect/azure_ad_oauth2
https://your-staging-host/admin/connect/azure_ad_oauth2
https://your-production-host/admin/connect/azure_ad_oauth2
```

The exact production URL depends on the final public host name.

- If a callback URL is missing or does not exactly match the URL generated from `APP_URL`, the Microsoft login flow will fail.
- If the app is registered in the wrong tenant, a tenant-specific error such as `AADSTS700016` can occur.

## How It Works Technically

This integration follows the standard Node.js Passport pattern:

```text
Strapi admin auth
  -> Passport-compatible provider setup
  -> passport-azure-ad-oauth2
  -> Microsoft Entra ID
```

At runtime, the flow is:

1. The user clicks `Sign in with Microsoft` in the Strapi admin login screen.
2. Strapi redirects the user to Microsoft Entra ID.
3. Microsoft authenticates the user and validates that the account belongs to the configured tenant.
4. Microsoft redirects the user back to Strapi's callback URL.
5. Strapi receives an `id_token` and decodes it to extract user claims.
6. Strapi resolves the admin user identity from the token and signs the user into Strapi.
7. Strapi still applies its own admin roles and permissions after authentication.

Important distinction:

- Entra handles authentication.
- Strapi handles authorization.

That means Microsoft decides who can successfully authenticate, but Strapi still controls what that authenticated admin user is allowed to do inside the CMS.

In the usual setup, Strapi roles are assigned in Strapi itself (after login). Entra roles are not automatically mapped unless additional custom synchronization is implemented.

## Token and Claim Considerations

The provider uses the returned `id_token` to derive the user's identity.

The important practical detail is that Microsoft does not always include the `email` claim by default. In enterprise tenants, `upn` is usually the safest fallback.

Typical claims used for identity resolution are:

| Claim                | Meaning                                        |
| -------------------- | ---------------------------------------------- |
| `email`              | User email, not always present                 |
| `upn`                | User Principal Name, usually the best fallback |
| `preferred_username` | Alternate login name                           |
| `unique_name`        | Alternate username field                       |
| `given_name`         | First name                                     |
| `family_name`        | Last name                                      |

This is why the provider falls back across multiple identity fields rather than relying only on `email`.
