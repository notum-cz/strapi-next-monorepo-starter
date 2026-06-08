---
sidebar_position: 1
---

# Installation

Use this page when you only need the shortest path to run `apps/strapi` locally.

:::tip Full monorepo setup
For the full monorepo setup, start with [Getting Started > Installation](../getting-started/installation.md).
:::

## 1. Environment Variables

Copy the example file:

```bash
cp apps/strapi/.env.example apps/strapi/.env
```

Update values in `apps/strapi/.env`. The default example is prepared for local PostgreSQL through Docker.

For the full variable list and optional providers, see [Environment Variables](./environment-variables.md).

## 2. Run Locally

:::info Docker for PostgreSQL
Local Strapi development uses `apps/strapi/docker-compose.yml` to start PostgreSQL. Keep Docker running before `pnpm dev:strapi`.
:::

:::warning
Run Strapi development commands from the monorepo root. `pnpm dev:strapi` depends on workspace and Turbo context from the root project.
:::

```bash
nvm use
pnpm install
pnpm dev:strapi
```

`pnpm dev:strapi` starts the local PostgreSQL container and then starts Strapi. The admin panel runs on [http://localhost:1337/admin](http://localhost:1337/admin).

Use `pnpm dev` if you want to start the whole monorepo.
