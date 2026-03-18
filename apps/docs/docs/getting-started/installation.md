---
sidebar_position: 2
sidebar_label: "Installation"
description: "Clone, install dependencies, and configure environment variables."
---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/AnotherDevBoy/strapi-next-monorepo-starter.git
cd strapi-next-monorepo-starter
```

## 2. Install dependencies

```bash
pnpm install
```

The `postinstall` hook runs `setup:apps`, which copies every `.env.example` file to its non-example counterpart using `cp -n` (no overwrite). After this step you will have:

- `apps/strapi/.env` (from `.env.example`)
- `apps/ui/.env.local` (from `.env.local.example`)

## 3. Configure Strapi environment

Open `apps/strapi/.env`. The database vars have working defaults for the local Docker PostgreSQL container. The following **secret vars** need random values:

| Variable           | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `APP_KEYS`         | Session cookie signing keys (comma-separated) |
| `API_TOKEN_SALT`   | Salt for hashing API tokens                   |
| `ADMIN_JWT_SECRET` | JWT secret for the admin panel                |
| `JWT_SECRET`       | JWT secret for the Users-Permissions plugin   |

:::tip
Generate secure random values with:

```bash
openssl rand -base64 32
```

Run it once per secret and paste each value into `apps/strapi/.env`.
:::

:::danger
**Empty values are treated as empty strings, not undefined.** Setting `DATABASE_PASSWORD=` (with nothing after `=`) means Strapi receives `""` -- default values will **not** be used. If you want the default, remove or comment the line entirely.
:::

For the full list of Strapi and UI environment variables, see the [Environment Variables Reference](pathname://../infrastructure/environment-variables).

## 4. Configure UI environment

Open `apps/ui/.env.local`. Key variables:

| Variable                       | Default                 | Notes                                                                                                               |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `STRAPI_URL`                   | `http://127.0.0.1:1337` | Works out of the box for local dev                                                                                  |
| `STRAPI_REST_READONLY_API_KEY` | _(empty)_               | Must be set **after** Strapi first run -- see [Running the Project](./running-the-project.md#4-create-an-api-token) |
| `APP_PUBLIC_URL`               | `http://localhost:3000` | Canonical frontend URL                                                                                              |

The API key cannot be generated until Strapi is running and you have created an admin account. The next page walks through that process.
