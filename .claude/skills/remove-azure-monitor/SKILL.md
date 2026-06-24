---
name: remove-azure-monitor
description: "Completely remove the Azure Monitor / Application Insights telemetry exporter from this monorepo while keeping pino structured logging (@repo/logging) and OpenTelemetry trace context intact. Use whenever the user wants to drop Azure Monitor, remove Application Insights, delete @azure/monitor-opentelemetry, remove the @repo/logging/azure target, or stop shipping logs/traces to Azure. The logger (logger/logError/withSpan) and all its call sites must keep working — only the Azure exporter goes."
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

# Remove Azure Monitor

Remove the Azure Monitor / Application Insights exporter (`@azure/monitor-opentelemetry`,
the `@repo/logging/azure` subpath, and the `azure-monitor` telemetry providers)
**without touching pino logging or OpenTelemetry trace context**. After this
skill runs, the apps still log structured JSON via `@repo/logging` and still
create spans with `withSpan` — those logs/traces just aren't exported to Azure.

## What stays vs. what goes

**Keep (this is the "structural logging tool" the user wants to retain):**

- `packages/logging/index.ts` — pino logger, `createLogging`, `logError`, `withSpan`.
- `@opentelemetry/api` dependency — `withSpan` and trace-context correlation use it. This is the OTel **API**, not the Azure exporter. Do not remove it.
- The app wrappers `apps/ui/src/lib/logging.ts`, `apps/strapi/src/utils/logging.ts`.
- `OTEL_SERVICE_NAME` and `LOG_LEVEL` env vars — the pino wrapper reads these for the service name and level. Keep them everywhere (env.mjs, turbo.json, `.env.example`).
- Every `logger.*` / `logError(...)` / `withSpan(...)` call site.

**Remove (the Azure exporter only):**

- `@azure/monitor-opentelemetry` dependency and `packages/logging/azure.ts`.
- The `azure-monitor` telemetry providers and their registry entries.
- `APPLICATIONINSIGHTS_CONNECTION_STRING` env var.

If the user also wants Sentry gone, that is the separate `remove-sentry` skill.

## Procedure

Work top-down, then run the discovery grep to catch leftovers. If `--dry-run` is
passed, report the planned changes instead of editing.

### 1. The shared package

- Delete `packages/logging/azure.ts`.
- `packages/logging/package.json`:
  - Remove the `"./azure"` entry from `exports`.
  - Remove `"@azure/monitor-opentelemetry"` from `dependencies`.
  - Keep `pino` and `@opentelemetry/api`.

### 2. UI telemetry provider

- Delete `apps/ui/src/lib/telemetry/providers/azure-monitor.ts`.
- `apps/ui/src/lib/telemetry/index.ts`: remove the `import { azureMonitorProvider } from "./providers/azure-monitor"` line and its entry in the providers array. (Leave `sentryProvider()` if present.)

### 3. Strapi telemetry provider

- Delete `apps/strapi/src/telemetry/providers/azure-monitor.ts`.
- `apps/strapi/src/telemetry/index.ts`: remove the `azureMonitorProvider` import and array entry.
- Azure is currently Strapi's **only** telemetry provider. With it gone the registry has no providers. Choose based on intent:
  - **Default (keep scaffold):** leave `apps/strapi/src/telemetry/` and `apps/strapi/src/instrumentation.ts` in place with an empty providers array — `initializeTelemetry()` becomes a harmless no-op, ready for a future provider.
  - **Or remove the scaffold:** delete `apps/strapi/src/telemetry/` and `apps/strapi/src/instrumentation.ts`, and remove the `import "./instrumentation"` line from `apps/strapi/src/index.ts`. Do NOT remove the `logger.info("Strapi bootstrap …")` calls or the `import { logger } from "./utils/logging"`.

  Ask the user which they prefer if it is not obvious from context.

### 4. UI next.config

- `apps/ui/next.config.mjs`: in `serverExternalPackages`, remove `"@azure/monitor-opentelemetry"`. **Keep `"pino"` and `"pino-pretty"`** — pino still needs to be a server external.

### 5. Env + shared config

- `apps/ui/src/env.mjs`: remove `APPLICATIONINSIGHTS_CONNECTION_STRING` from the server schema block and `runtimeEnv`. Keep `OTEL_SERVICE_NAME` and `LOG_LEVEL`.
- `turbo.json` `globalEnv`: remove `APPLICATIONINSIGHTS_CONNECTION_STRING`. Keep `OTEL_SERVICE_NAME` and `LOG_LEVEL`.
- `apps/ui/.env.local.example` and `apps/strapi/.env.example`: remove the `APPLICATIONINSIGHTS_CONNECTION_STRING` line (and the "Azure Monitor … telemetry provider" comment). Keep the `LOG_LEVEL` and `OTEL_SERVICE_NAME` lines.

### 6. Docs

- `apps/docs/docs/reference/integrations/logging.md`: delete the `## Azure Monitor / Application Insights` section. Update the intro line that lists bundled providers so it no longer names Azure Monitor. If Sentry is still present it remains the documented provider; if no providers remain, reword the page to describe stdout-only logging with the provider pattern available for future backends.
- `apps/docs/docs/reference/packages/logging.md`: remove the `./azure` row from the Exports table and any `@repo/logging/azure` / Azure mention; update "Related Documentation" to drop Azure Monitor.
- `apps/docs/docs/strapi/environment-variables.md`: remove the `APPLICATIONINSIGHTS_CONNECTION_STRING` table row. Keep `LOG_LEVEL` and `OTEL_SERVICE_NAME` rows.

### 7. Reinstall + discovery sweep

```bash
pnpm install
pnpm -F @repo/logging build   # rebuild dist without azure.ts
# Catch anything missed (ignore node_modules / build output):
grep -rin "azure.monitor\|applicationinsights\|monitor-opentelemetry\|@repo/logging/azure\|azureMonitor" apps packages turbo.json .env* --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.json" --include="*.md" 2>/dev/null | grep -v node_modules
```

Note: `@repo/logging/azure` is distinct from the Azure Front Door **CDN** purge
provider (`apps/ui/src/lib/cdn/providers/azure-front-door.ts` and the `AZURE_*`
CDN env vars). The CDN integration is unrelated — do not remove it.

## Verify

Run these and confirm they pass (Node engine warnings are expected and harmless):

```bash
pnpm -F @repo/logging build
pnpm -F @repo/ui exec tsc --noEmit
pnpm -F @repo/strapi exec tsc --noEmit -p tsconfig.json
pnpm -F @repo/ui build
pnpm -F @repo/ui test
pnpm -F @repo/strapi test
pnpm -F @repo/docs build        # fails on broken links — confirms no dangling Azure Monitor refs
```

Confirm logging still works: `@repo/logging` still exports `logger`/`logError`/`withSpan`,
`@opentelemetry/api` is still a dependency, and `withSpan` call sites still typecheck.
