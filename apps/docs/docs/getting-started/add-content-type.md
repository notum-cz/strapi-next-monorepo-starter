---
sidebar_position: 3
---

# Add a Content Type

End-to-end recipe for introducing a new Strapi collection (or single type) and exposing it through the Next.js frontend. Uses `product` as a worked example. All steps map to actual file locations in the template.

For a new **dynamic-zone component** (something that goes inside `page.content`), see [Page Builder](../content-system/page-builder.md). This page covers a separate collection.

## Prerequisites

- Strapi running locally — `pnpm dev:strapi` from the monorepo root.
- A clean working tree — schema changes generate types and seed exports that should be committed together.

All commands below run from the **monorepo root** via Turbo. Don't `cd` into individual apps.

## Step 1 — Define the schema

Two options. Either use the Strapi admin Content-Type Builder (writes the JSON for you) **or** create the file by hand.

Create [`apps/strapi/src/api/product/content-types/product/schema.json`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/strapi/src/api/page/content-types/page) (mirror the directory layout from the `page` collection):

```json
{
  "kind": "collectionType",
  "collectionName": "products",
  "info": {
    "singularName": "product",
    "pluralName": "products",
    "displayName": "Product"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": { "localized": true }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": { "i18n": { "localized": true } }
    },
    "slug": {
      "type": "string",
      "required": true,
      "regex": "^[a-z0-9-]+$",
      "pluginOptions": { "i18n": { "localized": true } }
    },
    "price": {
      "type": "decimal"
    },
    "image": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    }
  }
}
```

Attribute shape reference: [Strapi Schemas](../content-system/strapi-schemas.md). Localized fields need `pluginOptions.i18n.localized: true`; un-localized fields share one value across locales (e.g. `price` above).

## Step 2 — Wire routes, controller, service

Strapi's factory helpers cover the common case. Create three files mirroring [`apps/strapi/src/api/subscriber/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/strapi/src/api/subscriber):

**`apps/strapi/src/api/product/routes/product.ts`**

```ts
import { factories } from "@strapi/strapi"

export default factories.createCoreRouter("api::product.product")
```

**`apps/strapi/src/api/product/controllers/product.ts`**

```ts
import { factories } from "@strapi/strapi"

export default factories.createCoreController("api::product.product")
```

**`apps/strapi/src/api/product/services/product.ts`**

```ts
import { factories } from "@strapi/strapi"

export default factories.createCoreService("api::product.product")
```

That's enough to expose the standard CRUD routes (`GET /api/products`, `GET /api/products/:id`, `POST /api/products`, etc.). If you need custom logic, override individual controller methods — see [`apps/strapi/src/api/page/controllers/page.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/src/api/page/controllers/page.ts) for an example that adds `breadcrumbs` to the response.

Alternatively, scaffold via Strapi CLI: `pnpm -F @repo/strapi strapi generate` from root and pick `api`.

Restart Strapi (`pnpm dev:strapi` re-watches by default) so it picks up the new content type.

## Step 3 — Grant access (only if you need writes or per-user reads)

The frontend authenticates to Strapi with the **Read-only API token** from [Quick Start → Step 2](./quick-start.md#2-create-a-strapi-api-token). Strapi's Read-only token type covers `find`/`findOne` on every content type automatically — including ones you add later — so for read-only frontend usage, **no admin permission changes are needed**.

You only need to touch permissions when:

| Case                                                               | What to do                                                                                                                                                                                                 |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend writes (POST/PUT/DELETE) via `STRAPI_REST_CUSTOM_API_KEY` | Settings → API Tokens → open your Custom token → enable the desired actions on `Product` → Save.                                                                                                           |
| Per-user reads/writes via `PrivateStrapiClient` (user JWT)         | Settings → Users & Permissions plugin → Roles → `Authenticated` → tick the actions on `Product` → Save.                                                                                                    |
| Truly anonymous access (no token at all)                           | Settings → Users & Permissions plugin → Roles → `Public` → tick the actions on `Product` → Save. **Not used by this template's frontend** — kept here only for external consumers hitting Strapi directly. |

Permissions live in the database, not in code. They travel via the seed export — see [Data Seeding](../strapi/data-seeding.md).

## Step 4 — Add the UID to `API_ENDPOINTS`

The Next.js `BaseStrapiClient` maps content-type UIDs to URL paths. New types must be added to [`apps/ui/src/lib/strapi-api/base.ts:17`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/strapi-api/base.ts#L17):

```ts
export const API_ENDPOINTS: Partial<Record<UID.ContentType, string>> = {
  "api::page.page": "/pages",
  "api::footer.footer": "/footer",
  "api::navbar.navbar": "/navbar",
  "api::subscriber.subscriber": "/subscribers",
  "api::product.product": "/products", // ← add this
} as const
```

Without this entry, `PublicStrapiClient.fetchMany("api::product.product", ...)` throws `Endpoint for UID "api::product.product" not found.` at runtime.

## Step 5 — Expose the endpoint to the browser (optional)

Only required if the frontend will call this content type **from the client**, not from Server Components. The proxy routes have an allow-list at [`apps/ui/src/lib/strapi-api/request-auth.ts:3`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/strapi-api/request-auth.ts#L3):

```ts
const ALLOWED_STRAPI_ENDPOINTS: Record<string, string[]> = {
  GET: [
    "api/pages",
    "api/footer",
    "api/navbar",
    "api/users/me",
    "api/auth/local",
    "api/products", // ← add this for client-side GETs
  ],
  POST: [
    // ...
  ],
}
```

Server Components do not use the proxy, so this is unnecessary for SSR-only consumption. Skip it if you don't fetch from the browser.

## Step 6 — Regenerate types

```bash
pnpm generate:types
pnpm sync-types
```

`generate:types` regenerates [`apps/strapi/types/generated/contentTypes.d.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/types/generated/). `sync-types` mirrors it into `packages/strapi-types/generated/`.

After this, `"api::product.product"` is in `UID.ContentType` and `Data.ContentType<"api::product.product">` resolves. See [Strapi Types Usage](../content-system/strapi-types-usage.md).

## Step 7 — (Optional) Add a document middleware

Only if `Product` has its own dynamic zones or deep relations that should be auto-populated via `populateDynamicZone`. The `page` collection demonstrates the pattern: [`apps/strapi/src/documentMiddlewares/page.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/src/documentMiddlewares/page.ts) + [`apps/strapi/src/populateDynamicZone/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/strapi/src/populateDynamicZone). Register the middleware in [`src/index.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/src/index.ts) `bootstrap()` like `registerPopulatePageMiddleware`.

For flat schemas (like the `product` example above), this step is unnecessary — declare `populate` inline at the call site.

## Step 8 — Fetch from Next.js

Server Component example. Both server and client return fully typed responses thanks to the generic UID parameter.

```tsx
// apps/ui/src/app/[locale]/products/page.tsx
import type { Locale } from "next-intl"

import { PublicStrapiClient } from "@/lib/strapi-api"

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  const response = await PublicStrapiClient.fetchMany("api::product.product", {
    locale,
    populate: { image: true },
    status: "published",
  })

  return (
    <ul>
      {response.data.map((product) => (
        <li key={product.documentId}>
          {product.title} — {product.price}
        </li>
      ))}
    </ul>
  )
}
```

Detail page using slug filter:

```tsx
const detail = await PublicStrapiClient.fetchOneBySlug(
  "api::product.product",
  slug,
  { locale, populate: { image: true } }
)
```

`PrivateStrapiClient` has the same surface but injects the Strapi JWT from the Better Auth session — use it for per-user reads (e.g. orders, account-scoped products). See [Strapi API Client](../content-system/strapi-api-client.md).

## Step 9 — (Optional) Seed sample content

So other developers see the same example without re-typing. Create sample products in the admin UI, then from root:

```bash
pnpm seed:export
```

Commit the new `seed/exports/strapi-export-YYYY-MM-DD-HHmmss.tar.gz` alongside the schema. New developers will receive the data the next time they run `pnpm dev` (the seed runner auto-imports when baseline content is missing). See [Data Seeding](../strapi/data-seeding.md).

## Related Documentation

- [Architecture](../architecture.md) — where this type sits in the request lifecycle
- [Strapi Schemas](../content-system/strapi-schemas.md) — attribute reference, lifecycle hooks, document middlewares
- [Strapi API Client](../content-system/strapi-api-client.md) — `PublicStrapiClient` / `PrivateStrapiClient` surface
- [Strapi Types Usage](../content-system/strapi-types-usage.md) — typed query params and `Data.ContentType<...>`
- [Page Builder](../content-system/page-builder.md) — adding a dynamic-zone component instead of a collection
- [Data Seeding](../strapi/data-seeding.md) — exporting and committing sample content
