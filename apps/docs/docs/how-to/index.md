---
sidebar_position: 1
---

# How to...

Short answers for common project setup and maintenance tasks.

<details>
<summary>How to set Strapi License?</summary>

Set `STRAPI_LICENSE` in the environment for the Strapi app.

For local development, add it to `apps/strapi/.env`:

```bash
STRAPI_LICENSE=
```

For deployed environments, configure the same variable in the hosting provider for `apps/strapi`.

See [Strapi Environment Variables](../strapi/environment-variables.md).

</details>

<details>
<summary>How to start the project locally?</summary>

Run commands from the monorepo root, not from `apps/ui` or `apps/strapi`:

```bash
pnpm dev
```

For separate terminals:

```bash
pnpm dev:strapi
pnpm dev:ui
```

`pnpm dev:strapi` starts the local Postgres service through Docker and runs the seed check before Strapi starts.

See [Quick Start](../getting-started/quick-start.md) and [Commands Reference](../reference/commands.md).

</details>

<details>
<summary>How to fix UI errors about missing `STRAPI_URL` or Strapi API token?</summary>

Set the UI Strapi connection values in `apps/ui/.env.local`:

```env
STRAPI_URL=http://localhost:1337
STRAPI_REST_READONLY_API_KEY=<read-only-token>
```

Generate the token in Strapi admin: Settings -> API Tokens -> open the seeded **Read Only** token -> **Regenerate**.

The token is displayed once. If you lose it, regenerate it again and replace the value in `apps/ui/.env.local`.

See [Quick Start: Regenerate the Strapi API token](../getting-started/quick-start.md#2-regenerate-the-strapi-api-token) and [UI Environment Variables](../ui/environment-variables.md#strapi-api-tokens).

</details>

<details>
<summary>How to fix a 404 or empty homepage after first setup?</summary>

First check that `apps/ui/.env.local` has a valid read-only Strapi API token:

```env
STRAPI_REST_READONLY_API_KEY=<read-only-token>
```

If the token is missing or stale, regenerate the seeded **Read Only** token in Strapi admin and restart the UI.

If the API key is correct, the local Strapi database is usually missing baseline content. Import the latest seed export:

```bash
pnpm seed:import
```

Then restart Strapi and the UI if they were already running.

If you need to check whether baseline content exists before importing:

```bash
pnpm seed:check
```

Seed imports overwrite existing Strapi data, so preserve local CMS work before importing over it.

You can also fill the data manually in Strapi admin: create the homepage in `Page`, then create the `Navbar` and `Footer` single type entries.

See [Quick Start: Regenerate the Strapi API token](../getting-started/quick-start.md#2-regenerate-the-strapi-api-token), [Data Seeding](../strapi/data-seeding.md), and [Quick Start Troubleshooting](../getting-started/quick-start.md#troubleshooting).

</details>

<details>
<summary>How does this starter support AI agents?</summary>

The starter ships agent-facing instructions and tools as part of the repo, so compatible coding agents can understand common project workflows before editing files.

The main support points are:

- **Agent skills** live in `.claude/skills/` and are exposed through `.agents/skills/` for agents that follow the agentskills.io convention.
- **Repo guidance** lives in root `CLAUDE.md` / `AGENTS.md`, so agents start from the same project rules and docs entry points.
- **Workflow skills** cover common tasks such as starting work, adding content types, creating page-builder sections, writing tests, reviewing branches, and opening PRs.
- **Worktree scripts** let agents create isolated branch workspaces with copied env files and shared package setup.
- **Strapi MCP** is enabled by default in development, so an MCP-capable agent can inspect Strapi schemas and seed local content through `http://localhost:1337/mcp` with an API token. Outside development, opt in with `STRAPI_MCP_ENABLED=true`.
- **Docs pages** describe the skill catalog and workflow diagrams, so humans and agents use the same reference.

Use the relevant AI skill before starting repo-specific work. For example, use `add-content-type` before adding a new collection, `create-content-component` before adding a page-builder section, and `start-work` before opening an isolated worktree.

See [Agent Skills](../reference/AI/skills/overview.md), [Strapi MCP](../reference/AI/strapi-mcp.md), [Commands Reference: Worktrees](../reference/commands.md#worktrees), and the root `CLAUDE.md` / `AGENTS.md` guidance.

</details>

<details>
<summary>How to add a new Strapi content type that the UI can fetch?</summary>

Use the short checklist:

1. Add the Strapi schema, route, controller, and service.
2. Restart Strapi so the content type is loaded.
3. Add the UID and REST path to `API_ENDPOINTS` in `apps/ui/src/lib/strapi-api/base.ts`.
4. Fetch it in a Server Component or Route Handler with `PublicStrapiClient` for public CMS content.

Server-side fetch example:

```ts
const products = await PublicStrapiClient.fetchMany("api::product.product", {
  locale,
  populate: { image: true },
  status: "published",
})
```

For read-only UI requests, the regenerated Read Only API token usually covers new content types automatically. Custom token writes and end-user JWT access need explicit Strapi permissions.

See [Add a Content Type](../getting-started/add-content-type.md) and [Strapi API Client: Adding New Endpoints](../ui/strapi-api-client.md#adding-new-endpoints).

</details>

<details>
<summary>Which rich text editors are supported?</summary>

The starter supports two Strapi rich text paths:

- **CKEditor** for HTML-based rich text and closer WYSIWYG preview behavior.
- **TipTap** for structured ProseMirror JSON with stricter presets and more controlled rendering.

Pick one main authoring path for a project unless there is a clear reason to maintain both. Running both editors increases schema, rendering, and QA work.

See [Rich Text Editors](../design-system/rich-text-editors.md), [CKEditor](../strapi/plugins/ckeditor.md), and [TipTap Editor](../strapi/plugins/tiptap-editor.md).

</details>

<details>
<summary>What is the difference between Public and Private API clients?</summary>

Use `PublicStrapiClient` for shared CMS content that is the same for every visitor, such as pages, navbar, footer, SEO data, and public listings. It authenticates with the server-side Strapi API token from `STRAPI_REST_READONLY_API_KEY`.

Use `PrivateStrapiClient` for content that depends on the signed-in end user, such as profile data, account-specific records, or protected actions. It uses the user's Strapi JWT from the Better Auth session, or a JWT passed directly in request options.

In Server Components, prefer `PublicStrapiClient` unless the response really depends on the current user. `PrivateStrapiClient` session lookup is dynamic and prevents static rendering.

See [Strapi API Client](../ui/strapi-api-client.md).

</details>

<details>
<summary>How to remove end-user authorization from the app?</summary>

For a public CMS site, remove the UI end-user auth surface and keep Strapi Admin authentication separate.

Use this checklist:

1. Remove auth pages under `apps/ui/src/app/[locale]/auth`.
2. Remove `/api/auth/[...all]` and `/api/private-proxy/[...slug]` if no authenticated browser requests remain.
3. Remove `authGuard` from `apps/ui/src/proxy.ts`.
4. Remove navbar session reads and auth UI components, such as `NavbarAuthSection`, `LoggedUserMenu`, and `getSessionSSR()` usage in `StrapiNavbar`.
5. Replace `PrivateStrapiClient` usage with `PublicStrapiClient` where the data is public CMS content.
6. Remove Better Auth client/server helpers and related user mutation hooks when nothing imports them anymore.
7. Uninstall unused auth packages from `apps/ui/package.json`.
8. Remove unused auth environment variables such as `BETTER_AUTH_SECRET`.

See [Authentication](../auth/index.md), [UI Authentication](../auth/ui/authentication.md), [Auth Pages](../ui/built-in-pages/auth-pages.md), and [Private Strapi Proxy](../ui/built-in-api-routes/private-proxy.md).

</details>

<details>
<summary>How to expose a Strapi endpoint to a client component?</summary>

Do not call Strapi directly from the browser with `STRAPI_URL` or API tokens. Use the UI proxy routes.

Add the endpoint path to `ALLOWED_STRAPI_ENDPOINTS` in `apps/ui/src/lib/strapi-api/request-auth.ts` for the HTTP methods the browser needs:

```ts
const ALLOWED_STRAPI_ENDPOINTS = {
  GET: ["api/products"],
}
```

Use the public proxy for shared CMS content and the private proxy for end-user-specific content.

See [Strapi API Client: Proxy Routes](../ui/strapi-api-client.md#proxy-routes), [Public Strapi Proxy](../ui/built-in-api-routes/public-proxy.md), and [Private Strapi Proxy](../ui/built-in-api-routes/private-proxy.md).

</details>

<details>
<summary>How to clear setup caches and reinstall modules?</summary>

Remove installed modules, then reinstall:

```bash
bash scripts/utils/rm-modules.sh
pnpm install
```

Clear Next.js and Turbo caches:

```bash
bash scripts/utils/rm-next-cache.sh
```

For a full local cleanup, use:

```bash
bash scripts/utils/rm-all.sh
```

After `rm-all.sh`, run `pnpm install` again.

See [Commands Reference: Cleanup scripts](../reference/commands.md#cleanup-scripts).

</details>

<details>
<summary>How to decide which test command to run?</summary>

Use the narrowest command that covers the change:

```bash
pnpm test:ui       # Next.js unit tests
pnpm test:strapi   # Strapi unit tests
pnpm test          # all Vitest tests
pnpm typecheck     # TypeScript across the repo
pnpm lint          # ESLint across the repo
```

Use Playwright commands for browser behavior, accessibility, SEO, or visual checks:

```bash
pnpm tests:playwright:e2e:test
pnpm tests:playwright:axe
pnpm tests:playwright:seo
pnpm tests:playwright:visual
```

See [Testing Overview](../reference/testing/overview.md), [Unit Testing](../reference/testing/unit-testing.md), [Playwright Testing](../reference/testing/playwright.md), and [Commands Reference](../reference/commands.md#testing).

</details>

<details>
<summary>How to build the UI for Docker or static output?</summary>

For the normal production Docker flow, use the UI Docker build and `NEXT_OUTPUT=standalone`.

For local static export experiments:

```bash
pnpm build:ui:static
```

Static export is not supported out of the box. It fails unless dynamic features such as Better Auth routes, POST handlers, and other runtime-only behavior are removed or reworked.

See [Next Configuration: Output Mode](../ui/next-config.md#output-mode), [UI Docker Build](../ui/docker-build.md), and [Caching: Static Export](../ui/caching.md#static-export).

</details>
