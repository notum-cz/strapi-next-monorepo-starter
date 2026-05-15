# 🔥 Strapi v5 & Next.js v16 Monorepo Starter

This is a ready-to-go starter template for Strapi projects. It combines the power of Strapi, Next.js, Shadcn/ui libraries with Turborepo setup and kickstarts your project development. We call it a **Page builder** for enterprise applications.

## 👀 Live demo

- UI - [https://www.notum-dev.cz/](https://www.notum-dev.cz/)
- Strapi - [https://api.notum-dev.cz/admin](https://api.notum-dev.cz/admin)
- **Readonly user:**
  - Email: user@notum.cz
  - Password: Secret-pass-55

## 🥞 Tech stack

- [Strapi v5](https://strapi.io/) - Headless CMS to manage content
- [Next.js App Router v16](https://nextjs.org/docs) - React v19 for building web apps
- [Shadcn/ui](https://ui.shadcn.com/) - TailwindCSS based UI components
- [TailwindCSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- [Turborepo](https://turbo.build/) - Monorepo management tool to keep things tidy

## 🚀 Getting started

[![Launch Strapi + Next.js Monorepo — Live in 5 Minutes](https://img.youtube.com/vi/VZlJZuurUH8/maxresdefault.jpg)](https://www.youtube.com/watch?v=VZlJZuurUH8 "Watch on YouTube")

Full step-by-step setup lives in docs:

- [Installation](./apps/docs/docs/getting-started/installation.md) — prerequisites, clone, install
- [Quick Start](./apps/docs/docs/getting-started/quick-start.md) — start Strapi + UI, get content rendering
- [Add a Content Type](./apps/docs/docs/getting-started/add-content-type.md) — end-to-end recipe for extending the template

### TL;DR

```bash
git clone https://github.com/notum-cz/strapi-next-monorepo-starter
cd strapi-next-monorepo-starter
nvm use
corepack prepare pnpm@11.1.1 --activate
pnpm install
pnpm dev:strapi              # then create API token, paste into apps/ui/.env.local
pnpm dev:ui                  # in a second terminal
```

Open [http://localhost:3000](http://localhost:3000) (UI) and [http://localhost:1337/admin](http://localhost:1337/admin) (Strapi). See [Quick Start](./apps/docs/docs/getting-started/quick-start.md) for token + env setup.

After getting it running you'll probably want to:

- Rename packages and project metadata. See [Transform this template to a project](#-transform-this-template-to-a-project).
- Explore [What's inside?](#-whats-inside).

## ✨ Features

- **Modern foundation**: Strapi v5, Next.js v16 App Router, React 19, TypeScript, pnpm workspaces, Turborepo, Node 24, Docker-ready
- **Typed page builder**: dynamic-zone components, typed populate configs, generated Strapi types, frontend component registry, starter sections
- **Content preview and routing**: draft/live preview, localized routing, dynamic rewrites, breadcrumbs, canonical metadata
- **Design system**: TailwindCSS v4, shadcn/ui, shared tokens, typography primitives, reusable form/image/section components
- **Rich text**: CKEditor and TipTap pre-configured, shared styles, generated presets
- **Media**: Strapi upload (local, Azure Blob, S3), frontend image helpers (`StrapiBasicImage`, imgproxy support)
- **Authentication**: Better Auth + Strapi Users & Permissions, JWT, auth middleware, OAuth-ready
- **Localization**: `next-intl` (frontend) + `@strapi/plugin-i18n` (content)
- **Dev workflow**: DB seed, typed Strapi clients, ESLint + Prettier, Lefthook, Commitizen, conventional commits, CODEOWNERS
- **QA**: Docusaurus docs + Playwright E2E/a11y/perf/SEO/visual

Deep-dives live in [/apps/docs](./apps/docs) — start at [Architecture](./apps/docs/docs/architecture.md).

## 📦 What's inside?

### Apps

| Path          | Tech                                  | README                                           |
| ------------- | ------------------------------------- | ------------------------------------------------ |
| `apps/ui`     | Next.js v16 + shadcn/ui + Tailwind v4 | [apps/ui/README.md](./apps/ui/README.md)         |
| `apps/strapi` | Strapi v5 + Postgres                  | [apps/strapi/README.md](./apps/strapi/README.md) |
| `apps/docs`   | Docusaurus 3                          | [apps/docs](./apps/docs)                         |

### Packages

See [Packages reference](./apps/docs/docs/packages.md) for full surface and consumer notes.

- `@repo/design-system` — Tailwind pipeline + editor color/font JSON
- `@repo/shared-data` — path utilities used in both runtimes
- `@repo/strapi-types` — auto-generated content/component types
- `@repo/eslint-config` — composed flat ESLint config
- `@repo/typescript-config` — tsconfig presets (Strapi app uses its own)
- `@repo/semantic-release-config` — release pipeline config

## ☕ Scripts

**Always run from the monorepo root.** Turbo dispatches to the correct workspace. Don't `cd` into individual apps.

Common commands:

```bash
pnpm dev                    # all apps
pnpm dev:strapi             # Strapi only (auto-starts Postgres)
pnpm dev:ui                 # Next.js only
pnpm dev:docs               # Docusaurus

pnpm build                  # build everything
pnpm build:strapi
pnpm build:ui
pnpm build:docs

pnpm lint                   # ESLint everywhere
pnpm typecheck

pnpm generate:types         # regenerate Strapi types
pnpm sync-types             # mirror into @repo/strapi-types

pnpm seed:check
pnpm seed:export
pnpm seed:import

pnpm commit                 # Commitizen interactive prompt
```

Full reference: [Commands](./apps/docs/docs/reference/commands.md).

Escape hatch for per-package scripts that aren't wrapped — still from root:

```bash
pnpm -F @repo/ui <script>
pnpm -F @repo/strapi <script>
```

### Bash scripts

```bash
# Remove all `node_modules` folders in the monorepo
# Useful for scratch dependencies installation
bash ./scripts/utils/rm-modules.sh

# Remove all node_modules, .next, .turbo, .strapi, dist folders
bash ./scripts/utils/rm-all.sh

# Remove all `.next` folders in the monorepo
# Useful for scratch builds of ui
bash ./scripts/utils/rm-next-cache.sh
```

## 🧪 Testing and QA

A dedicated QA workspace is available under the `qa/` directory, providing automated tests for E2E, accessibility, performance, and SEO validation.

See [README](./qa/tests/README.md) for available test suites and commands.

## 🔌 VSCode Extensions

Install extensions listed in the [.vscode/extensions.json](.vscode/extensions.json) file and have a better development experience.

## 🔱 Git Hooks & Conventions

Lefthook ([`lefthook.yml`](./lefthook.yml)) enforces:

- **pre-commit** — branch name validation + lint-staged (ESLint, Prettier)
- **commit-msg** — conventional commit format via commitlint

Branch naming: `<type>/STAR-<number>-<description>` (e.g. `feat/STAR-1582-repo-config`). Exempt: `main`, `master`, `develop`, `dev`, `release/*`, `hotfix/*`.

Conventional commits: `feat(ui): add dark mode toggle`. Use `pnpm run commit` for the interactive generator.

### Environment Variables in Commits

When introducing new environment variables, mention them in commit messages using `env.VARIABLE_NAME` or `VARIABLE_NAME` (CONSTANT_CASE). The [auto-pr workflow](.github/workflows/auto-pr.yml) extracts these from commit messages and lists them in the PR description under "Required Environment Variables".

**Example commit:**

```
feat(ui): add sentry integration

Added error tracking with Sentry.

New environment variables:
- env.SENTRY_DSN
- env.SENTRY_AUTH_TOKEN
```

## 📝 Pull Request Template

The [PR template](.github/PULL_REQUEST_TEMPLATE.md) enforces a consistent structure for all pull requests.

## ♾️ Deployment

### GitHub Actions

We are using GitHub Actions for validation of builds and running tests. There are 2 workflows prepared:

1. [ci.yml](.github/workflows/ci.yml) - runs on every push and pull request to `main` branch. It verifies if code builds.
2. [qa.yml](.github/workflows/qa.yml) - manually triggered workflow that runs the QA tests from `qa/tests` directory. Ideally it should be run against deployed frontend (by setting `BASE_URL` env variable and passing to [playwright.config.ts](./qa/tests/playwright/playwright.config.ts)).
3. [auto-pr.yml](.github/workflows/auto-pr.yml) - automatically creates/updates a PR from `dev` to `main` when changes are pushed. Extracts environment variables from commit messages (see [Environment Variables in Commits](#environment-variables-in-commits)).

### Heroku

_This section is under construction._ 😔

Create 2 apps in Heroku, one for Strapi and one for Next.js UI. Stack is `heroku-24`. Connect both to GitHub repository in the Deploy tab and configure automatic deploys from your branch.

> [!TIP]
> If you're not deploying to Heroku, remove all `Procfile`s from the repository.

We published two buildpacks to make deployment easier and more efficient. They can **reduce the slug size by more than 70 %** by pruning unnecessary files from the Turborepo monorepo during the build and they also **speed up the build and installation**:

- [https://github.com/notum-cz/heroku-buildpack-turbo-prune.git](https://github.com/notum-cz/heroku-buildpack-turbo-prune.git)
- [https://github.com/notum-cz/heroku-buildpack-next-standalone-slim.git](https://github.com/notum-cz/heroku-buildpack-next-standalone-slim.git)

#### Strapi app configuration

1. Connect a database ([Heroku Postgres](https://elements.heroku.com/addons/heroku-postgresql)). `DATABASE_URL` env variable will be set automatically so you can skip any other database-related configuration.
2. Set env variables based on `.env.example`, **don't forget to set**:
   - `APP`- set to `strapi`
   - `WORKSPACE` - set to `@repo/strapi`
3. Set buildpacks in this order:
   - https://github.com/notum-cz/heroku-buildpack-turbo-prune.git
   - `heroku/nodejs`
4. We recommend setting up an AWS S3 bucket for media uploads, as Heroku's filesystem will delete uploaded files after dyno restarts.

#### UI app configuration

1. Set env variables based on `.env.example`, **don't forget to set**:
   - `APP`- set to `ui`
   - `WORKSPACE` - set to `@repo/ui`
   - `NEXT_OUTPUT` - set to `standalone`
2. Set buildpacks in this order:
   - https://github.com/notum-cz/heroku-buildpack-turbo-prune.git
   - `heroku/nodejs`
   - https://github.com/notum-cz/heroku-buildpack-next-standalone-slim.git

## 💡 Transform this template to a project

- In the root `package.json`, update the `name` and `description` fields to match the new project name. Optionally, update the names in `/apps` and `/packages` as well. Keep the `@repo` prefix unless you prefer a different scope or company name—changing it will require updates throughout the entire monorepo.
- In [docker-compose.yml](./apps/strapi/docker-compose.yml), update the top-level name "strapi-next-starter" (and optionally the network name) to reflect the new project name. This helps prevent name conflicts on developers' machines.

_[After this preparation is done, delete this section from README]_

## 📖 Documentation

App READMEs cover **setup and environment** only. Conceptual and feature documentation lives in [/apps/docs](./apps/docs):

- **Getting Started** — [Installation](./apps/docs/docs/getting-started/installation.md) · [Quick Start](./apps/docs/docs/getting-started/quick-start.md) · [Add a Content Type](./apps/docs/docs/getting-started/add-content-type.md)
- [Architecture](./apps/docs/docs/architecture.md) — request lifecycle, proxies, draft mode, i18n, env vars
- **Content System** — [Page Builder](./apps/docs/docs/content-system/page-builder.md) · [Strapi Schemas](./apps/docs/docs/content-system/strapi-schemas.md) · [Pages Hierarchy](./apps/docs/docs/content-system/pages-hierarchy.md) · [Strapi Types Usage](./apps/docs/docs/content-system/strapi-types-usage.md) · [Strapi API Client](./apps/docs/docs/content-system/strapi-api-client.md)
- **Frontend** — [Frontend Features](./apps/docs/docs/frontend/frontend-features.md) · [Image Optimization](./apps/docs/docs/frontend/images.md)
- **Strapi** — [Strapi Plugins](./apps/docs/docs/strapi/strapi-plugins.md) · [Data Seeding](./apps/docs/docs/strapi/data-seeding.md)
- **Authentication** — [Overview](./apps/docs/docs/auth/authentication.md) · [Microsoft SSO](./apps/docs/docs/auth/microsoft-sso.md) · [OAuth Providers](./apps/docs/docs/auth/oauth-providers.md)
- **Reference** — [Commands](./apps/docs/docs/reference/commands.md) · [Packages](./apps/docs/docs/reference/packages.md)

Docs site builds to GitHub Pages — `pnpm build:docs` to preview locally. Tracking improvements: [issue #113](https://github.com/notum-cz/strapi-next-monorepo-starter/issues/113).

## 💙 Feedback

This repository was created based on [strapi-next-monorepo-starter](https://github.com/notum-cz/strapi-next-monorepo-starter). If you encounter a problem with the template code during development, or you have implemented a useful feature that should be part of that template, please create an issue with a description or PR in that repository. So we can keep it updated with great features.
