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

The Next.js frontend reads public content via a read-only Strapi API token.

Open [Strapi admin → Settings → API Tokens](http://localhost:1337/admin/settings/api-tokens), then open the seeded **Read Only** token and click **Regenerate**.

![Strapi API Tokens screen with the seeded Read Only token](/img/strapi-api-tokens-read-only.png)

**The regenerated token displays once.** Copy it.

## 3. Configure the UI app

Open `apps/ui/.env.local` (already created by `pnpm install`). Set:

```env
STRAPI_URL=http://localhost:1337
STRAPI_REST_READONLY_API_KEY=<paste-token-here>
```

Other variables are optional for first-run. See [Architecture → Environment Variables](../architecture.md#environment-variables) for the full list.

:::warning Write operations need a separate token

For write operations (`POST`, `PUT`, `DELETE`), set a Custom token in `STRAPI_REST_CUSTOM_API_KEY`. See [apps/ui/README](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/README.md#custom-api-token).

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

To watch Strapi requests in the UI logs, set `DEBUG_STRAPI_CLIENT_API_CALLS=true` in `.env.local`. See [Frontend Features → Log Verbosity](../frontend/frontend-features.md#log-verbosity-flags).

## Common next steps

- **Add a new content type** → [Add a New Content Type](./add-content-type.md)
- **Edit a page-builder component** → [Page Builder](../content-system/page-builder.md)
- **Hook up authentication** → [Authentication](../auth/frontend/authentication.md)
- **Change a Strapi schema** → run `pnpm generate:types && pnpm sync-types` after every change. [Strapi Types Usage](../content-system/strapi-types-usage.md).
- **Deploy** → [Deployment](../reference/deployment.md)

## Troubleshooting

| Symptom                                         | Likely cause                                                                                                                                                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `STRAPI_URL` undefined errors during UI build   | env var missing in `.env.local`                                                                                                                                                                                                            |
| UI shows 404 for `/`                            | Strapi missing baseline content. Run `pnpm seed:import`.                                                                                                                                                                                   |
| Strapi `pnpm dev:strapi` hangs on DB            | Docker not running or port 5432 already taken                                                                                                                                                                                              |
| `403 Forbidden` from Strapi on browser requests | Endpoint not in `ALLOWED_STRAPI_ENDPOINTS` ([request-auth.ts:3](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/strapi-api/request-auth.ts#L3)) or content-type permissions not granted in Strapi admin |
| Type errors after schema change                 | Forgot to run `pnpm generate:types && pnpm sync-types`                                                                                                                                                                                     |
