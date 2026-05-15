# 🔥 STRAPI — `@repo/strapi`

[Strapi v5](https://strapi.io/) backend for the Strapi + Next.js Monorepo Starter.

Conceptual + feature docs live in [/apps/docs](../docs/docs). This README covers **setup and deployment** only.

- [Architecture](../docs/docs/architecture.md) — request lifecycle, document middleware, draft mode
- [Strapi Plugins](../docs/docs/strapi/strapi-plugins.md) — CKEditor, Tiptap, upload (Azure/S3), email (Mailgun/Mailtrap), Sentry, cron, config-sync
- [Strapi Schemas](../docs/docs/content-system/strapi-schemas.md) · [Strapi Types Usage](../docs/docs/content-system/strapi-types-usage.md) · [Pages Hierarchy](../docs/docs/content-system/pages-hierarchy.md)
- [Data Seeding](../docs/docs/strapi/data-seeding.md) · [Add a Content Type](../docs/docs/getting-started/add-content-type.md)
- SSO: [Microsoft (admin)](../docs/docs/auth/microsoft-sso.md) · [OAuth (end-users)](../docs/docs/auth/oauth-providers.md)

## 🥞 Stack

- Strapi 5 · TypeScript · Node 24
- Postgres 16 alpine (local Docker)
- Plugins: i18n · sentry · users-permissions · @notum-cz/strapi-plugin-tiptap-editor · @\_sh/strapi-plugin-ckeditor · strapi-plugin-config-sync
- Providers: AWS S3 + Azure Blob (upload); Mailgun + Mailtrap (email)

## 🚀 Get Up and Develop

### 1. Environment variables

Copy `.env.example` → `.env` and fill values. Most defaults work as-is; tweak for your setup.

:::tip
Use `ADMIN_PANEL_CONFIG_API_AUTH_TOKEN` to inject runtime env vars into the Strapi admin without rebuilding. The admin panel reads `window.STRAPI_ADMIN_CONFIG` on bootstrap. Disabled by default — set the token (`openssl rand -base64 32`) to enable. Configure values served from the [admin-panel-config service](./src/api/admin-panel-config/services/admin-panel-config.ts). Lets you skip the `STRAPI_ADMIN_` env prefix and avoid baking values into the bundle.
:::

### 2. Run locally (with hot-reloading)

All commands from the **monorepo root**.

Preferred: **Postgres in Docker, Strapi locally.**

```bash
nvm use
pnpm install

# one command — starts both Postgres (docker) and Strapi
pnpm dev:strapi
```

Manual variant (Postgres separately, plain Strapi without auto-seed):

```bash
pnpm run:db                          # Postgres in Docker
pnpm -F @repo/strapi run develop     # Strapi (auto-seed runner)
```

Alternative: run Strapi in Docker too. The current [Dockerfile](Dockerfile) is **production-only** — see below.

#### Default dev addresses

- Strapi: [http://localhost:1337](http://localhost:1337)
- Admin panel: [http://localhost:1337/admin](http://localhost:1337/admin)
- Postgres: [http://localhost:5432](http://localhost:5432)

### 3. Initialize database (first run)

`pnpm dev:strapi` auto-seeds Strapi from the latest timestamped export when baseline content (`Page`, `Navbar`, `Footer`) is missing.

Seed scripts use `bash`. On Windows, run from WSL, Git Bash, or another shell with Bash available.

```bash
pnpm seed:check
pnpm seed:import
pnpm seed:export
```

See [Data Seeding](../docs/docs/strapi/data-seeding.md) for the full flow and PR workflow.

### 4. Sync configuration

Strapi admin → **Settings → Config Sync → Tools** → **Import**. Loads role/permission/setting JSON files into the database.

See [Strapi Plugins → config-sync](../docs/docs/strapi/strapi-plugins.md#config-sync).

## 🛠️ Production Docker

Builds Strapi for production per Strapi's official guidance.

:::warning
Turborepo requires root `package.json`, `pnpm-lock.yaml`, and `turbo.json`. Run `docker build` from the monorepo root, not from `apps/strapi`. [Reference](https://turbo.build/repo/docs/handbook/deploying-with-docker)
:::

### Build

```bash
# from monorepo root
docker build -t starter-strapi:latest -f apps/strapi/Dockerfile .

# override admin panel public URL
docker build -t starter-strapi:latest -f apps/strapi/Dockerfile \
  --build-arg APP_URL=https://cms.example.com .
```

### Run

```bash
docker run -it --rm --name starter-strapi -p 1337:1337 \
  --env-file apps/strapi/.env starter-strapi:latest
```

To change the port, set `PORT` in `.env` **and** in the `docker run -p` flag (`host:container`).

### Connect to Postgres in Docker

Strapi requires Postgres to be reachable before it starts. No production `docker-compose.yml` ships with both services bundled — typically run separately (DB in one container/cloud, Strapi in another).

**A. Connection string / credentials in `.env`:**

```env
DATABASE_URL=postgres://user:password@host:port/database
# or split: DATABASE_NAME, DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_PASSWORD
```

**B. Two local Docker containers on a shared network:**

```bash
# Postgres
docker compose up -d db

# .env — host = "db" (compose service name) or host IP
DATABASE_HOST=db

# Strapi attached to the same network defined in docker-compose.yml
docker run -it --rm --name starter-strapi -p 1337:1337 \
  --env-file apps/strapi/.env \
  --network=strapi-next-starter_db_network \
  starter-strapi:latest
```

## Strapi-specific features

These features are configured in this app but documented separately:

- **Pages hierarchy** — parent/child pages with auto `fullPath`. See [Pages Hierarchy](../docs/docs/content-system/pages-hierarchy.md).
- **`utilities.link` component** — internal/external link abstraction with icons, sizes, shadcn-aligned variants. Internal links are relations to collections, so they survive `fullPath` changes.
- **Document middleware (relation population)** — the `populateDynamicZone` request param triggers automatic deep population. Avoids hand-maintaining populate trees. See [Architecture → Request Lifecycle](../docs/docs/architecture.md#request-lifecycle--page-render) + [Page Builder](../docs/docs/content-system/page-builder.md).
- **TypeScript generation** — from monorepo root: `pnpm generate:types && pnpm sync-types`. See [Strapi Types Usage](../docs/docs/content-system/strapi-types-usage.md).
- **Lifecycle hooks** — `afterCreate` subscribers in [`src/lifeCycles/`](./src/lifeCycles/). User registration email is set up but **disabled by default** (commented out). Enable email plugin first or registrations will fail. See [Strapi Schemas → Lifecycle Subscribers](../docs/docs/content-system/strapi-schemas.md#lifecycle-subscribers).
- **Rich text editors (CKEditor + Tiptap)** — see [Strapi Plugins → Rich Text](../docs/docs/strapi/strapi-plugins.md#rich-text-editors).
- **Upload providers (Azure / S3 / local)** — see [Strapi Plugins → Upload](../docs/docs/strapi/strapi-plugins.md#upload-providers).
- **Email providers (Mailgun / Mailtrap)** — see [Strapi Plugins → Email](../docs/docs/strapi/strapi-plugins.md#email-providers).
- **OAuth (GitHub/Google/etc.)** — see [OAuth Providers](../docs/docs/auth/oauth-providers.md).
- **Admin SSO (Microsoft Entra ID)** — see [Microsoft SSO](../docs/docs/auth/microsoft-sso.md). Requires `STRAPI_LICENSE` (Enterprise feature). When behind an HTTPS-terminating proxy, enable `proxy: { koa: true }` in `config/server.ts` for secure cookies.
- **Live previews** — set `STRAPI_PREVIEW_ENABLED=true`, `CLIENT_URL`, `STRAPI_PREVIEW_SECRET` (matching frontend). See [Architecture → Draft Mode](../docs/docs/architecture.md#draft-mode--preview).
- **Cron jobs** — defined in [`config/cron-tasks.ts`](./config/cron-tasks.ts), enabled via `CRON_ENABLED=true`.

## Data transfer between environments

From monorepo root: `pnpm transfer:strapi` for full Strapi transfer. For local development use `pnpm seed:export` / `pnpm seed:import`. See [Data Seeding](../docs/docs/strapi/data-seeding.md) and [Strapi data management docs](https://docs.strapi.io/dev-docs/data-management).

## Health check

`GET /api/health` returns a small JSON payload. Used for uptime probes.
