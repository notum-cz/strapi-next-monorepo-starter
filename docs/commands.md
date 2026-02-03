# Commands Reference

All commands use pnpm and can be run from the repository root unless noted otherwise.

## Development

```bash
pnpm dev                    # Start both apps (Strapi needs Docker DB running)
pnpm dev:strapi             # Start Strapi only (auto-starts Docker DB)
pnpm dev:ui                 # Start Next.js only
```

## Build

```bash
pnpm build                  # Build all packages
pnpm build:ui               # Build Next.js
pnpm build:strapi           # Build Strapi
pnpm build:ui:static        # Next.js static export (output: 'export')
```

## Quality

```bash
pnpm lint                   # ESLint across all packages
pnpm format                 # Prettier format all
pnpm format:check           # Check formatting without writing
```

## Type Checking

```bash
cd apps/ui && pnpm typecheck    # Typecheck Next.js app
```

## Type Generation

After ANY Strapi schema change:

```bash
cd apps/strapi && pnpm generate:types
```

This updates `@repo/strapi-types`. Forgetting causes silent type mismatches.

## Testing

```bash
pnpm tests:playwright:e2e:test              # Playwright E2E tests
pnpm tests:playwright:e2e:test:interactive  # Playwright UI mode
pnpm tests:playwright:axe                   # Accessibility tests (axe-core)
```