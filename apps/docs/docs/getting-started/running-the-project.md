---
sidebar_position: 3
sidebar_label: "Running the Project"
description: "Start dev servers, create admin account, generate API token, and verify."
---

# Running the Project

## 1. Ensure Docker Desktop is running

Strapi needs a local PostgreSQL database. The dev command starts it automatically via `docker compose up -d db`, but Docker Desktop must be running first.

## 2. Start Strapi

```bash
pnpm dev:strapi
```

This runs `docker compose up -d db` (starts PostgreSQL in `apps/strapi/docker-compose.yml`) then `strapi develop`.

:::note
First run takes longer -- Strapi creates the database schema and builds the admin panel.
:::

## 3. Create Strapi admin account

Open [http://localhost:1337/admin](http://localhost:1337/admin). On first run, Strapi prompts you to create an admin account. Fill in the form and submit.

## 4. Create an API token

The Next.js frontend needs a read-only API token to fetch content from Strapi.

1. In Strapi admin, go to **Settings** > **API Tokens**
2. Click **Create new API Token**
3. Name: anything (e.g., `Frontend Read-Only`)
4. Token type: **Read-only**
5. Click **Save** and **copy the token**
6. Paste the token into `apps/ui/.env.local`:

```env title="apps/ui/.env.local"
STRAPI_REST_READONLY_API_KEY=your-copied-token-here
```

:::warning
This step is critical. Without the API token, the Next.js frontend will show blank pages -- all content fetches will fail silently.
:::

## 5. Start Next.js

In a separate terminal:

```bash
pnpm dev:ui
```

## 6. Verify

| Service          | URL                                                        | Expected                      |
| ---------------- | ---------------------------------------------------------- | ----------------------------- |
| Strapi Admin     | [http://localhost:1337/admin](http://localhost:1337/admin) | Admin dashboard               |
| Next.js Frontend | [http://localhost:3000](http://localhost:3000)             | Site with content from Strapi |

:::tip
You can start both apps simultaneously with `pnpm dev`, but logs from Strapi and Next.js will be interleaved. Running them in separate terminals makes debugging easier.
:::

:::danger
If the frontend shows blank pages or 404s, verify that `STRAPI_REST_READONLY_API_KEY` is set in `apps/ui/.env.local` and restart the Next.js dev server.
:::
