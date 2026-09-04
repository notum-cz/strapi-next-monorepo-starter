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
pnpm test:ci       # Vitest in all apps except Strapi
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
