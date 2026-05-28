# Rendering Modes

Rendering mode decisions affect both hosting and page freshness. This starter mostly relies on Next.js standalone output plus ISR for public content pages.

Official docs:

- [Next.js `output` config](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Next.js ISR guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration)

## Output Modes

Next.js output mode controls what the build produces and how the UI can be hosted. The starter defaults to `standalone` for Docker self-hosting.

| Mode         | Use                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `standalone` | Self-hosting in Docker. Default for this starter.                                                                                            |
| `undefined`  | Default `.next` build. Use for `next start` or hosting providers such as Vercel.                                                             |
| `export`     | Static HTML/CSS/JS. Not supported out-of-box because Better Auth, the POST auth API route, and other dynamic features must be removed first. |

`pnpm build:ui:static` triggers `output: "export"` but fails unless dynamic features are removed.

To validate static builds in CI, enable the relevant step in [`ci.yml`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/.github/workflows/ci.yml).

## ISR

ISR (Incremental Static Regeneration) lets the UI serve cached pages and refresh them in the background.

In this starter, time-based revalidation is enabled globally:

- production default: `60s`
- development default: `0`

Individual requests can override this through `BaseStrapiClient` fetch options. See [UI Caching](./caching.md).

For dynamic routes where slugs are not known at build time:

```ts
export const dynamic = "force-static"
export const dynamicParams = true
export const revalidate = 300
```

Unknown slugs are generated once on first request, cached, then revalidated every 300 seconds.

Request-time APIs such as `cookies()`, `headers()`, and `auth` are not allowed in this mode because they force fully dynamic rendering. Do not use this setup for user-specific pages.
