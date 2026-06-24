---
sidebar_position: 4
---

# Next Configuration

The UI Next.js config lives in:

```txt
apps/ui/next.config.mjs
```

It is the central place for framework-level behavior such as output mode, React Compiler, image optimization, package transpilation, Sentry wrapping, and Next Intl setup.

:::warning Build-time config
`next.config.mjs` is evaluated during build. Changes such as redirects, rewrites, or other Next config values cannot be changed after build through runtime environment variables.
:::

## React Compiler

React Compiler is enabled through `reactCompiler: true`. Most component memoization is handled by the compiler, so add manual memoization only when there is a measured reason.

## Sentry

The exported Next config is wrapped with `withSentryConfig()` for source-map upload and Sentry build-time integration. See [Observability → Sentry](../reference/integrations/logging.md#sentry).

## Image Configuration

Image settings are configured in the `images` section. The starter keeps global `images.unoptimized` unset so each image component can choose its own optimization path.

See [Image Optimization](./images.md) for the full pipeline and component rules.

## Output Mode

`output` is read from `NEXT_OUTPUT`. Keep it undefined for local development, use `standalone` for Docker builds, and use `export` only for static builds.

| Mode         | Use                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `standalone` | Self-hosting in Docker. Default for this starter.                                                                                            |
| `undefined`  | Default `.next` build. Use for `next start` or hosting providers such as Vercel.                                                             |
| `export`     | Static HTML/CSS/JS. Not supported out-of-box because Better Auth, the POST auth API route, and other dynamic features must be removed first. |

`pnpm build:ui:static` triggers `output: "export"` but fails unless dynamic features are removed.

See [Environment Variables](./environment-variables.md), [Docker Build](./docker-build.md), and [Caching](./caching.md) for the deployment tradeoffs.

## Related Documentation

- [Caching](./caching.md)
- [Image Optimization](./images.md)
- [Observability](../reference/integrations/logging.md)
