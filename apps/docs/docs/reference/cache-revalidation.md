---
sidebar_position: 8
---

# Cache Revalidation

How Strapi content updates become visible on the Next.js frontend without a rebuild, and how operators force a CDN purge when needed.

## How it works

Each public route has an ISR `revalidate` window combined with `stale-while-revalidate`, so visitors always get a cached page immediately while it regenerates in the background.

On publish/update/delete, a Strapi **Document Service middleware** (`apps/strapi/src/documentMiddlewares/revalidate.ts`) calls the `api::revalidate.revalidate` service, which POSTs to the UI route `apps/ui/src/app/api/strapi-revalidate/route.ts`. That route runs `revalidatePath` (page/redirect paths) and `revalidateTag(tag, "max")` (shared content like navbar/footer), marking the matching cache entries stale so the next request re-renders with fresh Strapi data.

## What gets revalidated

| Content type             | Mode                              | Trigger                  |
| ------------------------ | --------------------------------- | ------------------------ |
| `api::page.page`         | path (`fullPath`)                 | publish/unpublish/delete |
| `api::redirect.redirect` | path (`source`)                   | publish/unpublish/delete |
| `api::navbar.navbar`     | tag (`strapi:api::navbar.navbar`) | update/publish           |
| `api::footer.footer`     | tag (`strapi:api::footer.footer`) | update/publish           |

Add your own content types in `REVALIDATE_COLLECTIONS` in the document middleware, and tag the corresponding fetch in `apps/ui/src/lib/strapi-api/content/server.ts`.

## Revalidate windows

| Fetch                        | Interval | Notes                                                            |
| ---------------------------- | -------- | ---------------------------------------------------------------- |
| `fetchPage`                  | 120s     | Aligned with the public page route. Path-revalidated on publish. |
| `fetchNavbar`, `fetchFooter` | 600s     | Tag-revalidated on publish; TTL is the backstop.                 |

## Bulk hierarchy changes

Moving a page recalculates child `fullPath`s through the `internal-job` queue, which writes with `updatedBy: null`. The document middleware skips those writes to avoid duplicate calls, so the **job runner** (`runAll` in `apps/strapi/src/api/internal-job/services/internal-job.ts`) revalidates the aggregated touched paths once per batch instead.

## Manual revalidation

Editors can force-revalidate a single entry from the **Revalidate cache** button in the page/navbar/footer edit view (visible with `?showRevalidateCache=true`).

## CDN purge (optional)

Revalidation marks Next.js cache stale; it does not purge an upstream CDN. For incident-time CDN eviction, see [CDN purge](./integrations/cdn-purge.md).

## Configuration

Set `STRAPI_REVALIDATE_SECRET` (identical in `apps/strapi` and `apps/ui`) and `CLIENT_URL` (Strapi → UI base URL). See [Strapi environment variables](../strapi/environment-variables.md) and [UI environment variables](../ui/environment-variables.md).
