---
sidebar_position: 8
---

# Sentry

`@strapi/plugin-sentry` adds Strapi-side error tracking.

Set `SENTRY_DSN` to enable it. The plugin runs in production only by default; change [`config/plugins.ts:23`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/plugins.ts#L23) if you want it active in development.

## Usage

Uncaught errors are reported automatically. You can also send custom errors or messages from controllers and services:

```ts
async find(ctx) {
  const sentry = strapi.plugin("sentry").service("sentry")

  sentry.sendError(new Error("My custom error"))

  const instance = sentry.getInstance()
  instance?.captureMessage("My custom message")
}
```

`instance` is `undefined` when Sentry is disabled, so always optional-chain calls on it.

Strapi-side Sentry docs: [docs.strapi.io/dev-docs/plugins/sentry](https://docs.strapi.io/dev-docs/plugins/sentry).
