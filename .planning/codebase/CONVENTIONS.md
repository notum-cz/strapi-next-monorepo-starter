# Coding Conventions

**Analysis Date:** 2026-03-17

## Naming Patterns

**Files:**

- React components: PascalCase `.tsx` (e.g., `SignInForm.tsx`, `ErrorBoundary.tsx`)
- Hooks: camelCase with `use` prefix `.ts` (e.g., `useUserMutations.ts`, `usePages.ts`)
- Utilities/helpers: kebab-case `.ts` (e.g., `general-helpers.ts`, `strapi-helpers.ts`)
- API routes (Next.js): `route.ts` inside bracket-parameterized directories
- Test files: `*.test.ts` under `__tests__/` subdirectory (unit) or `tests/` at app root (integration)
- Playwright specs: `*.spec.ts`

**Functions:**

- Regular functions: camelCase (`formatDate`, `setupStrapi`, `unwrapBetterAuth`)
- Named React components: PascalCase function declarations — enforced by ESLint rule `react/function-component-definition: namedComponents: "function-declaration"`
- Unnamed/inline components: arrow functions — enforced by `react/function-component-definition: unnamedComponents: "arrow-function"`
- Event handlers: `handle` prefix (e.g., `handleTryAgain`, `handleError`) — enforced by `react/jsx-handler-names`
- Event handler props: `on` prefix (e.g., `onSubmit`, `onError`, `onReset`)
- Async functions: standard `async function` or `async () =>` arrow notation — `no-return-await` rule enforced

**Variables:**

- camelCase for all variables and constants in module scope
- Unused variables/args prefixed with `_` to bypass linting (e.g., `_unused`) — `argsIgnorePattern: "^_"`
- `SCREAMING_SNAKE_CASE` for exported constants (e.g., `DATE_FORMAT`, `API_ENDPOINTS`)

**Types and Interfaces:**

- PascalCase for interfaces and type aliases (e.g., `CustomFetchOptions`, `AppError`, `FormSchemaType`)
- Type imports must use `type` keyword — enforced by `@typescript-eslint/consistent-type-imports`
- Prefer `interface` for object shapes used as public API; `type` for unions/intersections
- `@typescript-eslint/consistent-type-definitions` is OFF — both forms accepted
- Namespaces allowed only in declaration files — `@typescript-eslint/no-namespace: allowDeclarations: true`

**React Components:**

- Component props typed inline as object literal in function signature (not a separate `Props` type in most files)
- `readonly` modifier applied to prop fields in internal fallback/sub-components (e.g., `ErrorBoundaryFallback`)
- JSX restricted to `.tsx` and `.jsx` extensions only — `react/jsx-filename-extension` error

**Class Members:**

- Enforced ordering via `sort-class-members`: static properties → static methods → instance properties → conventional-private properties → constructor → methods → conventional-private methods
- Accessor pairs placed together (`accessorPairPositioning: "together"`)

## Code Style

**Formatting:**

- Tool: Prettier via `eslint-plugin-prettier` (run through ESLint, not standalone)
- Config: `packages/eslint-config/src/configs/prettier.js` and `prettier.config.mjs`
- Double quotes (`singleQuote: false`)
- No semicolons (`semi: false`)
- 2-space indentation (`tabWidth: 2`, `useTabs: false`)
- LF line endings (`endOfLine: "lf"`)
- Trailing commas in ES5 positions (`trailingComma: "es5"`)
- Arrow function parentheses always (`arrowParens: "always"`)
- Bracket on new line (`bracketSameLine: false`)
- Prettier plugins: `prettier-plugin-packagejson`, `prettier-plugin-tailwindcss`

**Linting:**

- ESLint flat config via shared `@repo/eslint-config` package
- Applied plugins: `@typescript-eslint`, `unicorn`, `sonarjs`, `eslint-plugin-react`, `react-hooks`, `jsx-a11y`, `react-refresh`, `import-x`, `unused-imports`, `sort-class-members`, `@stylistic`
- `@typescript-eslint/no-explicit-any`: `warn` (not error — some `any` allowed with justification)
- `@typescript-eslint/ban-ts-comment`: `ts-expect-error` allowed only with description
- `curly: ["error", "all"]` — all if/else blocks require braces
- `no-console`: warn, allowing `console.warn`, `console.error`, `console.debug`, `console.dir`
- `no-return-await`: error
- Tailwind CSS classes auto-sorted by `prettier-plugin-tailwindcss`

## Import Organization

**Order (enforced by `import-x/order`):**

1. Built-ins (Node.js modules, e.g., `node:fs`, `node:path`)
2. External packages — with React/Next/Svelte/Docusaurus floated to the top via `pathGroups`
3. Internal alias imports (`@/**` pattern)
4. Asset/style imports (`.css`, `.json`, `.png`, `.svg` etc.) — last

**Rules:**

- Newline always between groups (`newlines-between: "always"`)
- Groups alphabetized case-insensitively (`alphabetize: { order: "asc", caseInsensitive: true }`)
- No duplicate imports; inline `type` preferred when combining type and value imports (`import-x/no-duplicates: { "prefer-inline": true }`)
- Newline required after last import block (`import-x/newline-after-import`)

**Path Aliases:**

- `@/` maps to `apps/ui/src/` (configured in `apps/ui/vitest.config.ts` and `next.config.mjs`)
- `@repo/` maps to workspace packages (e.g., `@repo/strapi-types`, `@repo/shared-data`)

## Error Handling

**Patterns:**

- API errors structured as `AppError` interface (`src/types/general.ts`): `{ message, status, name?, details? }`
- `BaseStrapiClient` (`src/lib/strapi-api/base.ts`) throws serialized JSON strings for HTTP errors via `throw new Error(JSON.stringify(appError))`
- `unwrapBetterAuth` helper pattern in hooks: accepts `{ data, error }` result, throws on error, returns data — used across all auth mutations
- `ErrorBoundary` component (`src/components/elementary/ErrorBoundary.tsx`) wraps risky renders; re-throws 404s (NEXT_NOT_FOUND), captures others to Sentry
- `safeJSONParse` utility in `src/lib/general-helpers.ts` wraps `JSON.parse` with try/catch, logs error, returns `{}` on failure
- TypeChecked rule `@typescript-eslint/only-throw-error` (when enabled): restricts `throw` to `Error` objects

## Logging

**Framework:** Native `console` (no structured logging library)

**Patterns:**

- `console.warn` — for expected/degraded conditions (e.g., missing baseline snapshots, dev-only warnings)
- `console.error` — for API errors in `BaseStrapiClient`; prefixed with context string: `[BaseStrapiClient] Strapi API request error:`
- `console.debug` / `console.dir` — allowed; `console.log` is disallowed via linting
- Sentry used for client-side exception capture in `ErrorBoundary`
- Debug logging guarded behind `getEnvVar("DEBUG_STRAPI_CLIENT_API_CALLS")` env flag

## Comments

**When to Comment:**

- Explain non-obvious decisions, disabled lint rules, and workarounds (e.g., `// @ts-expect-error localizations field is not in the response type`)
- All `eslint-disable` suppressions must include a brief reason after `--` (e.g., `// eslint-disable-next-line react/jsx-handler-names -- react-hook-form API`)
- All `@ts-expect-error` uses must include a description (enforced by `@typescript-eslint/ban-ts-comment: { "ts-expect-error": "allow-with-description" }`)
- JSDoc used on public utility methods in abstract classes (e.g., `BaseStrapiClient`) and config helpers

**TSDoc:**

- Used on exported functions and class methods that need parameter documentation
- JSDoc parsing mode set to `"none"` for performance in TypeScript parser options; TSDoc is for human readability only

## Function Design

**Size:** No hard line limit enforced, but SonarJS `cognitive-complexity` rule warns on high-complexity functions

**Parameters:**

- Default parameters must come last — `@typescript-eslint/default-param-last: error`
- Prefer destructuring for options objects over positional params

**Return Values:**

- Explicit `return` required in class render methods — `react/require-render-return: error`
- `@typescript-eslint/strict-void-return` enforced when type-checked config is applied
- `no-return-await` disallows `return await expr` — use `return expr` directly

## Module Design

**Exports:**

- Named exports preferred; default exports used only for Next.js page/layout/route conventions
- `@typescript-eslint/no-useless-empty-export: error` — no empty export `{}` statements
- `unicorn/prefer-export-from`: prefer `export { x } from "y"` over import-then-export when variable is not used locally

**Barrel Files:**

- Used in some packages (e.g., `packages/eslint-config/src/configs/index.js`) but not systematically in `apps/ui/src`
- Direct path imports preferred in the UI app

## Commit Conventions

**Format:** Conventional Commits (`@commitlint/config-conventional`)

- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, etc.
- Scopes validated against pnpm workspace package names (`@commitlint/config-pnpm-scopes`)
- Tooling: `commitizen` with `cz-conventional-changelog` — use `pnpm commit` to compose messages interactively
- Husky + lint-staged enforce lint/format on pre-commit

---

_Convention analysis: 2026-03-17_
