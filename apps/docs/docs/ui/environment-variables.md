---
sidebar_position: 2
---

# Environment Variables

UI environment config lives in:

```txt
apps/ui/.env.local
apps/ui/src/env.mjs
apps/ui/src/lib/env-vars.ts
```

All variables are optional in `src/env.mjs`: the schema uses `@t3-oss/env-nextjs` and intentionally allows building without secrets baked in. Runtime code must still check that required values exist where they are used.

Use `getEnvVar()` from `src/lib/env-vars.ts` instead of reading `process.env` directly. It works in server code and client code, including values injected through CSR env injection.

## First-Run Values

For local development, the UI usually needs:

| Var                            | Purpose                                                        |
| ------------------------------ | -------------------------------------------------------------- |
| `STRAPI_URL`                   | Strapi base URL. Required at build if pre-rendering ISR pages. |
| `STRAPI_REST_READONLY_API_KEY` | Read-only Strapi API token for public content reads.           |
| `APP_PUBLIC_URL`               | Canonical URL and metadata base URL.                           |

If ISR pages render only at runtime, these can be supplied at runtime instead of build time. See [Docker Build](./docker-build.md) for the tradeoff.

## Read-Only API Token

Open [Strapi admin → Settings → API Tokens](http://localhost:1337/admin/settings/api-tokens), then open the seeded **Read Only** token and click **Regenerate**.

Set the generated value in:

```env
STRAPI_REST_READONLY_API_KEY=<paste-token-here>
```

The regenerated token is shown once.

## Custom API Token

Write operations (`POST`, `PUT`, `DELETE`) need a Custom token:

```env
STRAPI_REST_CUSTOM_API_KEY=<custom-token>
```

Create it in Strapi admin → Settings → API Tokens. Permissions are scoped manually per content type.

## Reference

| Var                                                   | Scope  | Used by                                                                                                                                                    |
| ----------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_PUBLIC_URL`                                      | server | Better Auth `baseURL`, URL formatting                                                                                                                      |
| `STRAPI_URL`                                          | server | Base URL for Strapi clients and proxy routes                                                                                                               |
| `STRAPI_REST_READONLY_API_KEY`                        | server | Public-proxy GET/HEAD auth; server-side reads                                                                                                              |
| `STRAPI_REST_CUSTOM_API_KEY`                          | server | Public-proxy writes (`POST`, `PUT`, `DELETE`)                                                                                                              |
| `BETTER_AUTH_SECRET`                                  | server | Encrypts Better Auth session cookie                                                                                                                        |
| `BASIC_AUTH_ENABLED` / `USERNAME` / `PASSWORD`        | server | Edge basic auth gate for staging                                                                                                                           |
| `IMGPROXY_URL`                                        | server | External image optimization service                                                                                                                        |
| `RECAPTCHA_SECRET_KEY`                                | server | reCAPTCHA v3 verification                                                                                                                                  |
| `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | server | Source-map upload at build time                                                                                                                            |
| `DEBUG_STRAPI_CLIENT_API_CALLS`                       | server | Verbose Strapi client logging                                                                                                                              |
| `NEXT_OUTPUT`                                         | server | Set to `export` for static build                                                                                                                           |
| `NEXT_PUBLIC_SENTRY_DSN`                              | client | Sentry browser SDK                                                                                                                                         |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`                      | client | reCAPTCHA widget                                                                                                                                           |
| `NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS`     | client | Sentry noise filter                                                                                                                                        |
| `NODE_ENV`                                            | shared | Standard Node.js environment mode. In this project it is `development` or `production`.                                                                    |
| `APP_ENV`                                             | shared | Project deployment environment label. Used when the app needs to distinguish deployments such as `testing` and `production` independently from `NODE_ENV`. |

## CSR Env Injection

CSR env injection lets a single Docker image serve multiple environments without rebuilding for every public config change.

The root layout reads selected env vars on the server and injects them into:

```ts
window.CSR_CONFIG
```

`getEnvVar()` reads from `window.CSR_CONFIG` on the client. Configure the allowlist via `CSR_ENVs` in:

```txt
apps/ui/src/app/[locale]/layout.tsx
```

:::danger Never inject secrets

`window.CSR_CONFIG` is serialized into the HTML response and is visible to anyone who views source or opens DevTools.

Only include values that are safe to publish: public API base URLs, GA/Sentry public DSNs, feature flags, or environment labels.

Never include API keys, JWTs, database URLs, Strapi `STRAPI_REST_*_API_KEY` values, OAuth client secrets, or any token that grants server-side access.

:::
