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
pnpm test:strapi                            # Vitest in Strapi
pnpm test:ui                                # Vitest in Next.js
pnpm tests:playwright:e2e:test              # Playwright E2E
pnpm tests:playwright:e2e:test:interactive  # Playwright UI mode
pnpm tests:playwright:axe                   # axe-core a11y
pnpm tests:playwright:seo                   # SEO checks
pnpm tests:playwright:visual                # Visual regression
pnpm tests:lhci:perfo                       # Lighthouse CI
```

## Commit

```bash
pnpm commit                 # Interactive Commitizen prompt
```

## Escape hatch

Any per-package script not wrapped above can be invoked via pnpm filters from root:

```bash
pnpm -F @repo/strapi <script>
pnpm -F @repo/ui <script>
```
