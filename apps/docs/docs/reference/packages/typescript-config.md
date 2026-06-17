---
sidebar_position: 6
---

# `@repo/typescript-config`

Shared TypeScript config presets for apps and packages.

| File                 | Display         | Use                                                                                           |
| -------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| `base.json`          | `Default`       | Strict base config with NodeNext modules, `target: ES2022`, and `noUncheckedIndexedAccess`.   |
| `nextjs.json`        | `Next.js`       | Extends base for `apps/ui`; uses Bundler module resolution and the Next.js TypeScript plugin. |
| `react-library.json` | `React Library` | Extends base for React package builds with `jsx: react-jsx`.                                  |

Apps use these with `extends`, for example:

```json
{
  "extends": "@repo/typescript-config/nextjs.json"
}
```
