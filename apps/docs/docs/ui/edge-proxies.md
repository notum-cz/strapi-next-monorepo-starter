# Edge Proxies

Next.js middleware lives in:

```txt
apps/ui/src/proxy.ts
```

It composes small proxy functions from `src/lib/proxies`. Each function handles one concern and can either return a `NextResponse` to stop the chain or return `undefined` to let the next proxy run.

| Proxy           | File                                                                                                                                | Purpose                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Basic Auth      | [`basicAuth.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/proxies/basicAuth.ts)           | `BASIC_AUTH_ENABLED=true`; HTTP Basic Auth for staging gates.                    |
| HTTPS Redirect  | [`httpsRedirect.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/proxies/httpsRedirect.ts)   | Production-only HTTP to HTTPS redirects.                                         |
| Auth Guard      | [`authGuard.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/proxies/authGuard.ts)           | Protects pages listed in `authPages`; anonymous users are redirected to sign-in. |
| Dynamic Rewrite | [`dynamicRewrite.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/proxies/dynamicRewrite.ts) | Rewrites requests with search params to the `/dynamic/` route for SSR.           |

To add a new proxy, create it in `src/lib/proxies` and register it in `proxy.ts`.
