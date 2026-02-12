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
- node 22
- pnpm 10
- [nvm](https://github.com/nvm-sh/nvm) (optional, recommended)

### Run dev (in 4 steps)

1. Clone this repository

   ```sh
   git clone https://github.com/notum-cz/strapi-next-monorepo-starter
   # Check out latest release
   git checkout v3.0.0
   ```

   Or click [Use this template](https://github.com/notum-cz/strapi-next-monorepo-starter/generate) to create a new repository based on this template.

2. Install dependencies

   ```sh
   # in root
   # switch to correct nodejs version (v22)
   nvm use

   # optionally, switch to pnpm v10.28.1
   (corepack prepare pnpm@10.28.1 --activate)

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

- **Strapi**: Fully typed (TypeScript) and up-to-date Strapi v5 controllers and services
- **Strapi config**: Pre-configured and pre-installed with the most common plugins, packages and configurations
- **Page builder**: Page rendering mechanism and prepared useful components. Ready to plug-and-play
- **Strapi live preview**: Preview/draft mode for Next.js app to see changes in Strapi in real-time
- **DB seed**: Seed script to populate DB with initial data
- **Next.js**: Fully typed and modern Next.js v16 App router project
- **Proxies**: Proxy API calls to Strapi from Next.js app to avoid CORS issues, hide API keys and backend address
- **API**: Typed API calls to Strapi via API clients
- **UI library**: 20+ pre-installed components, beautifully designed by [Shadcn/ui](https://ui.shadcn.com/)
- **UI components**: Ready to use components for common use cases (forms, images, tables, navbar and much more)
- **TailwindCSS**: [TailwindCSS v4](https://tailwindcss.com/) setup with configuration and theme, [CVA](https://cva.style/docs), [tailwind-merge](https://www.npmjs.com/package/tailwind-merge) and [tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate)
- **Rich text editors**: Pre-configured [CkEditor v5](https://ckeditor.com/) and [Tip tap](https://tiptap.dev/) WYSIWYG editors with shared styles and colors
- **Utils**: Useful utils, hooks and helper functions included
- **Auth**: JWT authentication with [Strapi Users & Permissions feature](https://docs.strapi.io/cms/features/users-permissions) and [Better Auth](https://www.better-auth.com), auth middleware and protected routes
- **Auth providers**: Ready to plug-in providers like Google, Facebook etc.
- **Localization**: Multi-language support with [next-intl](https://next-intl-docs.vercel.app/) and [@strapi/plugin-i18n](https://www.npmjs.com/package/@strapi/plugin-i18n) packages
- **SEO**: Pre-configured SEO Strapi component and integrated with frontend SEO best practices like metadata, canonical etc.
- **Turborepo**: Pre-configured, apps and packages connected and controlled by Turbo CLI
- **Dockerized**: Ready to build in Docker containers for production
- **Code quality**: Out-of-the-box ESLint (with integrated Prettier formatting) and TypeScript configurations in shareable packages
- **Husky**: Pre-commit hooks for linting, formatting and commit message validation
- **Commitizen**: Commitizen for conventional commits and their generation
- **Heroku ready**: Ready to deploy to Heroku in a few steps
- ... and much more is waiting for you to discover!

## 📦 What's inside?

### Apps

- `apps/ui` - UI web app based on [Next.js v16](https://nextjs.org/docs/) and [shadcn/ui](https://ui.shadcn.com/) ([Tailwind](https://tailwindcss.com/)) - [README.md](./apps/ui/README.md)
- `apps/strapi` - [Strapi v5](https://strapi.io/) API with prepared page-builder components - [README.md](./apps/strapi/README.md)

### Packages

- `packages/eslint-config`: [ESLint](https://eslint.org/) configurations with integrated [Prettier](https://prettier.io/) formatting, import ordering, and Tailwind plugin
- `packages/typescript-config`: tsconfig JSONs used throughout the monorepo (not compatible with Strapi app now)
- `packages/design-system`: shared styles, primarily for sharing CkEditor color configurations
- `packages/shared-data`: package that stores common values across frontend and backend
- `packages/strapi-types`: typescript definitions of content generated by Strapi and mirrored to separate package for easy usage in other apps. See [README.md](./packages/strapi-types/README.md) for more details.

## 📌 Version Information

- **Latest Release**: [v3.0.0](https://github.com/notum-cz/strapi-next-monorepo-starter/releases/tag/v3.0.0)
  ```sh
  git checkout v3.0.0
  ```
- **Development**: The `main` branch contains unreleased features and improvements. For production use, we recommend using the latest [release](https://github.com/notum-cz/strapi-next-monorepo-starter/releases).

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

## 🔱 Husky tasks

Husky is installed by default and configured to run following tasks:

1. `lint` and `format` on every commit (`pre-commit` hook) via [lint-staged](https://www.npmjs.com/package/lint-staged). ESLint handles JS/TS linting and formatting (via integrated Prettier), while Prettier runs directly on CSS/MD/SCSS files. Configuration is in root `.lintstagedrc.js` and per-app `.lintstagedrc.js` files.

2. `commitlint` on every commit message (`commit-msg` hook). It checks if commit messages meet [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) format.

## ♾️ Deployment

### GitHub Actions

We are using GitHub Actions for validation of builds and running tests. There are 2 workflows prepared:

1. [ci.yml](.github/workflows/ci.yml) - runs on every push and pull request to `main` branch. It verifies if code builds.
2. [qa.yml](.github/workflows/qa.yml) - manually triggered workflow that runs the QA tests from `qa/tests` directory. Ideally it should be run against deployed frontend (by setting `BASE_URL` env variable and passing to [playwright.config.ts](./qa/tests/playwright/playwright.config.ts)).

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

There is a plenty of documentation in README files in individual apps and packages. Make sure to check them out. In addition, there are some more in the [/docs](./docs) directory. We want to [improve the documentation over time](https://github.com/notum-cz/strapi-next-monorepo-starter/issues/113), so stay tuned.

## 💙 Feedback

This repository was created based on [strapi-next-monorepo-starter](https://github.com/notum-cz/strapi-next-monorepo-starter). If you encounter a problem with the template code during development, or you have implemented a useful feature that should be part of that template, please create an issue with a description or PR in that repository. So we can keep it updated with great features.
