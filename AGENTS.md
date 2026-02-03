# Strapi + Next.js Monorepo

Monorepo starter with Strapi v5 CMS and Next.js 16 frontend. Uses pnpm workspaces with Turborepo.

## Workspaces

| Path | Description |
|------|-------------|
| `apps/ui` | Next.js 16 (App Router, React 19, TailwindCSS v4, Shadcn/ui) |
| `apps/strapi` | Strapi v5 CMS (PostgreSQL via Docker) |
| `packages/strapi-types` | Auto-generated TypeScript types from Strapi schemas |
| `packages/design-system` | Shared TailwindCSS tokens and CkEditor styles |
| `packages/shared-data` | Shared constants and types |
| `qa/tests/playwright` | E2E and accessibility tests |

## Essential Commands

```bash
pnpm dev              # Start both apps (Docker required for DB)
pnpm build            # Build all
pnpm lint             # ESLint all packages
pnpm typecheck        # Typecheck (run from apps/ui)
```

See [docs/commands.md](docs/commands.md) for full command reference.

## Type Generation (Critical)

After ANY Strapi schema change:

```bash
cd apps/strapi && pnpm generate:types
```

This updates `@repo/strapi-types`. Forgetting causes silent type mismatches between apps.

## Documentation

- [Commands Reference](docs/commands.md) — All pnpm commands
- [Architecture](docs/architecture.md) — System design and patterns
- [Page Builder](docs/page-builder.md) — Component registry and rendering
- [Strapi API Client](docs/strapi-api-client.md) — Fetching content from Strapi
- [Pages Hierarchy](docs/pages-hierarchy.md) — URL structure and redirects
- [Authentication](docs/authentication.md) — Better Auth + Strapi JWT integration
- [Strapi Schemas](docs/strapi-schemas.md) — Schema attributes, localization, lifecycle hooks
- [Strapi Types](docs/strapi-types-usage.md) — Type utilities and usage patterns

## Commits

Uses conventional commits enforced by Husky + commitlint.

```bash
pnpm commit    # Interactive Commitizen flow
```

Or write manually: `type(scope): subject`
