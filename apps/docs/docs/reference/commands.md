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
pnpm dev:docs               # Start Docusaurus dev server on port 3300
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
pnpm start:docs             # Serve built Docusaurus site on port 3300
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
pnpm test:ci                                # CI Vitest target (same suite as pnpm test)
pnpm test:strapi                            # Vitest in Strapi
pnpm test:ui                                # Vitest in Next.js
pnpm tests:playwright:e2e:test              # Playwright E2E
pnpm tests:playwright:e2e:test:interactive  # Playwright UI mode
pnpm tests:playwright:axe                   # axe-core a11y
pnpm tests:playwright:seo                   # SEO checks
pnpm tests:playwright:visual                # Visual regression
pnpm tests:playwright:visual:docker         # Visual regression in Docker/Linux
pnpm tests:playwright:visual:docker:update  # Update Linux visual snapshots in Docker
pnpm tests:playwright:visual:update         # Update visual regression snapshots
pnpm tests:lhci:perfo                       # Lighthouse CI
```

See [Playwright Testing](./testing/playwright.md) for browser setup and visual snapshot workflow.

## Worktrees

Multi-branch development uses Git worktrees driven by the root `worktree.config.json` manifest.

```bash
pnpm worktree:create  <branch> [base]   # create a worktree; default base: dev, falls back to main
pnpm worktree:setup   <path>            # re-apply the manifest to an existing worktree
pnpm worktree:cleanup <path-or-branch>  # remove a worktree; refuses unmerged branches unless --force
```

Useful flags:

```bash
pnpm worktree:create  <branch> [base] --force      # recreate an existing target
pnpm worktree:setup   <path> --force               # overwrite manifest-managed files/links
pnpm worktree:cleanup <path-or-branch> --base dev  # verify merge status against a specific base
pnpm worktree:cleanup <path-or-branch> --force     # skip merge verification
```

Placement is resolved by `scripts/worktree/create.sh`:

- From the canonical checkout or a bare repo: `<repo-root>/.worktrees/<branch-slug>`.
- From inside an existing linked worktree: a sibling beside that worktree.
- The script refuses to nest a new worktree inside another linked worktree.

`worktree.config.json` declares files to copy, paths to symlink, and `postSetup` commands. The current manifest copies `apps/strapi/.env`, `apps/ui/.env.local`, and `.env`, then runs `pnpm install --frozen-lockfile --prefer-offline` and builds shared packages. Adding another env file should be a manifest edit, not a script edit.

The implementation lives in `scripts/worktree/`: `create.sh`, `setup.sh`, `cleanup.sh`, `detect-root.sh`, and `lib/manifest.sh`. `detect-root.sh` resolves the canonical repo root so the commands work from the main checkout, a linked worktree, or a bare repo. `setup.sh` requires `jq` because the manifest is JSON.

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

## Git hook and branch helpers

These are direct shell scripts used by hooks or the worktree flow:

```bash
bash scripts/commitlint-readable.sh <message-file>  # commitlint wrapper with readable hook output
bash scripts/lint-staged-readable.sh                # lint-staged wrapper with readable hook output
bash scripts/validate-branch-name.sh                # enforce <type>/STAR-<number>-<description>
```

`scripts/validate-branch-name.sh` allows `main`, `master`, `develop`, `dev`, `release/*`, and `hotfix/*`; feature branches must use one of `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, or `test`.

## Escape hatch

Any per-package script not wrapped above can be invoked via pnpm filters from root:

```bash
pnpm -F @repo/strapi <script>
pnpm -F @repo/ui <script>
pnpm -F @repo/docs <script>
pnpm -F @repo/design-system <script>
pnpm -F @repo/logging <script>
pnpm -F @repo/shared-data <script>
pnpm -F @repo/strapi-types <script>
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
pnpm -F @repo/logging build             # Build shared logging package
pnpm -F @repo/logging typecheck         # Typecheck shared logging package
pnpm -F @repo/shared-data build         # Build shared data package
pnpm -F @repo/shared-data typecheck     # Typecheck shared data package
pnpm -F @repo/design-system dev         # Watch shared design-system CSS build
pnpm -F @repo/strapi-types sync-types   # Copy generated Strapi types into the package
pnpm -F @repo/tests-playwright playwright-seo-tests  # Playwright SEO script
```
