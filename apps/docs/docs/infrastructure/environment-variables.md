---
sidebar_position: 2
sidebar_label: "Environment Variables"
description: "Complete reference for all environment variables in both Strapi and Next.js apps."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Environment Variables

Both apps use `.env` files bootstrapped from `.example` templates on `pnpm install` (the `postinstall` script runs `setup:apps`, which copies `.example` files via `cp -n`). Strapi reads raw `process.env`. The UI app validates and types variables through `@t3-oss/env-nextjs`.

:::danger

Empty env values like `DATABASE_PASSWORD=` are treated as **empty strings**, not undefined. Default values will NOT be used for Strapi vars. Remove or comment the line instead.

:::

## Strapi Variables

File: `apps/strapi/.env` (copied from `apps/strapi/.env.example`)

<Tabs>
  <TabItem value="general" label="General" default>

| Name                          | Required | Default                 | Secret | Description                                                  |
| ----------------------------- | -------- | ----------------------- | ------ | ------------------------------------------------------------ |
| `HOST`                        | No       | `0.0.0.0`               |        | Strapi listen host                                           |
| `PORT`                        | No       | `1337`                  |        | Strapi listen port                                           |
| `APP_KEYS`                    | Yes      | --                      | secret | Session cookie signing keys (comma-separated base64)         |
| `API_TOKEN_SALT`              | Yes      | --                      | secret | Salt for hashing API tokens                                  |
| `ADMIN_JWT_SECRET`            | Yes      | --                      | secret | Admin panel JWT signing secret                               |
| `JWT_SECRET`                  | Yes      | --                      | secret | Users-Permissions plugin JWT secret                          |
| `TRANSFER_TOKEN_SALT`         | No       | --                      | secret | Token salt for data transfer between instances               |
| `CRON_ENABLED`                | No       | `false`                 |        | Enable cron jobs                                             |
| `APP_URL`                     | No       | `http://localhost:1337` |        | Public URL of Strapi                                         |
| `STRAPI_ADMIN_BACKEND_URL`    | No       | --                      |        | Admin panel backend URL (consumed by custom plugin frontend) |
| `WEBHOOKS_POPULATE_RELATIONS` | No       | `false`                 |        | Include populated relations in webhook payloads              |

  </TabItem>
  <TabItem value="database" label="Database">

| Name                     | Required | Default        | Secret | Description                                              |
| ------------------------ | -------- | -------------- | ------ | -------------------------------------------------------- |
| `DATABASE_URL`           | No       | --             | secret | Full connection string (overrides individual vars below) |
| `DATABASE_CLIENT`        | No       | `postgres`     |        | Database client (`postgres` or `sqlite`)                 |
| `DATABASE_HOST`          | No       | `0.0.0.0`      |        | Database host                                            |
| `DATABASE_PORT`          | No       | `5432`         |        | Database port                                            |
| `DATABASE_NAME`          | No       | `strapi-db`    |        | Database name                                            |
| `DATABASE_USERNAME`      | No       | `admin`        |        | Database user                                            |
| `DATABASE_PASSWORD`      | No       | --             | secret | Database password                                        |
| `DATABASE_SSL`           | No       | `false`        |        | Enable SSL for database connection                       |
| `DATABASE_SSL_*`         | No       | --             | secret | SSL certificate fields (`KEY`, `CERT`, `CA`, etc.)       |
| `TEST_DATABASE_FILENAME` | No       | `.tmp/test.db` |        | SQLite test database path                                |

:::tip
For local development the Docker PostgreSQL container uses `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and `DATABASE_NAME` from this same `.env` file.
:::

  </TabItem>
  <TabItem value="services" label="Services">

**AWS S3 Storage** -- all optional, falls back to local filesystem uploads.

| Name                     | Required | Default        | Secret | Description                             |
| ------------------------ | -------- | -------------- | ------ | --------------------------------------- |
| `AWS_ACCESS_KEY_ID`      | No       | --             | secret | AWS access key                          |
| `AWS_ACCESS_SECRET`      | No       | --             | secret | AWS secret key                          |
| `AWS_REGION`             | No       | --             |        | AWS region (e.g. `eu-central-1`)        |
| `AWS_BUCKET`             | No       | --             |        | S3 bucket name                          |
| `AWS_ACL`                | No       | `public-read`  |        | Object ACL (`public-read` or `private`) |
| `AWS_SIGNED_URL_EXPIRES` | No       | `900` (15 min) |        | Signed URL expiration in seconds        |
| `CDN_URL`                | No       | --             |        | Custom CDN domain for asset URLs        |
| `CDN_ROOT_PATH`          | No       | --             |        | CDN root path prefix                    |

**Mailgun** -- production email provider.

| Name              | Required | Default                      | Secret | Description                   |
| ----------------- | -------- | ---------------------------- | ------ | ----------------------------- |
| `MAILGUN_API_KEY` | No       | --                           | secret | Mailgun API key               |
| `MAILGUN_DOMAIN`  | No       | --                           |        | Mailgun sending domain        |
| `MAILGUN_HOST`    | No       | `https://api.eu.mailgun.net` |        | Mailgun API host              |
| `MAILGUN_EMAIL`   | No       | --                           |        | Default from/reply-to address |

**Mailtrap** -- development email testing.

| Name             | Required | Default | Secret | Description                       |
| ---------------- | -------- | ------- | ------ | --------------------------------- |
| `MAILTRAP_USER`  | No       | --      | secret | Mailtrap SMTP user                |
| `MAILTRAP_PASS`  | No       | --      | secret | Mailtrap SMTP password            |
| `MAILTRAP_HOST`  | No       | --      |        | Mailtrap SMTP host                |
| `MAILTRAP_PORT`  | No       | --      |        | Mailtrap SMTP port                |
| `MAILTRAP_EMAIL` | No       | --      |        | Default from address for Mailtrap |

**Monitoring**

| Name         | Required | Default | Secret | Description                    |
| ------------ | -------- | ------- | ------ | ------------------------------ |
| `SENTRY_DSN` | No       | --      |        | Sentry DSN for error reporting |

  </TabItem>
  <TabItem value="preview" label="Preview">

| Name                                | Required | Default                 | Secret | Description                                             |
| ----------------------------------- | -------- | ----------------------- | ------ | ------------------------------------------------------- |
| `CLIENT_URL`                        | No       | `http://localhost:3000` |        | Frontend base URL (used by backend to generate links)   |
| `STRAPI_PREVIEW_ENABLED`            | No       | `false`                 |        | Enable Strapi preview feature (`"true"` to enable)      |
| `STRAPI_PREVIEW_SECRET`             | No       | --                      | secret | Shared secret for draft mode between Strapi and Next.js |
| `CLIENT_ACCOUNT_ACTIVATION_URL`     | No       | --                      |        | Frontend URL for account activation emails              |
| `ADMIN_PANEL_CONFIG_API_AUTH_TOKEN` | No       | --                      | secret | Token for injecting runtime config into admin panel     |

  </TabItem>
</Tabs>

## UI Variables

File: `apps/ui/.env.local` (copied from `apps/ui/.env.local.example`)

<Tabs>
  <TabItem value="strapi-connection" label="Strapi Connection" default>

| Name                           | Required         | Default | Secret | Description                                       |
| ------------------------------ | ---------------- | ------- | ------ | ------------------------------------------------- |
| `STRAPI_URL`                   | Yes (runtime)    | --      | secret | Strapi server URL (hidden from browser via proxy) |
| `STRAPI_REST_READONLY_API_KEY` | Yes (runtime)    | --      | secret | Read-only API key created in Strapi admin         |
| `STRAPI_REST_CUSTOM_API_KEY`   | No               | --      | secret | API key with custom permissions                   |
| `STRAPI_PREVIEW_SECRET`        | Yes (if preview) | --      | secret | Shared preview secret (must match Strapi)         |

:::warning
`STRAPI_REST_READONLY_API_KEY` is empty in the template. You must create an API token in **Strapi Admin > Settings > API Tokens** and paste it here, or the UI will show no content.
:::

  </TabItem>
  <TabItem value="auth" label="Auth">

| Name                 | Required      | Default | Secret | Description                               |
| -------------------- | ------------- | ------- | ------ | ----------------------------------------- |
| `BETTER_AUTH_SECRET` | Yes (runtime) | --      | secret | Session encryption secret for Better Auth |

  </TabItem>
  <TabItem value="app" label="App">

| Name                                              | Required      | Default                 | Secret | Description                                                    |
| ------------------------------------------------- | ------------- | ----------------------- | ------ | -------------------------------------------------------------- |
| `APP_PUBLIC_URL`                                  | Yes (runtime) | `http://localhost:3000` |        | Canonical URL for sitemap, SEO tags, and navigation            |
| `APP_ENV`                                         | No            | --                      |        | Deployment environment (`testing` or `production`)             |
| `NODE_ENV`                                        | No            | --                      |        | Node environment (`development` or `production`)               |
| `NEXT_OUTPUT`                                     | No            | --                      |        | Build output mode: `standalone`, `export`, or omit for default |
| `DEBUG_STATIC_PARAMS_GENERATION`                  | No            | `false`                 |        | Log `generateStaticParams` output during build                 |
| `SHOW_NON_BLOCKING_ERRORS`                        | No            | `false`                 |        | Show non-blocking error logs in the UI                         |
| `DEBUG_STRAPI_CLIENT_API_CALLS`                   | No            | `false`                 |        | Log Strapi client API calls                                    |
| `NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS` | No            | --                      |        | Suppress unused component/function warnings                    |

  </TabItem>
  <TabItem value="services" label="Services">

**Sentry** -- error monitoring.

| Name                     | Required | Default | Secret | Description                             |
| ------------------------ | -------- | ------- | ------ | --------------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN` | No       | --      |        | Sentry DSN (inlined into client bundle) |
| `SENTRY_AUTH_TOKEN`      | No       | --      | secret | Auth token for source map uploads       |
| `SENTRY_ORG`             | No       | --      |        | Sentry organization slug                |
| `SENTRY_PROJECT`         | No       | --      |        | Sentry project slug                     |

**reCAPTCHA v3**

| Name                             | Required | Default | Secret | Description                        |
| -------------------------------- | -------- | ------- | ------ | ---------------------------------- |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | No       | --      |        | reCAPTCHA site key (client-side)   |
| `RECAPTCHA_SECRET_KEY`           | No       | --      | secret | reCAPTCHA secret key (server-side) |

  </TabItem>
  <TabItem value="basic-auth" label="Basic Auth">

For staging environments behind HTTP Basic Authentication.

| Name                  | Required | Default | Secret | Description                               |
| --------------------- | -------- | ------- | ------ | ----------------------------------------- |
| `BASIC_AUTH_ENABLED`  | No       | `false` |        | Enable HTTP Basic Auth (`true` to enable) |
| `BASIC_AUTH_USERNAME` | No       | --      | secret | Basic Auth username                       |
| `BASIC_AUTH_PASSWORD` | No       | --      | secret | Basic Auth password                       |

  </TabItem>
</Tabs>

## Copy-Pasteable .env Blocks

<Tabs>
  <TabItem value="strapi-env" label="Strapi (.env)" default>

```bash title="apps/strapi/.env"
# ----- Strapi general -----
HOST=0.0.0.0
PORT=1337
APP_KEYS=l8ftzyp2hNmEtNXBYU5hhQ==,lH7EcVVZxIoTFRorjrV9Vw==,jxWii7EjavRgJ4jYPZ60hA==,FlZM4tyij/HDFcKZhsmlXQ==
API_TOKEN_SALT=usReW/cYjLHmpLEoRnWf+g==
ADMIN_JWT_SECRET=Xw39b/xXxEHW1x1WMM6ugQ==
JWT_SECRET=ShuOcfjTi/RwcchWEIKYKA==
# TRANSFER_TOKEN_SALT=
# CRON_ENABLED=
APP_URL=http://localhost:1337
# STRAPI_ADMIN_BACKEND_URL=http://localhost:1337
# WEBHOOKS_POPULATE_RELATIONS=

# ----- Database -----
# DATABASE_URL=
DATABASE_CLIENT=postgres
DATABASE_HOST=0.0.0.0
DATABASE_PORT=5432
DATABASE_NAME=strapi-db
DATABASE_USERNAME=admin
DATABASE_PASSWORD=mFm8z7z8
DATABASE_SSL=false

# ----- AWS S3 storage -----
# AWS_ACCESS_KEY_ID=
# AWS_ACCESS_SECRET=
# AWS_REGION=
# AWS_BUCKET=
# AWS_ACL=
# AWS_SIGNED_URL_EXPIRES=
# CDN_URL=
# CDN_ROOT_PATH=

# ----- Mailgun -----
# MAILGUN_API_KEY=
# MAILGUN_DOMAIN=
# MAILGUN_HOST=
# MAILGUN_EMAIL=

# ----- Mailtrap -----
# MAILTRAP_USER=
# MAILTRAP_PASS=
# MAILTRAP_HOST=
# MAILTRAP_PORT=
# MAILTRAP_EMAIL=

# ----- Sentry -----
# SENTRY_DSN=

# ----- Strapi Preview -----
CLIENT_URL=http://localhost:3000
STRAPI_PREVIEW_ENABLED=true
STRAPI_PREVIEW_SECRET=your-secret-key

# ----- Other -----
# CLIENT_ACCOUNT_ACTIVATION_URL=http://localhost:3000/auth/activate
# ADMIN_PANEL_CONFIG_API_AUTH_TOKEN=your-secure-random-token-here
```

  </TabItem>
  <TabItem value="ui-env" label="Next.js (.env.local)">

```bash title="apps/ui/.env.local"
# ----- Next.js settings -----
NEXT_OUTPUT=standalone
# DEBUG_STATIC_PARAMS_GENERATION=true
# SHOW_NON_BLOCKING_ERRORS=true
# DEBUG_STRAPI_CLIENT_API_CALLS=true

# ----- BetterAuth -----
# BETTER_AUTH_SECRET=password_secret

# ----- Strapi connection -----
STRAPI_URL=http://127.0.0.1:1337
STRAPI_REST_READONLY_API_KEY=
STRAPI_REST_CUSTOM_API_KEY=

# ----- Sentry -----
# NEXT_PUBLIC_SENTRY_DSN=
# SENTRY_AUTH_TOKEN=
# SENTRY_ORG=
# SENTRY_PROJECT=
SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1

# ----- reCAPTCHA v3 -----
# NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
# RECAPTCHA_SECRET_KEY=

# ----- Basic Auth -----
# BASIC_AUTH_ENABLED=true
# BASIC_AUTH_USERNAME=
# BASIC_AUTH_PASSWORD=

# ----- App settings -----
APP_PUBLIC_URL=http://localhost:3000
# NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS=true

# ----- Preview -----
STRAPI_PREVIEW_SECRET=your-secret-key
```

  </TabItem>
</Tabs>

## Typed Validation (`@t3-oss/env-nextjs`)

The UI app validates environment variables at startup using `@t3-oss/env-nextjs` with Zod schemas. The schema lives in a single file:

```ts title="apps/ui/src/env.mjs"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  emptyStringAsUndefined: true,

  server: {
    STRAPI_URL: z.string().url().optional(),
    STRAPI_REST_READONLY_API_KEY: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().optional(),
    // ...
  },

  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
    // ...
  },

  shared: {
    NODE_ENV: z.enum(["development", "production"]).optional(),
    APP_ENV: z.enum(["testing", "production"]).optional(),
  },

  runtimeEnv: {
    STRAPI_URL: process.env.STRAPI_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
    // ... every var must be destructured here
  },
})
```

The schema has three sections:

| Section  | Access                                    | Prefix Rule             | Purpose                     |
| -------- | ----------------------------------------- | ----------------------- | --------------------------- |
| `server` | Server only (SSR, API routes, middleware) | No prefix               | Secrets, backend URLs, keys |
| `client` | Server + browser                          | Must use `NEXT_PUBLIC_` | Public keys, DSNs           |
| `shared` | Both                                      | Either                  | `NODE_ENV`, `APP_ENV`       |

The `runtimeEnv` block is required by Next.js -- it manually destructures `process.env` so the bundler can tree-shake and inline values correctly.

`emptyStringAsUndefined: true` converts `""` to `undefined` before validation, matching the behavior described in the danger admonition above.

:::warning
All server vars are marked `.optional()` for Docker build compatibility. The image can be built without any env vars baked in. Validation happens at **runtime**, not build time.
:::

**Adding a new env var:**

1. Add the Zod schema to the appropriate section (`server`, `client`, or `shared`) in `apps/ui/src/env.mjs`
2. Add the `process.env` destructure to `runtimeEnv`
3. Add a default/example value to `apps/ui/.env.local.example`

## `NEXT_PUBLIC_` vs Server-Only

Next.js inlines `NEXT_PUBLIC_*` variables into the client JavaScript bundle **at build time**. They are visible to anyone inspecting the page source. Use them only for values safe to expose (Sentry DSN, reCAPTCHA site key).

Server-only variables (no `NEXT_PUBLIC_` prefix) are available exclusively in server components, API routes, and middleware. Accessing a server variable from a client component throws at runtime via the `@t3-oss/env-nextjs` guard.

:::note
If you need different `NEXT_PUBLIC_*` values per deployment without rebuilding, you cannot -- they are baked at build time. Use the CSR_CONFIG injection pattern below instead.
:::

## Browser Injection (CSR_CONFIG)

For variables that must be **runtime-dynamic on the client** (not baked at build time), the app injects them into `window.CSR_CONFIG` at page load.

The root layout defines which vars to expose:

```tsx title="apps/ui/src/app/[locale]/layout.tsx"
const CSR_ENVs = [
  "NODE_ENV",
  "DEBUG_STRAPI_CLIENT_API_CALLS",
  "SHOW_NON_BLOCKING_ERRORS",
  "APP_PUBLIC_URL",
]

// Injected in <head> as a beforeInteractive script:
<Script id="csr-config" strategy="beforeInteractive">
  {`window.CSR_CONFIG = window.CSR_CONFIG || {};
    window.CSR_CONFIG = ${JSON.stringify(
      CSR_ENVs.reduce((acc, curr) => {
        acc[curr] = process.env?.[curr]
        return acc
      }, {})
    )};`}
</Script>
```

The `getEnvVar()` helper reads from the validated `env` object first, then falls back to `window.CSR_CONFIG` on the client:

```ts title="apps/ui/src/lib/env-vars.ts"
export const getEnvVar = <K extends keyof typeof env>(
  varName: K,
  throwIfMissing = false
): (typeof env)[K] | undefined => {
  try {
    const value = env[varName]
    if (!value || value === "") {
      throw new Error(
        `Environment variable ${varName} is not defined or is empty.`
      )
    }
    return value
  } catch (e: unknown) {
    // Fallback: check window.CSR_CONFIG on client side
    if (typeof window !== "undefined" && globalThis.CSR_CONFIG?.[varName]) {
      return globalThis.CSR_CONFIG?.[varName]
    }
    if (throwIfMissing) throw e
  }
}
```

:::note
Variables exposed via `CSR_CONFIG`: `NODE_ENV`, `DEBUG_STRAPI_CLIENT_API_CALLS`, `SHOW_NON_BLOCKING_ERRORS`, `APP_PUBLIC_URL`. These are intentionally **not** secret -- they control debug behavior and public URLs.
:::
