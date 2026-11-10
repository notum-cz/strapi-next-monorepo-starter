---
sidebar_position: 11
---

# remove-sentry

Remove Sentry error tracking from both the frontend and Strapi while keeping structured logging in place. Only the error-reporting backend goes — your logging keeps working.

## Use it when

- You don't use Sentry and want it and its configuration removed cleanly.

## What it helps solve

- Removes an unused Sentry account dependency.
- Simplifies error-tracking setup when the project uses another tool or none.
- Keeps regular application logging in place.

## What it removes

- UI: the `@sentry/nextjs` dependency and the telemetry provider in `apps/ui/src/lib/telemetry/providers/sentry.ts`. Also its shared `dataCollection` baseline (`sentry-data-collection.ts`), the browser init in `apps/ui/src/instrumentation-client.ts`, the `onRequestError` hook in `instrumentation.ts`, and the `withSentryConfig` wrapper (imported from `@sentry/nextjs/config`) in `next.config.mjs`. Error boundaries switch from `Sentry.captureException` to `console.error`.
- Strapi: `@strapi/plugin-sentry` and its plugin config.
- Docs and environment examples that mention Sentry.

Use [remove-azure-monitor](./remove-azure-monitor.md) separately if Azure telemetry should also go.
