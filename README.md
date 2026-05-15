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

### Prerequisites

- Docker
- node 24
- pnpm 11
- [nvm](https://github.com/nvm-sh/nvm) (optional, recommended)

### Run dev (in 4 steps)

1. Clone this repository

   ```sh
   git clone https://github.com/notum-cz/strapi-next-monorepo-starter
   # checkout `main` branch (`dev` contains unreleased features and improvements)
   git checkout main
   ```

   Or click [Use this template](https://github.com/notum-cz/strapi-next-monorepo-starter/generate) to create a new repository based on this template.

2. Install dependencies

   ```sh
   # in root
   # switch to correct nodejs version (v24)
   nvm use

   # optionally, switch to pnpm v11.1.1
   (corepack prepare pnpm@11.1.1 --activate)

   # install deps for apps and packages that are part of this monorepo
   pnpm install
   ```

3. Run apps
   ```sh
   # run all apps in dev mode (this triggers `pnpm dev` script in each app from `/apps` directory)
   pnpm run dev
   ```

> [!WARNING]
> Before the first run, you need to retrieve [Strapi API token](https://docs.strapi.io/cms/features/api-tokens).
>
> ```sh
> pnpm run dev:strapi
> ```
>
> Go to Strapi admin URL and navigate to [Settings > API Tokens](http://localhost:1337/admin/settings/api-tokens). Select "Create new API token" and copy it's value to `STRAPI_REST_READONLY_API_KEY` in `/apps/ui/.env.local` file.
> Refer to the [UI README](apps/ui/README.md#environment-variables) for more details.

4. 🎉 Enjoy!
   - Open your browser and go to [http://localhost:3000](http://localhost:3000) to see the UI app in action.
   - Open your browser and go to [http://localhost:1337/admin](http://localhost:1337/admin) to see the Strapi app in action.

5. Next steps?
   - See [What's inside?](#-whats-inside) for more details about apps and packages.
   - You also probably want to customize naming in the project. See [Transform this template to a project](#-transform-this-template-to-a-project).

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

| Path | Tech | README |
| --- | --- | --- |
| `apps/ui` | Next.js v16 + shadcn/ui + Tailwind v4 | [apps/ui/README.md](./apps/ui/README.md) |
| `apps/strapi` | Strapi v5 + Postgres | [apps/strapi/README.md](./apps/strapi/README.md) |
| `apps/docs` | Docusaurus 3 | [apps/docs](./apps/docs) |

### Packages

See [Packages reference](./apps/docs/docs/packages.md) for full surface and consumer notes.

- `@repo/design-system` — Tailwind pipeline + editor color/font JSON
- `@repo/shared-data` — path utilities used in both runtimes
- `@repo/strapi-types` — auto-generated content/component types
- `@repo/eslint-config` — composed flat ESLint config
- `@repo/typescript-config` — tsconfig presets (Strapi app uses its own)
- `@repo/semantic-release-config` — release pipeline config

## ☕ Scripts

### Turbo CLI

After installing dependencies and setting env vars up, you can control all apps using Turbo CLI. Some common commands are wrapped into scripts. You can find them in root [package.json](./package.json) file. Few examples:

```bash
# run all apps in dev mode (this triggers `pnpm dev` script in each app from `/apps` directory)
pnpm run dev

# run apps separately
pnpm run dev:ui
pnpm run dev:strapi

# build all apps
pnpm run build

# build specific app
pnpm run build:ui
pnpm run build:strapi
```

Using those `turbo` scripts is preferred, because they ensure correct dependency installation and environment setup.

### `pnpm` scripts

In root [package.json](./package.json) file, there are some useful tasks wrapped into `pnpm` scripts:

```bash
# interactive commit message generator - stage files first, then run this in terminal
pnpm run commit
```

> [!TIP]
> You can also use `pnpm` commands to run scripts in specific apps or packages:

```bash
# run a script in a specific app
pnpm -F @repo/ui dev

# run a script in a specific package
pnpm -F @repo/shared-data build

# run a script from root package.json in different directory
cd apps/ui
pnpm -w run lint
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

- [Architecture](./apps/docs/docs/architecture.md) — request lifecycle, proxies, draft mode, i18n, env vars
- [Packages](./apps/docs/docs/packages.md) — `packages/*` reference
- [Add a Content Type](./apps/docs/docs/add-content-type.md) — end-to-end recipe
- [Page Builder](./apps/docs/docs/page-builder.md) · [Strapi API Client](./apps/docs/docs/strapi-api-client.md) · [Authentication](./apps/docs/docs/authentication.md)
- [Frontend Features](./apps/docs/docs/frontend-features.md) · [Image Optimization](./apps/docs/docs/images.md) · [Strapi Plugins](./apps/docs/docs/strapi-plugins.md)
- [Data Seeding](./apps/docs/docs/data-seeding.md) · [Pages Hierarchy](./apps/docs/docs/pages-hierarchy.md)
- SSO: [Microsoft](./apps/docs/docs/sso/microsoft-sso.md) · [OAuth providers](./apps/docs/docs/sso/oauth-providers.md)

Docs site builds to GitHub Pages — `pnpm build:docs` to preview locally. Tracking improvements: [issue #113](https://github.com/notum-cz/strapi-next-monorepo-starter/issues/113).

## 💙 Feedback

This repository was created based on [strapi-next-monorepo-starter](https://github.com/notum-cz/strapi-next-monorepo-starter). If you encounter a problem with the template code during development, or you have implemented a useful feature that should be part of that template, please create an issue with a description or PR in that repository. So we can keep it updated with great features.
