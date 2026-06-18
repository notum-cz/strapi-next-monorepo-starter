---
sidebar_position: 8
---

# `@repo/logging`

Shared **server-side** structured logging for the UI and Strapi apps, built on
[pino](https://getpino.io) with OpenTelemetry trace correlation.

The package lives in:

```text
packages/logging
```

## Exports

| Export    | Purpose                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| `.`       | `createLogging()` plus the `logger` / `logError` / `withSpan` helpers and shared types.  |
| `./azure` | `initializeAzureMonitor()` — the optional Azure Monitor / Application Insights exporter. |

The core export is **provider-neutral**: it pulls in no vendor SDK on its public
surface, so telemetry backends are added separately (see
[Observability integration](../integrations/logging.md)).

:::note Server-first
The logger is structured, redacting, and trace-correlated on the **server**
(including the `proxy.ts` middleware — Node runtime in Next.js 16+). In the
browser, pino falls back to a thin `console` shim with no backend export, so use
the logger in server and dual server/client modules and keep plain `console.*`
in purely client-side or hot paths. See
[Observability → Runtime boundaries](../integrations/logging.md#runtime-boundaries).
:::

## App wrappers

Each app keeps a thin wrapper so environment handling stays app-local. Import
from the wrapper, never from `@repo/logging` directly:

| App    | Wrapper                            | Import                                            |
| ------ | ---------------------------------- | ------------------------------------------------- |
| UI     | `apps/ui/src/lib/logging.ts`       | `import { logger } from "@/lib/logging"`          |
| Strapi | `apps/strapi/src/utils/logging.ts` | `import { logger } from "../../../utils/logging"` |

## API

```ts
import { logger, logError, withSpan } from "@/lib/logging"

// Structured application events
logger.info("Preview enabled", { slug, locale })
logger.warn("CDN purge skipped", { reason: "missing token" })

// Errors — serializes stack/name/message and records on the active span
try {
  await revalidatePaths(paths)
} catch (error) {
  logError(error, "Revalidation failed", { paths })
}

// Spans around important async operations — marked failed if they throw
const result = await withSpan("cdn.purge", () => purgeCdnCache(paths), {
  count: paths.length,
})
```

Reach for `withSpan` around the operations worth tracing on their own —
external API calls, cache revalidation, CDN purge, email sending, and webhook
handling — so failures surface as failed spans in the telemetry backend.

`createLogging()` redacts common secret fields (`authorization`, `cookie`,
`password`, `token`, `apiKey`, …, including one level of nesting) before a line
is written. Still scope logs intentionally — never log raw headers, cookies,
tokens, or credential-bearing URLs.

## Configuration

| Variable            | Effect                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `LOG_LEVEL`         | `trace` \| `debug` \| `info` \| `warn` \| `error` \| `fatal` \| `silent`. Defaults to `info`. |
| `OTEL_SERVICE_NAME` | Service name attached to every log line and span. Defaults to `ui` / `strapi`.                |
| `APP_ENV`           | Environment label (falls back to `NODE_ENV`, then `local`).                                   |

Local development logs are pretty-printed (`pino-pretty`) when `NODE_ENV` is
`development`; otherwise lines are JSON for backend ingestion.

## Related Documentation

- [Observability](../integrations/logging.md) — pluggable telemetry backends (Azure Monitor, Sentry)
