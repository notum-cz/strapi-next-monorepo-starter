---
sidebar_position: 3
---

# Environment Variables

UI environment config lives in:

```txt
apps/ui/.env.local
apps/ui/src/env.mjs
apps/ui/src/lib/env-vars.ts
```

All variables are optional in `src/env.mjs`: the schema uses [`@t3-oss/env-nextjs`](https://env.t3.gg/) and intentionally allows building without secrets baked in. Runtime code must still check that required values exist where they are used.

:::warning
Do not leave empty values such as `DATABASE_PASSWORD=` in `.env`. Empty values are treated as set, so default config fallbacks will not be used. Remove or comment the line when you want the default.
:::

:::tip Use `getEnvVar()`
Use `getEnvVar()` from `src/lib/env-vars.ts` instead of reading `process.env` directly. It works in server code and client code, including values injected through CSR env injection.
:::

```tsx
import { env } from "@/env.mjs"

import { getEnvVar } from "@/lib/env-vars"

// OK
console.log(getEnvVar("TEST_VARIABLE"))

// Also works, but prefer getEnvVar()
console.log(env.TEST_VARIABLE)

// Do not read process.env directly
console.log(process.env.TEST_VARIABLE)
```

## Strapi API Tokens

Strapi API tokens authenticate UI requests to the Strapi Content API. See the official [Strapi API Tokens docs](https://docs.strapi.io/cms/features/api-tokens).

### Read-Only Token

Open [Strapi admin → Settings → API Tokens](http://localhost:1337/admin/settings/api-tokens), then open the seeded **Read Only** token and click **Regenerate**.

Set the generated value in:

```env
STRAPI_REST_READONLY_API_KEY=<paste-token-here>
```

The regenerated token is shown once.

### Custom Token

Write operations (`POST`, `PUT`, `DELETE`) need a Custom token:

```env
STRAPI_REST_CUSTOM_API_KEY=<custom-token>
```

Create it in Strapi admin → Settings → API Tokens.

:::warning API token permissions are manual
Permissions are scoped manually per content type. Strapi currently does not provide a way to share API token permissions between environments through config files or another project-level sync mechanism.
:::

## Reference

<style>
{`
.env-reference-table col:first-child {
  width: 40%;
}

.env-reference-table td:first-child code {
  overflow-wrap: anywhere;
  white-space: normal;
}
`}
</style>

<table className="env-reference-table">
  <colgroup>
    <col />
    <col style={{ width: "10%" }} />
    <col style={{ width: "18%" }} />
    <col />
  </colgroup>
  <thead>
    <tr>
      <th>Var</th>
      <th>Scope</th>
      <th>Required</th>
      <th>Used by</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>APP_PUBLIC_URL</code></td>
      <td>server</td>
      <td>Yes</td>
      <td>Canonical URL and metadata base URL; Better Auth <code>baseURL</code>; URL formatting.</td>
    </tr>
    <tr>
      <td><code>STRAPI_URL</code></td>
      <td>server</td>
      <td>Yes</td>
      <td>Strapi base URL; Strapi clients; proxy routes. Required at build if pre-rendering ISR pages.</td>
    </tr>
    <tr>
      <td><code>STRAPI_REST_READONLY_API_KEY</code></td>
      <td>server</td>
      <td>Yes</td>
      <td>Read-only Strapi API token for public content reads; public-proxy GET/HEAD auth; server-side reads.</td>
    </tr>
    <tr>
      <td><code>STRAPI_REST_CUSTOM_API_KEY</code></td>
      <td>server</td>
      <td>When used</td>
      <td>Public-proxy writes (<code>POST</code>, <code>PUT</code>, <code>DELETE</code>).</td>
    </tr>
    <tr>
      <td><code>STRAPI_PREVIEW_SECRET</code></td>
      <td>server</td>
      <td>When used</td>
      <td>Strapi preview route and preview listener.</td>
    </tr>
    <tr>
      <td><code>BETTER_AUTH_SECRET</code></td>
      <td>server</td>
      <td>When auth is used</td>
      <td>Encrypts Better Auth session cookie.</td>
    </tr>
    <tr>
      <td><code>BASIC_AUTH_ENABLED</code></td>
      <td>server</td>
      <td>No</td>
      <td>Enables Basic Auth for the whole app when needed.</td>
    </tr>
    <tr>
      <td>
        <code>BASIC_AUTH_USERNAME</code><br />
        <code>BASIC_AUTH_PASSWORD</code>
      </td>
      <td>server</td>
      <td>When basic auth is enabled</td>
      <td>Credentials for the edge basic auth gate.</td>
    </tr>
    <tr>
      <td><code>IMGPROXY_URL</code></td>
      <td>server</td>
      <td>No</td>
      <td>External image optimization service.</td>
    </tr>
    <tr>
      <td><code>RECAPTCHA_SECRET_KEY</code></td>
      <td>server</td>
      <td>When reCAPTCHA is used</td>
      <td>reCAPTCHA v3 verification.</td>
    </tr>
    <tr>
      <td>
        <code>SENTRY_AUTH_TOKEN</code><br />
        <code>SENTRY_ORG</code><br />
        <code>SENTRY_PROJECT</code>
      </td>
      <td>server</td>
      <td>When source maps are uploaded</td>
      <td>Sentry source-map upload at build time.</td>
    </tr>
    <tr>
      <td><code>SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING</code></td>
      <td>server</td>
      <td>No</td>
      <td>Suppresses Sentry global error handler file warnings.</td>
    </tr>
    <tr>
      <td><code>DEBUG_STATIC_PARAMS_GENERATION</code></td>
      <td>server</td>
      <td>No</td>
      <td>Static params generation debug logging.</td>
    </tr>
    <tr>
      <td><code>DEBUG_STRAPI_CLIENT_API_CALLS</code></td>
      <td>server</td>
      <td>No</td>
      <td>Verbose Strapi client logging.</td>
    </tr>
    <tr>
      <td><code>SHOW_NON_BLOCKING_ERRORS</code></td>
      <td>server</td>
      <td>No</td>
      <td>Logs non-blocking runtime errors.</td>
    </tr>
    <tr>
      <td><code>NEXT_OUTPUT</code></td>
      <td>server</td>
      <td>No</td>
      <td>Keep undefined for local development, set to <code>standalone</code> for Docker builds, or <code>export</code> for static builds. See <a href="./docker-build">Docker Build</a> and <a href="./next-config">Next Configuration</a>.</td>
    </tr>
    <tr>
      <td><code>NEXT_PUBLIC_SENTRY_DSN</code></td>
      <td>client</td>
      <td>When Sentry is used</td>
      <td>Sentry browser SDK.</td>
    </tr>
    <tr>
      <td><code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code></td>
      <td>client</td>
      <td>When reCAPTCHA is used</td>
      <td>reCAPTCHA widget.</td>
    </tr>
    <tr>
      <td><code>NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS</code></td>
      <td>client</td>
      <td>No</td>
      <td>Sentry noise filter.</td>
    </tr>
    <tr>
      <td><code>NODE_ENV</code></td>
      <td>shared</td>
      <td>No</td>
      <td>Standard Node.js environment mode. In this project it is <code>development</code> or <code>production</code>.</td>
    </tr>
    <tr>
      <td><code>APP_ENV</code></td>
      <td>shared</td>
      <td>No</td>
      <td>Project deployment environment label. Used when the app needs to distinguish deployments such as <code>testing</code> and <code>production</code> independently from <code>NODE_ENV</code>.</td>
    </tr>
  </tbody>
</table>

## Environment Helpers

Use the helpers from `src/lib/general-helpers.ts` when code needs to branch by environment:

| Helper            | Reads      | Returns `true` when          |
| ----------------- | ---------- | ---------------------------- |
| `isProduction()`  | `APP_ENV`  | `APP_ENV` is `production`.   |
| `isTesting()`     | `APP_ENV`  | `APP_ENV` is `testing`.      |
| `isDevelopment()` | `NODE_ENV` | `NODE_ENV` is `development`. |

Use `APP_ENV` for deployment-specific behavior such as production-only SEO output or testing deployments. Use `NODE_ENV` for framework/runtime mode checks such as local development behavior.

## CSR Env Injection

CSR env injection lets the client/browser read selected environment values without rebuilding the whole frontend when those values change. In Docker, this also lets a single image serve multiple environments.

:::tip Prefer CSR injection for runtime public config
For public values that only need to be read by the browser at runtime, CSR env injection can avoid adding `NEXT_PUBLIC_*` variables that are baked into the frontend bundle during build.
:::

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
