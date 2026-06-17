---
name: remove-sentry
description: "Completely remove Sentry from this monorepo — both the Next.js UI (@sentry/nextjs) and Strapi (@strapi/plugin-sentry) — while keeping pino structured logging (@repo/logging) intact. Use whenever the user wants to drop Sentry, remove error tracking, stop using @sentry/nextjs, delete the Sentry provider/integration, or clean Sentry out of the starter. The logger (logger/logError/withSpan) and all its call sites must stay working."
argument-hint: "[--dry-run]"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

# Remove Sentry

Remove Sentry entirely from both apps **without touching pino logging**. After
this skill runs, `@repo/logging` and every `logger` / `logError` / `withSpan`
call site still works exactly as before — only Sentry (the error-tracking
backend) is gone.

## Why this is safe

Sentry is wired as one **pluggable telemetry provider** plus a few framework
hooks; it is independent of the structured-logging core. The logger ships logs
to stdout (and, if configured, Azure Monitor) regardless of Sentry. So removing
Sentry is a self-contained subtraction.

## Guardrails — do NOT remove these

These belong to logging, not Sentry. Leave them untouched:

- `packages/logging/**` (pino, `@opentelemetry/api`, `createLogging`, `logError`, `withSpan`).
- `apps/ui/src/lib/logging.ts`, `apps/strapi/src/utils/logging.ts` (the app wrappers).
- `apps/ui/src/lib/telemetry/providers/azure-monitor.ts`, `apps/strapi/src/telemetry/providers/azure-monitor.ts` and the `azureMonitorProvider()` registry entries.
- Any `logger.*` / `logError(...)` / `withSpan(...)` call site.
- `apps/strapi/config/logger.ts` (Strapi's `@strapi/logger` formatting — unrelated to `@strapi/plugin-sentry`).

If the user also wants Azure Monitor gone, that is the separate
`remove-azure-monitor` skill.

## Procedure

Work top-down. After the known edits, run the discovery grep to catch anything
left. If `--dry-run` is passed, report the planned changes instead of editing.

### 1. UI — telemetry provider

- Delete `apps/ui/src/lib/telemetry/providers/sentry.ts`.
- In `apps/ui/src/lib/telemetry/index.ts`: remove the `import { sentryProvider } from "./providers/sentry"` line and the `sentryProvider()` entry from the providers array. (Leave `azureMonitorProvider()` if present. If the array ends up empty, keep the registry — it stays a valid no-op scaffold.)

### 2. UI — browser SDK + instrumentation

- Delete `apps/ui/sentry.client.config.ts`.
- In `apps/ui/src/instrumentation.ts`: remove `import * as Sentry from "@sentry/nextjs"` and the `export const onRequestError = Sentry.captureRequestError` line. Keep the `register()` function and its `initializeTelemetry(runtime)` call.

### 3. UI — error boundaries

`Sentry.captureException(error)` is called in two client components. Remove the
Sentry import and replace the capture call with `console.error(error)` so errors
stay visible in the browser console (these are client components — `console` is
correct there, see the Observability doc's runtime boundaries):

- `apps/ui/src/app/[locale]/error.tsx`
- `apps/ui/src/components/elementary/ErrorBoundary.tsx`

### 4. UI — next.config

In `apps/ui/next.config.mjs`:

- Remove `import { withSentryConfig } from "@sentry/nextjs"`.
- Replace the `withConfig` IIFE that wraps `withSentryConfig(...)` with a direct export of the intl-wrapped config:

  ```js
  export default withNextIntl(nextConfig)
  ```

  (Delete the whole `const withConfig = (() => { ... })()` block and the `export default withConfig`.)

- Sentry is not in `serverExternalPackages`; leave `pino`, `pino-pretty`, and `@azure/monitor-opentelemetry` there.

### 5. UI — env + deps

- `apps/ui/src/env.mjs`: remove `NEXT_PUBLIC_SENTRY_DSN` (client), and `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING` (server) — from both the schema blocks and the `runtimeEnv` block.
- `apps/ui/package.json`: remove the `@sentry/nextjs` dependency.
- `apps/ui/.env.local.example`: remove the Sentry settings section. Keep the Observability section.

### 6. Strapi

- `apps/strapi/config/plugins.ts`: remove the `sentry: { ... }` plugin block.
- `apps/strapi/package.json`: remove the `@strapi/plugin-sentry` dependency.
- `apps/strapi/.env.example`: remove the `# ------- Sentry -------` section and `SENTRY_DSN`. Keep the Observability section.

### 7. Shared config

- `turbo.json` `globalEnv`: remove `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING`.

### 8. Docs

- `apps/docs/docs/reference/integrations/logging.md`: delete the entire `## Sentry` section (including the `### Next.js UI` and `### Strapi` subsections). In the `## Runtime boundaries` section, drop the "browser errors are covered by Sentry" clause. Update the intro line that lists bundled providers so it no longer names Sentry.
- `apps/docs/docs/reference/packages/logging.md`: in "Related Documentation", change "(Azure Monitor, Sentry)" to drop Sentry.
- Fix cross-references that point at `logging.md#sentry` or describe Sentry — search and update: `apps/docs/docs/ui/next-config.md`, `apps/docs/docs/ui/error-handling.md`, `apps/docs/docs/getting-started/features.md`, `apps/docs/docs/strapi/environment-variables.md` (also drop the `SENTRY_DSN` table row), `apps/docs/docs/strapi/plugins/overview.md` (drop the Sentry row).

### 9. Reinstall + discovery sweep

```bash
pnpm install
# Catch anything missed (ignore node_modules / build output):
grep -rin "sentry" apps packages turbo.json .env* --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.json" --include="*.md" 2>/dev/null | grep -v node_modules
```

Resolve every remaining hit. Some are legitimate to delete (configs, deps),
others are docs prose to reword.

## Verify

Run these and confirm they pass (Node engine warnings are expected and harmless):

```bash
pnpm -F @repo/ui exec tsc --noEmit
pnpm -F @repo/strapi exec tsc --noEmit -p tsconfig.json
pnpm -F @repo/ui build          # confirms next.config no longer needs withSentryConfig
pnpm -F @repo/ui test
pnpm -F @repo/strapi test
pnpm -F @repo/docs build        # fails on broken links — confirms no dangling Sentry refs
```

Sanity-check that logging still works: a `grep -rn "logError\|logger\." apps/ui/src apps/strapi/src` should still show the call sites, and `@repo/logging` should be unchanged.
