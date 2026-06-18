---
sidebar_position: 4
---

# Observability

Structured logging and tracing are provided by the [`@repo/logging`](../packages/logging.md)
package. Where those logs and traces are **shipped** is configured per app
through pluggable telemetry providers, initialized at startup from each app's
`instrumentation.ts`.

By default both apps log structured JSON to stdout (pretty-printed in
development) and ship nothing to an external backend. Each provider is opt-in: it
activates only once its environment variables are set. The bundled providers are
**Azure Monitor** (logs and traces, both apps) and **Sentry** (error tracking).

## Azure Monitor / Application Insights

The bundled example provider ships logs and traces to Azure Application
Insights through the `@repo/logging/azure` exporter. It is **inert until**
`APPLICATIONINSIGHTS_CONNECTION_STRING` is set.

| Variable                                | Required for          | Notes                                          |
| --------------------------------------- | --------------------- | ---------------------------------------------- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Enabling the exporter | Without it the provider is a no-op.            |
| `OTEL_SERVICE_NAME`                     | Service name in spans | Defaults to `ui` / `strapi`.                   |
| `LOG_LEVEL`                             | Log verbosity         | See [`@repo/logging`](../packages/logging.md). |

Provider files:

- `apps/ui/src/lib/telemetry/providers/azure-monitor.ts` (Node runtime only)
- `apps/strapi/src/telemetry/providers/azure-monitor.ts`

:::info OpenTelemetry-based
Azure Monitor is an OpenTelemetry exporter, so the same approach works with any
OpenTelemetry-compatible backend (Grafana, Datadog, an OTLP collector, …). The
`logger` / `logError` / `withSpan` API the apps call is backend-agnostic and does
not change with the target. Leave it unconfigured (or remove it) if unused.
:::

:::note Browser errors need the Application Insights JavaScript SDK
This provider runs on the **server** only — it captures server logs, traces, and
exceptions, not client-side (browser) errors. To send browser telemetry to the
same Application Insights resource, add Microsoft's client SDK
([`@microsoft/applicationinsights-web`](https://www.npmjs.com/package/@microsoft/applicationinsights-web))
and initialize it from a client component with the same connection string. See
[Application Insights for JavaScript](https://learn.microsoft.com/azure/azure-monitor/app/javascript-sdk).
In this starter, browser errors are otherwise handled by [Sentry](#sentry).
:::

## Sentry

[Sentry](https://sentry.io) is an error monitoring service used to capture runtime exceptions, handled errors, and release diagnostics. Sentry and Azure Monitor can run together or independently.

The monorepo has two Sentry integrations:

- Next.js UI error tracking in `apps/ui`
- Strapi CMS error tracking through `@strapi/plugin-sentry` in `apps/strapi`

### Next.js UI

Sentry is wired as a UI telemetry provider. Server and edge initialization live in `apps/ui/src/lib/telemetry/providers/sentry.ts`, which stays inert until `NEXT_PUBLIC_SENTRY_DSN` is set. Browser initialization stays in `sentry.client.config.ts` (loaded automatically by the Sentry SDK).

`error.tsx` and the `<ErrorBoundary />` component report caught errors by calling `Sentry.captureException()` directly. The exported Next config is also wrapped with `withSentryConfig()` for source-map upload and build-time integration.

| Var                                                 | Required for                   | Notes                              |
| --------------------------------------------------- | ------------------------------ | ---------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`                            | Enabling Sentry at runtime     | Without it the SDK is a no-op.     |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Source-map upload during build | Optional but recommended for prod. |

Use `@sentry/nextjs` when you need to report handled UI errors manually:

```tsx
import * as Sentry from "@sentry/nextjs"

try {
  await submitForm()
} catch (error) {
  Sentry.captureException(error)
}
```

Relevant UI files:

- `apps/ui/src/lib/telemetry/providers/sentry.ts` (server + edge init)
- `apps/ui/sentry.client.config.ts` (browser init)
- `apps/ui/src/instrumentation.ts`
- `apps/ui/next.config.mjs`

### Strapi

`@strapi/plugin-sentry` adds Strapi-side error tracking.

Set `SENTRY_DSN` to enable it. The plugin runs in production only by default; change `apps/strapi/config/plugins.ts` if you want it active in development.

Uncaught Strapi errors are reported automatically. You can also send custom errors or messages from controllers and services:

```ts
async find(ctx) {
  const sentry = strapi.plugin("sentry").service("sentry")

  sentry.sendError(new Error("My custom error"))

  const instance = sentry.getInstance()
  instance?.captureMessage("My custom message")
}
```

:::warning
`instance` is `undefined` when Sentry is disabled, so always optional-chain calls on it.
:::

Relevant Strapi files:

- `apps/strapi/config/plugins.ts`

Strapi-side Sentry docs: [docs.strapi.io/dev-docs/plugins/sentry](https://docs.strapi.io/dev-docs/plugins/sentry).

## Runtime boundaries

The logger runs with full features — structured JSON, redaction, trace
correlation, backend export — only on the **server**: Strapi, the UI's server
components, route handlers, and the `proxy.ts` middleware (Node runtime in
Next.js 16+). In the **browser** it does not crash — pino falls back to a thin
`console` shim — but it degrades:

- logs print to the devtools console only; **nothing is exported to a backend**
  (the Azure Monitor exporter is server-only),
- context-less calls render with a leading empty `{}` (pino-browser prints the
  bindings object before the message),
- the pino + OpenTelemetry shim is added to the **client bundle**, and
- if Sentry console forwarding is enabled, the lines are shipped to Sentry too.

Browser error tracking is [Sentry](#sentry)'s job, not the logger's.

### The rule

**Use the logger where it runs on the server; use `console` where it runs only
in the browser.**

- **Server-only code** (Strapi, route handlers, RSC, `proxy.ts`) — always the
  logger.
- **Dual server/client modules** (e.g. the Strapi API client
  `strapi-api/base.ts`) — the logger: it's structured on the server and degrades
  to `console` in the browser, so error logging stays uniform.
- **Purely client-side, hot, or dev-only spots** (React component dev warnings,
  the `removeThisWhenYouNeedMe` helper, small client helpers like
  `general-helpers.ts`) — plain `console.*`. It renders cleanly, adds no bundle
  weight, and Sentry still captures it.
