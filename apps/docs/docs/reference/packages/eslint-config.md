---
sidebar_position: 5
---

# `@repo/eslint-config`

Shared flat ESLint config consumed by the root `eslint.config.mjs`.

## Exports

| Export      | Purpose                                                             |
| ----------- | ------------------------------------------------------------------- |
| `.`         | Full pre-composed flat config array.                                |
| `./configs` | Individual config groups for packages that need custom composition. |

The config groups include JavaScript, TypeScript, React, Next.js, Vitest, Turbo, Prettier, import rules, unused imports, Unicorn, SonarJS, and sort-class-members.

`prettierOptions` is exported from the config package and consumed by the root Prettier config so formatting behavior stays aligned.
