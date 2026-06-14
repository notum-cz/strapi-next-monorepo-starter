---
name: remove-cdn-purge
description: "Uninstalls the optional CDN purge integration (Azure Front Door example provider, CDN cache widget, /api/cdn-purge route) while keeping the core cache revalidation feature intact. Triggers: remove CDN purge, remove Front Door, uninstall CDN, drop cdn-purge, remove Azure Front Door integration, disable CDN cache widget."
---

Remove the **optional CDN purge integration** from the project. This is the operator-driven CDN cache eviction layer (the bundled Azure Front Door example provider, the Strapi "CDN cache" homepage widget, and the `/api/cdn-purge` route). It sits on top of the core cache revalidation feature.

## Scope

- This removes ONLY the CDN purge layer. The core cache revalidation (Strapi → Next.js `revalidatePath`/`revalidateTag` on publish) keeps working.
- To remove the entire revalidation feature instead, use the `remove-cache-revalidation` skill (which also removes this CDN layer).
- `STRAPI_REVALIDATE_SECRET`, `CLIENT_URL`, `apps/ui/src/lib/cache-paths.ts`, `apps/ui/src/lib/verify-bearer-token.ts` (shared with the revalidate endpoint), and the `apps/strapi/src/api/revalidate` service/controller/routes belong to core revalidation — do NOT remove them here.

## Steps

### 1. Delete CDN-only files

```bash
rm -rf apps/ui/src/lib/cdn
rm -rf apps/ui/src/app/api/cdn-purge
rm -f  apps/strapi/src/api/revalidate/services/cdn-cache.ts
rm -rf apps/strapi/src/admin/widgets/CdnCacheWidget
rm -f  apps/strapi/tests/cdn-cache.test.ts
rm -f  apps/docs/docs/reference/integrations/cdn.md
```

### 2. Strip the CDN purge action from the Strapi revalidate controller

Edit `apps/strapi/src/api/revalidate/controllers/revalidate.ts`:

- Remove the import `import { purgeCDNCache } from "../services/cdn-cache"`.
- Remove the entire `purgeCdn(ctx)` method (the second handler in the default export object).
- Remove the `purgeCdnBodySchema` const at the bottom of the file (only used by `purgeCdn`).
- Keep the `run(ctx)` method, `revalidateBodySchema`, `nonEmptyStringArray`, and the `validateAdminToken` import.

### 3. Remove the CDN purge route

Edit `apps/strapi/src/api/revalidate/routes/revalidate.ts`: delete the route object whose `path` is `"/revalidate/cdn-purge"` (handler `revalidate.purgeCdn`). Keep the `"/revalidate"` route.

Then edit `apps/strapi/src/api/revalidate/services/helpers.ts`: remove the now-orphaned `readCdnPurgeConfig` export (only `cdn-cache.ts` used it). Keep `readClientCallConfig` and `readRevalidationConfig`; if `STRAPI_CDN_PURGE_SECRET` is no longer referenced, drop it from the `SecretEnvVar` union too.

### 4. Unregister the CDN cache widget

Edit `apps/strapi/src/admin/app.tsx`:

- Remove the `app.widgets.register({ ... id: "cdn-cache" ... })` block in `bootstrap`.
- Remove the `import { Cloud } from "@strapi/icons"` line (only used by that widget).
- Keep the `DataRevalidate` edit-view injection (that belongs to core revalidation).

### 5. Remove the optional CDN env vars

- `apps/ui/src/env.mjs`: remove these keys from BOTH the `server` schema and the `runtimeEnv` map: `STRAPI_CDN_PURGE_SECRET`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_FRONT_DOOR_PROFILE`, `AZURE_MI_CLIENT_ID`, `IDENTITY_ENDPOINT`, `IDENTITY_HEADER`. Keep `STRAPI_REVALIDATE_SECRET` (core revalidation).
- `apps/ui/.env.local.example`: remove the `STRAPI_CDN_PURGE_SECRET` line and the "Azure Front Door CDN purge provider" comment block with its commented `AZURE_*` lines. Keep `STRAPI_REVALIDATE_SECRET`.
- `apps/strapi/.env.example`: remove the `STRAPI_CDN_PURGE_SECRET` entry and its comment. Keep `STRAPI_REVALIDATE_SECRET` and `CLIENT_URL`.
- `turbo.json` (`globalEnv`): remove `STRAPI_CDN_PURGE_SECRET`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_FRONT_DOOR_PROFILE`, `AZURE_MI_CLIENT_ID`, `IDENTITY_ENDPOINT`, `IDENTITY_HEADER`. Keep `CLIENT_URL` and `STRAPI_REVALIDATE_SECRET`.

### 6. Remove the CDN reference from the revalidation doc

Edit `apps/docs/docs/reference/cache-revalidation.md`: remove the `## CDN purge (optional)` section (the paragraph and the link to `./integrations/cdn.md`). Leave the rest of the page.

### 7. Verify

```bash
# No dangling references to the removed CDN pieces
grep -rn "cdn-purge\|purgeCdn\|purgeCDNCache\|CdnCacheWidget\|@/lib/cdn\|cdn-cache\|AZURE_\|IDENTITY_ENDPOINT\|IDENTITY_HEADER\|front-door\|FrontDoor" apps packages turbo.json | grep -v node_modules | grep -v "\.next"
# Expect: no matches (an empty result).

pnpm -F @repo/strapi exec tsc --noEmit
pnpm -F @repo/ui exec tsc --noEmit
pnpm -F @repo/strapi exec vitest run tests/revalidate.test.ts tests/hierarchy-revalidate.test.ts
pnpm -F @repo/ui exec vitest run src/app/api/strapi-revalidate/route.test.ts src/lib/cache-paths.test.ts
pnpm -F @repo/docs build
```

All typechecks/tests/build must pass. The core revalidation tests (`revalidate.test.ts`, `hierarchy-revalidate.test.ts`, `strapi-revalidate/route.test.ts`, `cache-paths.test.ts`) must still be green — confirming core revalidation survived.

### 8. Commit

```bash
git add -A
git commit -m "chore: remove optional CDN purge integration"
```

## Notes

- The fast path, if the CDN purge code was added in isolated commits and nothing since depends on it, is `git revert` of those commits. The steps above are the robust manual path for when the feature is intermixed with later work.
- `apps/ui/src/lib/cache-paths.ts` is intentionally kept — it is still used by the core `/api/strapi-revalidate` route.
