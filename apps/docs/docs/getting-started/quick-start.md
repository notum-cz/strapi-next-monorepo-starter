---
sidebar_position: 2
---

# Quick Start

Get both apps running locally and rendering a page in under 10 minutes. Assumes [Installation](./installation.md) is complete.

:::important Run from monorepo root

All app commands run from the **monorepo root** via Turbo (`pnpm dev:strapi`, `pnpm dev:ui`, etc.). Don't `cd` into individual apps — Turbo orchestrates dependencies, env loading, and task ordering across the workspace.

:::

## 1. Start Strapi (with Postgres)

```bash
pnpm dev:strapi
```

This:

1. Boots Postgres in Docker (`pnpm run:db` under the hood).
2. Auto-imports the latest seed export when baseline content (`Page`, `Navbar`, `Footer`) is missing. See [Data Seeding](../strapi/data-seeding.md).
3. Starts Strapi in develop mode with hot reload.

Default endpoints:

| Service      | Endpoint                                                   |
| ------------ | ---------------------------------------------------------- |
| Strapi REST  | [http://localhost:1337](http://localhost:1337)             |
| Strapi admin | [http://localhost:1337/admin](http://localhost:1337/admin) |
| Postgres     | Docker service `db`, published to host port `5432`         |

On first run, Strapi prompts you to create an admin user in the admin panel.

## 2. Regenerate the Strapi API token

The Next.js UI reads public content via a read-only Strapi API token.

Open [Strapi admin → Settings → API Tokens](http://localhost:1337/admin/settings/api-tokens), then open the seeded **Read Only** token and click **Regenerate**.

![Strapi API Tokens screen with the seeded Read Only token](/img/strapi-api-tokens-read-only.png)

**The regenerated token displays once.** Copy it.

## 3. Configure the UI app

Open `apps/ui/.env.local` (already created by `pnpm install`). Set:

```env
STRAPI_URL=http://localhost:1337
STRAPI_REST_READONLY_API_KEY=<paste-token-here>
```

Other variables are optional for first-run. See [UI → Environment Variables](../ui/environment-variables.md) for the full list.

:::warning Write operations need a separate token

For write operations (`POST`, `PUT`, `DELETE`), set a Custom token in `STRAPI_REST_CUSTOM_API_KEY`. See `apps/ui/README.md#custom-api-token`.

:::

## 4. Start the UI

In a second terminal, from monorepo root:

```bash
pnpm dev:ui
```

UI runs on [http://localhost:3000](http://localhost:3000) — open it.

You should see the seeded landing page rendered through the page-builder. The default locale is `en`; `/cs` is also configured.

## 5. Verify the loop

| URL                                                                                            | What you should see                         |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [http://localhost:3000](http://localhost:3000)                                                 | Seeded homepage                             |
| [http://localhost:3000/api/health](http://localhost:3000/api/health)                           | `{"data":"OK"}` (UI)                        |
| [http://localhost:1337/api/health](http://localhost:1337/api/health)                           | health JSON (Strapi)                        |
| [http://localhost:3000/dev/components-overview](http://localhost:3000/dev/components-overview) | dev-only catalog of page-builder components |

## Common next steps

[![Launch Strapi + Next.js Monorepo — Live in 5 Minutes](https://img.youtube.com/vi/VZlJZuurUH8/maxresdefault.jpg)](https://www.youtube.com/watch?v=VZlJZuurUH8 "Watch on YouTube")

- **Explore included features** → [Features](./features.md)
- **Add a new content type** → [Add a New Content Type](./add-content-type.md)
- **Edit a page-builder component** → [Page Builder](../page-builder/introduction.md)

## Troubleshooting

| Symptom                                       | Likely cause                                             |
| --------------------------------------------- | -------------------------------------------------------- |
| `STRAPI_URL` undefined errors during UI build | env var missing in `.env.local`                          |
| UI shows 404 for `/`                          | Strapi missing baseline content. Run `pnpm seed:import`. |
| Strapi `pnpm dev:strapi` hangs on DB          | Docker not running or port 5432 already taken            |
