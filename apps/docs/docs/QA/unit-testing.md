---
sidebar_position: 2
---

# Unit Testing

Unit and integration tests use Vitest. Run them from the monorepo root.

| Area   | Tooling | Location               |
| ------ | ------- | ---------------------- |
| Strapi | Vitest  | `apps/strapi/tests`    |
| UI     | Vitest  | `apps/ui/**/*.test.ts` |

## Commands

```bash
pnpm test          # Vitest in all apps
pnpm test:ci       # CI Vitest target (same suite as pnpm test)
pnpm test:strapi   # Vitest in Strapi
pnpm test:ui       # Vitest in Next.js UI
```

## UI Tests

UI tests are discovered by the `apps/ui/vitest.config.ts` include pattern:

```ts
include: ["src/**/*.test.ts"]
```

Use colocated `*.test.ts` files near the module under test. A dedicated `__tests__` folder is not required.

## What Belongs Here

- Helpers and formatting utilities.
- API client utilities.
- Strapi services and schema-related utilities.
- Small integration points that do not need a real browser.

## Mutation Testing

To check whether these tests would actually catch a bug, run StrykerJS with `pnpm test:mutation:ui` or `pnpm test:mutation:strapi`. When you add a test for a module that isn't covered yet, add the module to the app's `stryker.config.mjs` `mutate` list. See [Mutation Testing](./mutation-testing.md).
