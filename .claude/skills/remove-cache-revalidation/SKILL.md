---
name: remove-cache-revalidation
description: "Uninstalls the entire Next.js cache revalidation feature (Strapi document middleware, revalidate API, on-demand UI route, cache tagging, admin revalidate button) AND the optional CDN purge layer it carries. Triggers: remove cache revalidation, remove revalidation feature, uninstall revalidation, drop revalidate, disable on-demand revalidation, remove strapi-revalidate."
---

Remove the **entire cache revalidation feature** from the project, including the optional CDN purge layer that depends on it. After this, Strapi publishes will no longer invalidate the Next.js cache on demand — pages rely solely on their ISR `revalidate` TTL.

## Scope

- This removes EVERYTHING: the core revalidation pipeline AND the CDN purge integration (they share the `api::revalidate` controller/routes; revalidation authenticates with `STRAPI_REVALIDATE_SECRET` and CDN purge with `STRAPI_CDN_PURGE_SECRET`).
- If you only want to drop the CDN purge layer but keep on-demand revalidation, use the `remove-cdn-purge` skill instead.
- Do not remove pre-existing scaffolding that the feature only _edited_ — revert those edits to their pre-feature state (see Step 2).

## Steps

### 1. Delete feature-owned files

```bash
# Strapi
rm -rf apps/strapi/src/api/revalidate
rm -f  apps/strapi/src/documentMiddlewares/revalidate.ts
rm -rf apps/strapi/src/admin/extensions/DataRevalidate
rm -rf apps/strapi/src/admin/widgets/CdnCacheWidget
rm -f  apps/strapi/tests/revalidate.test.ts
rm -f  apps/strapi/tests/cdn-cache.test.ts
rm -f  apps/strapi/tests/hierarchy-revalidate.test.ts

# UI
rm -rf apps/ui/src/app/api/strapi-revalidate
rm -rf apps/ui/src/app/api/cdn-purge
rm -rf apps/ui/src/lib/cdn
rm -f  apps/ui/src/lib/cache-paths.ts
rm -f  apps/ui/src/lib/cache-paths.test.ts
rm -f  apps/ui/src/lib/verify-bearer-token.ts

# Docs
rm -f  apps/docs/docs/reference/cache-revalidation.md
rm -f  apps/docs/docs/reference/integrations/cdn.md
```

Note: `apps/strapi/src/utils/validate-admin-token.ts` is intentionally **not** deleted — the `hierarchy` controller also imports it to guard its endpoints, and that feature survives this removal. Removing it would break `apps/strapi/src/api/hierarchy/controllers/hierarchy.ts`.

### 2. Revert edits the feature made to shared files

**`apps/strapi/src/index.ts`** — remove the `import { registerAutoRevalidateMiddleware } from "./documentMiddlewares/revalidate"` line and the `registerAutoRevalidateMiddleware({ strapi })` call in `bootstrap`. Keep `registerPopulatePageMiddleware`.

**`apps/strapi/src/admin/app.tsx`** — remove:

- `import DataRevalidate from "./extensions/DataRevalidate"` and the `injectComponent("editView", "right-links", { name: "DataRevalidate", ... })` block.
- `import { Cloud } from "@strapi/icons"` and the `app.widgets.register({ ... id: "cdn-cache" ... })` block.
- Keep the pre-existing `injectComponent("editView", "right-links", { name: "Hierarchy", ... })` and all other bootstrap logic.

**`apps/strapi/src/api/hierarchy/services/hierarchy.ts`** — strip the revalidation from `applyPendingChanges`: remove the `fullPathsByLocale`/`redirectSources` aggregation, the two post-loop `this.revalidate(...)` call sites, and the `revalidate` method itself. Leave `listPublishedPages`, `getPendingChanges`, the per-change update/redirect-creation loop, and `stampLastRecalculation` untouched.

**`apps/ui/src/lib/strapi-api/content/server.ts`** — revert the cache tagging:

- `fetchNavbar` and `fetchFooter`: remove the added `requestInit` argument carrying `next: { revalidate: 600, tags: ["strapi:api::navbar.navbar" | "strapi:api::footer.footer"] }`, restoring the original calls (which passed no `requestInit`).
- `fetchPage`: remove the `next: { ...requestInit?.next, revalidate: requestInit?.next?.revalidate ?? 120 }` wrapper, restoring the original passthrough of `requestInit`.

**`apps/ui/src/env.mjs`** — remove from BOTH the `server` schema and `runtimeEnv`: `STRAPI_REVALIDATE_SECRET`, `STRAPI_CDN_PURGE_SECRET`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_FRONT_DOOR_PROFILE`, `AZURE_MI_CLIENT_ID`, `IDENTITY_ENDPOINT`, `IDENTITY_HEADER`.

**`apps/ui/.env.local.example`** — remove the cache-revalidation / CDN purge block (the `STRAPI_REVALIDATE_SECRET` and `STRAPI_CDN_PURGE_SECRET` lines and the `AZURE_*` comments).

**`apps/strapi/.env.example`** — remove the `STRAPI_REVALIDATE_SECRET` and `STRAPI_CDN_PURGE_SECRET` entries and their comments. Keep `CLIENT_URL` (it pre-existed the feature).

**`apps/strapi/package.json`** — remove the `"zod"` dependency ONLY if nothing else imports zod (verify with `grep -rn "from \"zod\"" apps/strapi/src` → if empty, remove it and run `pnpm install`). It was added solely for the revalidate controller.

**`apps/docs/docs/ui/caching.md`** — remove the `## On-Demand Revalidation` section that links to the revalidation reference.

**`apps/docs/docs/strapi/environment-variables.md`** — remove the one-line blockquote cross-link to `../reference/cache-revalidation.md`.

**`turbo.json`** (`globalEnv`) — remove the entries the feature added: `CLIENT_URL`, `STRAPI_REVALIDATE_SECRET`, `STRAPI_CDN_PURGE_SECRET`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_FRONT_DOOR_PROFILE`, `AZURE_MI_CLIENT_ID`, `IDENTITY_ENDPOINT`, `IDENTITY_HEADER`. (If `CLIENT_URL` was already declared before the feature, leave it.)

### 3. Verify

```bash
# No dangling references to any removed piece
grep -rn "revalidate\|strapi-revalidate\|cdn-purge\|purgeCdn\|CdnCacheWidget\|DataRevalidate\|@/lib/cdn\|cache-paths\|verify-bearer-token\|registerAutoRevalidate\|STRAPI_REVALIDATE_SECRET\|STRAPI_CDN_PURGE_SECRET\|AZURE_\|strapiTag" apps packages turbo.json | grep -v node_modules | grep -v "\.next"
# Expect: no matches related to the feature. (Strapi's built-in `revalidate` of core
# content-types via the Documents API is unrelated; if any match appears, confirm it
# is not one of the files/edits above before leaving it.)

pnpm -F @repo/strapi exec tsc --noEmit
pnpm -F @repo/ui exec tsc --noEmit
pnpm -F @repo/strapi test
pnpm -F @repo/ui test
pnpm lint
pnpm -F @repo/docs build
```

Typechecks, the UI test suite, lint, and docs build must pass. (The Strapi `app.test.ts` suite requires a running Postgres and is environmental — unrelated to this removal.)

### 4. Commit

```bash
git add -A
git commit -m "chore: remove cache revalidation feature"
```

## Notes

- Fast path: if the feature was added in a contiguous set of commits with nothing built on top since, `git revert` of those commits is simpler. The manual steps above are the robust path when the feature is intermixed with later work.
- The hierarchy revert is the most error-prone — after editing, confirm `applyPendingChanges` still updates `fullPath`s and creates redirects exactly as before; you are only removing the aggregation and the revalidation calls that consumed it.
