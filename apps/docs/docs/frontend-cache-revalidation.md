# Frontend Cache Revalidation

This page explains how content updates in Strapi become visible on the Next.js frontend without rebuilding the whole app.

## Why This Exists

The frontend uses caching for performance. Without explicit revalidation, users might keep seeing old content for some time after editors publish changes.

Revalidation solves this by telling Next.js exactly what to invalidate when content changes.

## Mental Model

Think of it as a targeted cache refresh:

1. Content changes in Strapi.
2. Strapi chooses the right trigger path (manual action, document middleware, or internal job batch).
3. Strapi sends a secure revalidation request to Next.js.
4. Next.js marks selected cache entries as stale.
5. The next visitor request regenerates fresh content.

Important: this is not a full rebuild of the site. It is selective and on-demand.

## What Can Be Revalidated

- `fullPaths`:
  Used for page-level refresh (for example `/en/about`).
- `tags`:
  Used for shared data blocks reused across pages (for example navbar/footer).

In practice:

- page content is usually refreshed by path
- global shared content can be refreshed by tag

## Where Revalidation Is Triggered

- From Strapi admin edit view via the **Data Revalidate** action.
- Automatically in Strapi **Document Service middleware** for configured collections.
- Automatically after hierarchy jobs recalculate page paths.

This means editors can trigger revalidation manually, while publish/update and structural URL changes are handled automatically.

## Automatic Revalidation via Document Middleware

Strapi registers a Document Service middleware that auto-triggers revalidation for selected collections.

Current strategy:

- **Path revalidation** (`fullPaths`) for page-like collections (for example `api::page.page`).
- **Tag revalidation** (`tags`) for shared/global collections (for example navbar/footer).

Each collection has a revalidation mode:

- `path-revalidate`: invalidate by page path (for page-like collections).
- `tag-revalidate`: invalidate by cache tag (for shared/global content or configuration single types).

The revalidation policy is derived automatically from the content type's `draftAndPublish` schema option:

- `draftAndPublish: true` → `publish-only`: revalidate on publish, unpublish, or delete (drafts are ignored).
- `draftAndPublish: false` → `all-writes`: revalidate on every save (content is immediately public).

An explicit `policy` override can still be set per entry if needed.

## Internal Jobs Integration (Hierarchy Changes)

When page hierarchy changes (slug/parent updates), Strapi recalculates full paths for affected pages and descendants.

After that job batch finishes:

- touched old and new paths are collected
- a revalidation request is sent for all affected paths

Result: old URLs are not left with stale cached content, and new URLs serve updated content.

## Middleware + Internal Jobs (No Duplicate Revalidation)

Hierarchy recalculation updates documents programmatically and uses `updatedBy: null`.

The document middleware checks this marker and skips middleware-level revalidation for those updates.  
Internal jobs then perform one consolidated revalidation call for all touched paths.

This avoids revalidation races and duplicate invalidation calls while preserving full hierarchy correctness.

## Locale Behavior

Strapi sends locale-specific paths. The Next.js revalidation endpoint also handles default-locale hidden URL variants (`localePrefix: "as-needed"`), so both prefixed and non-prefixed variants are invalidated when needed.

## Security

Revalidation endpoint access is protected by a shared secret:

- `STRAPI_REVALIDATE_SECRET`

Strapi includes it in the request; Next.js validates it before executing revalidation.

If the secret is missing or mismatched, revalidation is rejected.

## Required Configuration

Set:

- `STRAPI_REVALIDATE_SECRET` in both Strapi and UI
- `CLIENT_URL` in Strapi (frontend base URL)

Typical files:

- [`apps/strapi/.env`](../apps/strapi/.env)
- [`apps/ui/.env.local`](../apps/ui/.env.local)

## Example Payload

```json
{
  "uid": "api::page.page",
  "secret": "STRAPI_REVALIDATE_SECRET",
  "fullPaths": ["/en/about"],
  "tags": ["strapi:api::page.page"]
}
```

At least one of `fullPaths` or `tags` must be provided.

## Testing Revalidation

### Why `next dev` is not enough

Next.js skips the data cache entirely in dev mode — every request re-renders from scratch. `revalidatePath` and `revalidateTag` have nothing to invalidate, so the full revalidation cycle cannot be observed.

### What you can verify in dev mode

- **Endpoint logic:** The `/api/strapi-revalidate` route still runs — you can test validation, secret checks, and response shape by sending a request directly:

  ```bash
  curl -X POST http://localhost:3000/api/strapi-revalidate \
    -H "Content-Type: application/json" \
    -d '{
      "uid": "api::page.page",
      "secret": "<STRAPI_REVALIDATE_SECRET>",
      "fullPaths": ["/en/about-us"]
    }'
  ```

  Look for the `[revalidate] Completed` log in the Next.js terminal.

- **Strapi middleware fires:** Publish a page in Strapi admin and check Strapi logs to confirm the middleware sends the correct `fullPaths`/`tags` payload.

### Full cache revalidation test (production-like build)

To test the complete "stale → revalidate → fresh" cycle, run a production build of the UI app:

```bash
pnpm run build:ui && pnpm run start:ui
```

Then:

1. Visit a page (e.g. `http://localhost:3000/about-us`) — it gets cached.
2. Change content in Strapi and publish.
3. Either curl the endpoint above, or click the **Data Revalidate** button in Strapi admin.
4. Refresh the page — you should see updated content.

If Strapi is running locally, the automatic document middleware should trigger revalidation on publish without any manual curl.

## Developer References

- [`apps/ui/src/app/api/strapi-revalidate/route.ts`](../apps/ui/src/app/api/strapi-revalidate/route.ts) — Next.js revalidation endpoint
- [`apps/strapi/src/api/revalidate/services/revalidate.ts`](../apps/strapi/src/api/revalidate/services/revalidate.ts) — Strapi revalidation service
- [`apps/strapi/src/api/internal-job/services/internal-job.ts`](../apps/strapi/src/api/internal-job/services/internal-job.ts) — Job queue for hierarchy recalculation
- [`apps/strapi/src/documentMiddlewares/revalidate.ts`](../apps/strapi/src/documentMiddlewares/revalidate.ts) — Automatic revalidation middleware
- [`apps/strapi/src/utils/hierarchy/index.ts`](../apps/strapi/src/utils/hierarchy/index.ts) — Hierarchy recalculation and touched paths logic
- [`apps/strapi/src/admin/extensions/DataRevalidate/DataRevalidateButton.tsx`](../apps/strapi/src/admin/extensions/DataRevalidate/DataRevalidateButton.tsx) — Manual revalidation UI button
