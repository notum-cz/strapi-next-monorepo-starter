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

## Version notes

The config targets ESLint 10.

- **React:** `eslint-plugin-react` 7.x still calls context APIs that ESLint 10 removed, so `configs/react.js` wraps it with `fixupPluginRules` from `@eslint/compat`. Drop the wrapper once the plugin supports ESLint 10.
- **Unicorn (`configs/unicorn.js`):** extends the plugin's `recommended` config (v79) with project overrides.
  - Renamed rules use their current names: `unicorn/no-for-each` (was `no-array-for-each`) and `unicorn/name-replacements` (was `prevent-abbreviations`). Both are off.
  - `unicorn/no-asterisk-prefix-in-documentation-comments` is off, because it conflicts with the repo's JSDoc `/** … */` style.
  - The style rules that unicorn 67–79 added to `recommended` are off in one commented block. Their autofixes rewrite working code into a different style. Enable them one at a time in a dedicated change and review the autofix diff.
  - The test-file override is gone. It only turned off `unicorn/no-duplicate-string`, a rule that does not exist.
