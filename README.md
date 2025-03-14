# 🔥 Strapi v5 & NextJS Monorepo Starter

This is a ready-to-go starter template for Strapi projects. It combines the power of Strapi, NextJS, Shadcn/ui libraries with Turborepo setup and kickstarts your project development.

## 🥞 Tech stack

- [Strapi v5](https://strapi.io/) - Headless CMS to manage content
- [NextJS App Router v14](https://nextjs.org/docs/14) - React framework for building web apps
- [Shadcn/ui](https://ui.shadcn.com/) - TailwindCSS based UI components
- [Turborepo](https://turbo.build/) - Monorepo management tool to keep things tidy

## ✨ Features

- **Strapi**: Fully typed (TypeScript) and up-to-date Strapi v5 controllers and services
- **Strapi config**: Pre-configured and pre-installed with the most common plugins, packages and configurations
- **Page builder**: Multiple content types and components prepared for page builder. Ready to plug-and-play
- **DB Seed**: Seed script to populate DB with initial data
- **NextJS**: Fully typed and modern NextJS App router project
- **API**: Typed API calls to Strapi via API service
- **UI library**: 20+ pre-installed components, beautifully designed by [Shadcn/ui](https://ui.shadcn.com/)
- **UI components**: Ready to use components for common use cases (forms, images, tables, navbar and much more)
- **TailwindCSS**: [TailwindCSS](https://tailwindcss.com/) setup with configuration and theme, [CVA](https://cva.style/docs), [tailwind-merge](https://www.npmjs.com/package/tailwind-merge) and [tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate)
- **Utils**: Useful utils, hooks and helper functions included
- **Auth**: JWT authentication with Strapi and [NextAuth.js](https://next-auth.js.org/), auth middleware and protected routes
- **Auth providers**: Ready to plug-in providers like Google, Facebook etc.
- **Localization**: Multi-language support with [next-intl](https://next-intl-docs.vercel.app/) and [@strapi/plugin-i18n](https://www.npmjs.com/package/@strapi/plugin-i18n) packages
- **SEO**: Pre-configured usage of [@strapi/plugin-seo](https://www.npmjs.com/package/@strapi/plugin-seo) and integrated with frontend SEO best practices
- **Turborepo**: Pre-configured, apps and packages connected and controlled by Turbo CLI
- **Dockerized**: Ready to build in Docker containers for production
- **Code quality**: Out-of-the-box ESLint, Prettier, and TypeScript configurations in shareable packages
- **Husky**: Pre-commit hooks for linting, formatting and commit message validation
- **Commitizen**: Commitizen for conventional commits and their generation
- **Heroku ready**: Ready to deploy to Heroku in a few steps
- ... and much more is waiting for you to discover! Check [UI README.md](apps/ui/README.md) and [Strapi README.md](apps/strapi/README.md) for more details.

## 📦 What's inside?

#### Apps

- `apps/ui` - UI web app based on [NextJS 14](https://nextjs.org/docs/14/) and [shadcn/ui](https://ui.shadcn.com/) ([Tailwind](https://tailwindcss.com/)) - [README.md](./apps/ui/README.md)
- `apps/strapi` - [Strapi v5](https://strapi.io/) API with prepared page-builder components - [README.md](./apps/strapi/README.md)

#### Packages

- `packages/eslint-config`: [ESLint](https://eslint.org/) configurations for client side applications
- `packages/prettier-config`: [Prettier](https://prettier.io/) configuration with import sort plugin and tailwind plugin included
- `packages/typescript-config`: tsconfig JSONs used throughout the monorepo (not used in "strapi" app for now)

## 🚀 Setup and usage

#### Transform this template to a project

- Based on this repository create/init new repository with project name. If the new repo is on Github, it is possible to use the GH function to "init new project from template". It keeps the commit history. Otherwise, it is necessary to clone main branch of this repo locally, copy all files to the new repository and commit them as an initial commit.
- In root `package.json` change `name` and `description` according to new project name. Optionally change names in apps and packages too. Keep `@repo` prefix if you don't prefer different scope/company.
- Modify `README.md` files of apps to be less general (eg. update projects names, customize tech stack). Project-specific READMEs should not contain general leftovers from the template.
- Follow "How to use this project template?" section in `apps/` READMEs to set up each app.
- If not deploying to Heroku, remove `Procfile`(s) from repository.

_[After this preparation is done, delete this section from README]_

### VSCode Extensions

Install extensions listed in the [.vscode/extensions.json](.vscode/extensions.json) file and have a better development experience.

### Prerequisites

- node 22
- yarn 1.22
- [nvm](https://github.com/nvm-sh/nvm) (optional, recommended)

### Installation

```bash
# in root
(nvm use) # switch to correct nodejs version (v22)

# install deps for apps and packages that are part of this monorepo
yarn

# Ignore warning "Workspaces can only be enabled in private projects."
# https://github.com/yarnpkg/yarn/issues/8580
```

It will install dependencies for all `packages/` and `apps/`:

- `packages/` don't require any additional setup
- `apps/` probably do and the instructions are described in their READMEs ([UI](./apps/ui/README.md), [Strapi](./apps/strapi/README.md)). **Please, follow them first** (e.g. set env vars)

### Run - turborepo scripts

After installing dependencies and setting up projects (previous step), you can control all apps using Turbo CLI. Some common commands are wrapped into `yarn` scripts. You can find them in root `package.json` file. For example:

```bash
# run all apps in dev mode (this triggers `yarn dev` script in each app from `/apps` directory)
yarn dev

# build all apps
yarn build

# dev run of specific app(s)
yarn dev:ui
yarn dev:strapi
```

## 🔱 Husky tasks

Husky is installed by default and configured to run following tasks:

1. `lint` (eslint) and `format` (prettier) on every commit (`pre-commit` hook). To do that, [lint-staged](https://www.npmjs.com/package/lint-staged) library is used. This is a fast failsafe to ensure code doesn't get committed if it fails linting rules and that when it does get committed, it is consistently formatted. Running linters only on staged files (those that have been added to Git index using `git add`) is much faster than processing all files in the working directory. The `format` task is configured in root `.lintstagedrc.js` and run globally for whole monorepo. The `lint` task is configured in each app individually and Strapi is skipped by default.

2. `commitlint` on every commit message (`commit-msg` hook). It checks if commit messages meet [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) format.

## 📿 Scripts

### Package.json

- `yarn commit` - interactive commit message generator 🔥. How? Stage files you want to commit (e.g. using VS Code Source Control) and then run this script in the terminal from root and fill in the required information.
- `yarn format` - format code using prettier in whole monorepo. Prettier formats `package.json` files too.

### Utils

- `bash ./scripts/utils/rm-modules.sh` - Remove all `node_modules` folders in the monorepo. Useful for scratch dependencies installation.
- `bash ./scripts/utils/rm-all.sh` - Remove all `node_modules`, `.next`, `.turbo`, `.strapi`, `dist` folders.

### Heroku

- `./scripts/heroku/heroku-postbuild.sh` - Script for Heroku deployment to decide which app to build. It can be removed if not deploying to Heroku.

## 💙 Feedback

This repo was created based on [@dev-templates-public](https://github.com/notum-cz/dev-templates-public). If you encounter a problem with the template code during development, or something has changed/is being done differently in the meantime, or you have implemented a useful feature that should be part of that template, please create an issue with a description or PR in that repository. So we can keep those templates updated and great features. Thanks.
