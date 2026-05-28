# Strapi v5 & Next.js v16 Monorepo Starter

Enterprise-ready starter template for building editable websites and applications with Strapi, Next.js, TypeScript, TailwindCSS, and Turborepo.

## Why

Most Strapi + Next.js projects need the same foundation: content modeling, page rendering, typed API access, localization, preview, media handling, authentication, deployment setup, and a repeatable local workflow.

This starter puts those pieces together up front so teams can start from a working project instead of assembling infrastructure from scratch.

## What

The template combines:

- Strapi v5 CMS with PostgreSQL, seed data, plugins, and generated schema types.
- Next.js v16 UI with App Router, React 19, TailwindCSS v4, and shadcn/ui.
- A typed page builder based on Strapi dynamic zones and React component mapping.
- Shared packages for design tokens, Strapi types, path helpers, linting, TypeScript config, and releases.
- Docusaurus documentation for architecture, setup, UI, Strapi, authentication, deployment, and workflow.

See [Features](./apps/docs/docs/getting-started/features.md) for the full list.

## Live Demo

- UI: [https://www.notum-dev.cz/](https://www.notum-dev.cz/)
- Strapi admin: [https://api.notum-dev.cz/admin](https://api.notum-dev.cz/admin)
- Read-only user:
  - Email: `user@notum.cz`
  - Password: `Secret-pass-55`

## Getting Started

Full setup lives in the docs:

- [Installation](./apps/docs/docs/getting-started/installation.md)
- [Quick Start](./apps/docs/docs/getting-started/quick-start.md)
- [Add a Content Type](./apps/docs/docs/getting-started/add-content-type.md)

Shortest local path:

```bash
git clone https://github.com/notum-cz/strapi-next-monorepo-starter
cd strapi-next-monorepo-starter
nvm use
corepack prepare pnpm@11.1.1 --activate
pnpm install
pnpm dev
```

Open:

- UI: [http://localhost:3000](http://localhost:3000)
- Strapi admin: [http://localhost:1337/admin](http://localhost:1337/admin)

The UI needs a Strapi API token before content can render. Follow [Quick Start](./apps/docs/docs/getting-started/quick-start.md) for the token and environment setup.

## Documentation

- [Docs homepage](./apps/docs)
- [Features](./apps/docs/docs/getting-started/features.md)
- [Page Builder](./apps/docs/docs/page-builder/introduction.md)
- [UI](./apps/docs/docs/ui/ui-features.md)
- [Strapi](./apps/docs/docs/strapi/strapi-schemas.md)
- [Authentication](./apps/docs/docs/auth/ui/authentication.md)
- [Commands](./apps/docs/docs/reference/commands.md)
- [Deployment](./apps/docs/docs/reference/deployment.md)

## Project Layout

| Path                  | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `apps/ui`             | Next.js UI application                                 |
| `apps/strapi`         | Strapi CMS                                             |
| `apps/docs`           | Docusaurus documentation                               |
| `packages/*`          | Shared workspace packages                              |
| `qa/tests/playwright` | E2E, accessibility, visual, SEO, and performance tests |

## Using This Template

After cloning for a real project, rename project metadata in `package.json` and app/package manifests as needed. Also update the `name` in `apps/strapi/docker-compose.yml` to avoid Docker project-name collisions with other local checkouts.

## Feedback

Report issues or propose improvements in [notum-cz/strapi-next-monorepo-starter](https://github.com/notum-cz/strapi-next-monorepo-starter).
