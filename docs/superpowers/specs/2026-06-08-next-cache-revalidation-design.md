# Next.js Cache Revalidation + Optional CDN Purge — Design

**Date:** 2026-06-08
**Branch:** `feat/STAR-287-next-cache-revalidation`
**Status:** Approved (design)

## Goal

Port the Next.js cache-revalidation feature (and an optional, plug-and-play CDN
purge feature) from `yale/website-and-portal` into this starter
(`strapi-next-monorepo-starter`). Both repos are the same Strapi + Next.js
monorepo (the source is a fork of this starter), run **Next.js 16.2.6**, and
share the same app layout (`apps/strapi`, `apps/ui`, `apps/docs`), so the port
is structurally clean.

Scope decisions (from brainstorming):

- **Include:** Strapi-driven revalidation (document middleware → Strapi
  `revalidate` API → UI `/api/strapi-revalidate` → `revalidateTag`/
  `revalidatePath`), cache tagging, admin revalidate button + CDN cache widget,
  unit tests, and docs.
- **Exclude:** Greenhouse jobs revalidation and all Yale-specific content types
  (`greenhouse`, `prospect-page`, `application-*`, `team-member`, `committee`,
  `cookie-banner`, `not-found-page`).
- **CDN purge:** keep the Azure Front Door implementation, but make it an
  **optional plug-and-play provider** (mirroring the Microsoft Entra SSO
  pattern). Generic, provider-agnostic naming ("CDN cache").

## Architecture

The core revalidation pipeline is CDN-agnostic and ports verbatim. The only
Azure-specific code lives in one UI file (`front-door.ts`), which becomes one
provider behind a small registry.

```
Strapi publish/update/delete
  └─ documentMiddlewares/revalidate.ts        (detects change, resolves paths/tags)
       └─ api::revalidate service .run()
            └─ services/next-cache.ts          (POST → UI /api/strapi-revalidate)
                 └─ UI /api/strapi-revalidate   (revalidatePath / revalidateTag "max")

Operator (admin homepage CDN cache widget) OR internal job
  └─ POST /api/revalidate/cdn-purge (Strapi controller)
       └─ services/cdn-cache.ts                (POST → UI /api/cdn-purge)
            └─ UI /api/cdn-purge                (resolveCdnProvider() → provider.purge())
                 └─ lib/cdn/providers/azure-front-door.ts  (example provider; null when unconfigured)
```

### CDN provider abstraction (Approach A — provider registry)

New `apps/ui/src/lib/cdn/`:

- `types.ts` — `CdnPurgeOutcome = { ok: boolean; reason?: string }` and
  `CdnPurgeProvider = { purge(paths: string[]): Promise<CdnPurgeOutcome> }`.
- `providers/azure-front-door.ts` — the ported `front-door.ts`, exposed as a
  factory `azureFrontDoorProvider(): CdnPurgeProvider | null` that returns
  `null` when its `AZURE_*` env vars are unset (same shape as
  `microsoftSSOProvider` in `apps/strapi/config/auth-providers.ts`).
- `index.ts` — `resolveCdnProvider(): CdnPurgeProvider | null` selects the
  configured provider (env-gated) or returns `null`.

`/api/cdn-purge/route.ts` resolves the provider; when none is configured the
route is an inert no-op (`{ purged: false, skipped: true }`, HTTP 200). The
feature ships enabled but dormant until env is set. Adding a CDN = drop a new
file in `providers/` returning a `CdnPurgeOutcome`.

## Changes by app

### Strapi (`apps/strapi/src`)

- **Copy** `api/revalidate/*`:
  - `controllers/revalidate.ts` (`run`, `purgeCdn`; admin-token validated)
  - `routes/revalidate.ts` (`POST /api/revalidate`, `POST /api/revalidate/cdn-purge`)
  - `services/revalidate.ts`, `services/next-cache.ts`, `services/helpers.ts`,
    `services/cdn-cache.ts`
- **Copy** `documentMiddlewares/revalidate.ts`; register in `index.ts`
  bootstrap next to `registerPopulatePageMiddleware`.
- **Trim `REVALIDATE_COLLECTIONS`** to this starter's real types:
  - `api::page.page` → path-revalidate (`fullPath`)
  - `api::redirect.redirect` → path-revalidate (`source`)
  - `api::navbar.navbar` → tag-revalidate (`strapi:api::navbar.navbar`)
  - `api::footer.footer` → tag-revalidate (`strapi:api::footer.footer`)
- **Admin UI**:
  - Port `admin/extensions/DataRevalidate/*` (button for page/navbar/footer,
    gated behind `?showRevalidateCache=true`).
  - Port the widget, **renamed `FrontDoorCacheWidget` → `CdnCacheWidget`** with
    user-facing "CDN cache" wording (Front Door documented as the example).
  - Register both in `admin/app.tsx` (widget via `app.widgets.register`,
    button via `injectComponent("editView", "right-links", …)`).
- **internal-job**: graft the revalidation calls into the existing
  `api/internal-job/services/internal-job.ts` handlers — `RECALCULATE_FULLPATH`
  (revalidate touched page paths) and `CREATE_REDIRECT` (revalidate redirect
  sources). The document middleware already skips internal writes
  (`updatedBy: null`) to avoid double revalidation.
- **Env** (`.env.example`): add `STRAPI_REVALIDATE_SECRET`; reuse existing
  `CLIENT_URL`.

### UI (`apps/ui/src`)

- **Copy** `app/api/strapi-revalidate/route.ts` (secret-validated;
  `addDefaultLocalePathVariants` → `revalidatePath` + `revalidateTag(tag,"max")`).
- **Copy** `app/api/cdn-purge/route.ts`, rewired to `resolveCdnProvider()`.
- **Copy** `lib/cache-paths.ts` (`addDefaultLocalePathVariants`).
- **Build** `lib/cdn/` registry (`types.ts`, `index.ts`,
  `providers/azure-front-door.ts` from the ported `front-door.ts`).
- **Tagging** in `lib/strapi-api/content/server.ts`:
  - `fetchNavbar` / `fetchFooter` → `next: { revalidate: 600, tags: ["strapi:api::navbar.navbar" | "strapi:api::footer.footer"] }`
  - `fetchPage` → path-based revalidation, `revalidate: 120`
  - `base.ts` default behavior unchanged (dev `0`, prod `60`, overridable).
- **Env**: add `STRAPI_REVALIDATE_SECRET` (required for the feature) and the
  optional `AZURE_*` / CDN provider vars to `env.mjs` (optional-first) and
  `.env.local.example`.

### Tests

Port and adapt to the trimmed content types:

- Strapi: `tests/revalidate.test.ts`, `tests/cdn-cache.test.ts`.
- UI: `app/api/strapi-revalidate/route.test.ts`,
  `app/api/cdn-purge/route.test.ts`, `lib/cache-paths.test.ts`.
- **Drop**: `tests/hierarchy.test.ts` and any Greenhouse-specific tests
  (out of scope). The `cdn-purge` test targets the provider registry (no-op
  when unconfigured; provider invoked when configured).

### Docs (`apps/docs`)

- **New** `docs/reference/cache-revalidation.md` — canonical doc for the full
  Strapi→UI pipeline (adapted from the source `frontend-cache-revalidation.md`,
  de-Yale'd; intervals/tables updated for this starter's routes and types).
- **New** `docs/reference/integrations/cdn-purge.md` — the optional CDN purge
  feature, with an `:::info` optional-scope box and Azure Front Door as the
  worked example (mirrors `auth/strapi-admin/microsoft-sso.md` structure:
  Requirements, env vars, How it works, plug-and-play provider notes).
- **Revise** `docs/ui/caching.md` — add on-demand revalidation + cache tags;
  cross-link to `reference/cache-revalidation.md`.
- **Cross-links** from the Strapi section (a pointer in an appropriate strapi
  doc) and the UI section to the new reference page.

## Environment variables

| Variable                                | App    | Required             | Purpose                                             |
| --------------------------------------- | ------ | -------------------- | --------------------------------------------------- |
| `STRAPI_REVALIDATE_SECRET`              | both   | Yes (feature)        | Shared secret authenticating revalidate/purge calls |
| `CLIENT_URL`                            | strapi | Yes (existing)       | Base URL of the Next.js frontend                    |
| `AZURE_SUBSCRIPTION_ID`                 | ui     | Optional (CDN)       | Azure Front Door example provider                   |
| `AZURE_RESOURCE_GROUP`                  | ui     | Optional (CDN)       | "                                                   |
| `AZURE_FRONT_DOOR_PROFILE`              | ui     | Optional (CDN)       | "                                                   |
| `AZURE_MI_CLIENT_ID`                    | ui     | Optional (CDN)       | Managed-identity client id                          |
| `IDENTITY_ENDPOINT` / `IDENTITY_HEADER` | ui     | Auto (Azure runtime) | IMDS token endpoint                                 |

When the CDN env vars are unset, `resolveCdnProvider()` returns `null` and the
purge route/widget are inert — exactly like an unconfigured Entra SSO provider.

## Out of scope / non-goals

- Greenhouse jobs revalidation and Yale-specific content types.
- Yale Azure infra docs/specs (`azure-front-door`, `azure-setup-validation`).
- Adding non-Azure CDN providers (the registry makes this a later drop-in).

## Verification

- `revalidateTag(tag, "max")` and `revalidatePath` exist on Next.js 16.2.6
  (confirmed: both repos pin `16.2.6`).
- Unit tests pass for ported Strapi + UI tests.
- Manual: publish a `page`/`navbar`/`footer` in Strapi → observe a revalidation
  log in the UI → confirm fresh content. With Azure vars unset, the CDN widget
  reports the inert/no-op outcome rather than erroring.
