# Sentry

Errors that bubble through `<ErrorBoundary />` or `error.tsx` are forwarded to Sentry automatically.

| Var                                                 | Required for                   | Notes                              |
| --------------------------------------------------- | ------------------------------ | ---------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`                            | Enabling Sentry at runtime     | Without it the SDK is a no-op.     |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Source-map upload during build | Optional but recommended for prod. |

Relevant files:

- [`sentry.client.config.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/sentry.client.config.ts)
- [`sentry.server.config.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/sentry.server.config.ts)
- [`sentry.edge.config.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/sentry.edge.config.ts)
- [`src/instrumentation.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/instrumentation.ts)
- [`next.config.mjs`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/next.config.mjs)
