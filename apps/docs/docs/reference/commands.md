---
sidebar_position: 2
---

# Commands Reference

All commands run from the **monorepo root** via Turbo. Never `cd` into individual apps.

## Development

```bash
pnpm dev                    # Start all apps (Strapi auto-starts Docker DB)
pnpm dev:strapi             # Start Strapi only
pnpm dev:ui                 # Start Next.js only
pnpm dev:docs               # Start Docusaurus dev server
```

## Build

```bash
pnpm build                  # Build everything
pnpm build:strapi           # Build Strapi
pnpm build:ui               # Build Next.js
pnpm build:ui:static        # Next.js static export (output: 'export')
pnpm build:docs             # Build Docusaurus
```

## Start (production)

```bash
pnpm start:docs
pnpm start:strapi
pnpm start:ui
```

## Quality

```bash
pnpm lint                   # ESLint across all packages
pnpm lint:fix               # ESLint with --fix
pnpm format                 # Prettier write
pnpm format:check           # Prettier check only
pnpm typecheck              # Typecheck all packages
pnpm typecheck:ui           # Typecheck Next.js only
pnpm typecheck:strapi       # Typecheck Strapi only
```

## Strapi Types

After ANY Strapi schema change:

```bash
pnpm generate:types         # Regenerate Strapi types
pnpm sync-types             # Mirror into @repo/strapi-types
```

Forgetting causes silent type mismatches.

## Strapi Data Seeding

```bash
pnpm seed:check             # Check whether baseline content exists
pnpm seed:import            # Import latest timestamped seed export
pnpm seed:export            # Create new timestamped seed export
```

See [Data Seeding and Imports](../strapi/data-seeding.md) for workflow.

## Strapi Services

```bash
pnpm run:db                 # Start Postgres (docker compose)
pnpm run:imgproxy           # Start imgproxy locally
pnpm transfer:strapi        # Strapi data transfer (interactive)
```

## Testing

```bash
pnpm test                                   # Vitest in all apps
pnpm test:ci                                # Vitest in all apps except Strapi
pnpm test:strapi                            # Vitest in Strapi
pnpm test:ui                                # Vitest in Next.js
pnpm tests:playwright:e2e:test              # Playwright E2E
pnpm tests:playwright:e2e:test:interactive  # Playwright UI mode
pnpm tests:playwright:axe                   # axe-core a11y
pnpm tests:playwright:seo                   # SEO checks
pnpm tests:playwright:visual                # Visual regression
pnpm tests:playwright:visual:update         # Update visual regression snapshots
pnpm tests:lhci:perfo                       # Lighthouse CI
```

## Setup and lifecycle

These usually run automatically through pnpm or Git hooks, but can be invoked from the monorepo root when needed:

```bash
pnpm preinstall             # Enforce pnpm as the package manager
pnpm postinstall            # Run setup:apps after install
pnpm prepare                # Install Lefthook Git hooks
pnpm setup:apps             # Copy *.example files to matching local files if absent
```

## Commit

```bash
pnpm commit                 # Interactive Commitizen prompt
```

## Cleanup scripts

Bash helpers in `scripts/utils` — not wired into `pnpm`, invoke directly from the monorepo root:

```bash
bash scripts/utils/rm-modules.sh     # delete every node_modules in the workspace
bash scripts/utils/rm-next-cache.sh  # delete apps/ui/.next, apps/ui/out, .turbo, apps/ui/.turbo
bash scripts/utils/rm-all.sh         # nuke node_modules + .next + .turbo + .strapi + dist + build
```

Use `rm-modules.sh` to recover from `pnpm install` drift across apps (e.g. after a Node major bump or pnpm-lock conflict). Use `rm-all.sh` before a full rebuild when caches mask the bug you're chasing. Re-run `pnpm install` afterwards.

## Escape hatch

Any per-package script not wrapped above can be invoked via pnpm filters from root:

```bash
pnpm -F @repo/strapi <script>
pnpm -F @repo/ui <script>
pnpm -F @repo/docs <script>
pnpm -F @repo/design-system <script>
pnpm -F @repo/tests-playwright <script>
```

Common package-only scripts:

```bash
pnpm -F @repo/strapi config:dump        # Dump Strapi configuration to dump.json
pnpm -F @repo/strapi config:restore     # Restore Strapi configuration from dump.json
pnpm -F @repo/strapi develop            # Start Strapi through the seed runner
pnpm -F @repo/strapi develop:plain      # Start plain strapi develop
pnpm -F @repo/strapi develop:watch      # Start Strapi and watch admin changes
pnpm -F @repo/strapi generate           # Run Strapi generator
pnpm -F @repo/strapi start:plain        # Start plain strapi start
pnpm -F @repo/strapi strapi             # Run Strapi CLI
pnpm -F @repo/strapi test:watch         # Vitest watch mode for Strapi
pnpm -F @repo/ui preview                # Build and start Next.js
pnpm -F @repo/ui test:watch             # Vitest watch mode for Next.js
pnpm -F @repo/docs clear                # Clear Docusaurus cache
pnpm -F @repo/docs docusaurus           # Run Docusaurus CLI
pnpm -F @repo/design-system dev         # Watch shared design-system CSS build
pnpm -F @repo/tests-playwright playwright-seo-tests  # Playwright SEO script
```
