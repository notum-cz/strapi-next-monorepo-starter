# Sentry

Sentry is an error monitoring service used to capture runtime exceptions, handled errors, and release diagnostics.

The monorepo has two Sentry integrations:

- Next.js UI error tracking in `apps/ui`
- Strapi CMS error tracking through `@strapi/plugin-sentry` in `apps/strapi`

## Next.js UI

Errors that bubble through `<ErrorBoundary />` or `error.tsx` are forwarded to Sentry automatically. The exported Next config is also wrapped with `withSentryConfig()` for source-map upload and build-time integration.

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

- `apps/ui/sentry.client.config.ts`
- `apps/ui/sentry.server.config.ts`
- `apps/ui/sentry.edge.config.ts`
- `apps/ui/src/instrumentation.ts`
- `apps/ui/next.config.mjs`

## Strapi

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
