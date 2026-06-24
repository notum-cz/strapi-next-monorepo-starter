# Strapi + Next.js Monorepo

Monorepo starter with Strapi v5 CMS, Next.js 16 UI, Docusaurus docs, pnpm workspaces, and Turborepo.

## Workspaces

| Path                     | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `apps/ui`                | Next.js 16 App Router, React 19, TailwindCSS v4, shadcn/ui              |
| `apps/strapi`            | Strapi v5 CMS with PostgreSQL through Docker                            |
| `apps/docs`              | Docusaurus documentation site (port 3300)                               |
| `packages/strapi-types`  | Auto-generated TypeScript types from Strapi schemas                     |
| `packages/design-system` | Shared TailwindCSS tokens, CKEditor and TipTap editor styles            |
| `packages/shared-data`   | Shared constants and types                                              |
| `packages/logging`       | Structured pino logging + OpenTelemetry trace context (`@repo/logging`) |
| `qa/tests/playwright`    | E2E, accessibility, SEO, visual, and Lighthouse tests                   |

Config-only workspaces (`@repo/eslint-config`, `@repo/typescript-config`, `@repo/semantic-release-config`) are omitted from the table.

## Essential Commands

Run commands from the monorepo root unless a docs page says otherwise.

```bash
pnpm dev              # Start all apps
pnpm dev:strapi       # Start Strapi only
pnpm dev:ui           # Start Next.js only
pnpm dev:docs         # Start Docusaurus only on port 3300
pnpm build            # Build all
pnpm lint             # ESLint all packages
pnpm typecheck        # Typecheck all packages
pnpm test             # Vitest in all apps
```

See [Commands Reference](apps/docs/docs/reference/commands.md) for the full command list, package filters, worktrees, testing, and cleanup scripts.

## Generated types

`@repo/strapi-types` is generated from the Strapi schemas and **regenerates automatically when Strapi restarts** after a schema or component change — no manual step in normal dev. If you need fresh types without restarting Strapi, run `pnpm generate:types`. See [Strapi Types](apps/docs/docs/reference/packages/strapi-types.md).

## Documentation Routing

Start with [Documentation Overview](apps/docs/docs/getting-started/features.md) for the stack, included capabilities, and links across the docs.

Use these pages for common coding-agent tasks:

- [Commands Reference](apps/docs/docs/reference/commands.md) — Root scripts, package filters, worktrees, tests, and cleanup commands
- [Workflow](apps/docs/docs/reference/workflow.md) — Git hooks, branch naming, Conventional Commits, env vars in commits, and release notes
- [Quick Start](apps/docs/docs/getting-started/quick-start.md) — Local setup flow
- [Add Content Type](apps/docs/docs/getting-started/add-content-type.md) — Strapi schema-to-UI implementation workflow
- [Page Builder](apps/docs/docs/page-builder/introduction.md) — Dynamic zones, component registry, rendering, and population rules
- [Pages Hierarchy](apps/docs/docs/page-builder/pages-hierarchy.md) — URL structure, redirects, breadcrumbs, and page relationships
- [UI Project Structure](apps/docs/docs/ui/project-structure.md) — Next.js app layout and route organization
- [Strapi API Client](apps/docs/docs/ui/strapi-api-client.md) — Fetching Strapi content from server and browser-safe clients
- [Authentication](apps/docs/docs/auth/ui/authentication.md) — Better Auth session handling and Strapi JWT integration
- [Strapi Schemas](apps/docs/docs/strapi/strapi-schemas.md) — Content types, components, relations, localization, and document middlewares
- [Strapi Types](apps/docs/docs/reference/packages/strapi-types.md) — Generated type utilities and usage patterns
- [Design System](apps/docs/docs/design-system/overview.md) — Tokens, typography, rich text styles, and CMS component design guidance
- [Testing](apps/docs/docs/reference/testing/overview.md) — Unit, Playwright, accessibility, visual, SEO, and Lighthouse coverage
- [Deployment](apps/docs/docs/reference/deployment/overview.md) — GitHub Actions, Heroku, Vercel, and Docker notes
- [AI Skills](apps/docs/docs/reference/AI/skills/overview.md) — Agent skills catalog, per-skill What/How/When, and [workflow diagrams](apps/docs/docs/reference/AI/skills/overview.md#workflows)

## Commits

Use Conventional Commits. The repo enforces branch naming and commit messages through Lefthook and commitlint.

```bash
pnpm commit    # Interactive Commitizen flow
```

Manual format:

```text
type(scope): subject
```

When adding environment variables, mention them in the commit body as `env.VARIABLE_NAME` or `VARIABLE_NAME` in `CONSTANT_CASE` so the Auto PR workflow can surface them. See [Workflow](apps/docs/docs/reference/workflow.md) for details.

## Agent skills

Reusable agent instructions live in [`.claude/skills/`](./.claude/skills/) — the single source of truth, auto-discovered by Claude Code. A committed symlink at [`.agents/skills/`](./.agents/skills/) exposes the same set to any agent following the [agentskills.io](https://agentskills.io) standard (Codex, Copilot CLI, Gemini). Vendored community skills are installed via `skills.sh` and tracked in [`skills-lock.json`](./skills-lock.json).

See [`.claude/skills/README.md`](./.claude/skills/README.md) for the authoring guide and full catalog, and the [AI → Skills docs](apps/docs/docs/reference/AI/skills/overview.md) (with [workflow diagrams](apps/docs/docs/reference/AI/skills/overview.md#workflows)) for what each skill does and how they chain. Worktree-based isolation is wired through the `start-work` skill.

This file (`CLAUDE.md`) is mirrored as `AGENTS.md` (a symlink) for non-Claude agents; the same pairing exists in `apps/ui` and `apps/strapi`.
