---
sidebar_position: 3
sidebar_label: "Add a content type"
---

# Add a content type

Create an Events collection type that is queryable from the Next.js frontend.

## Step 1: Create the Strapi API directory

1. Create the directory structure at `apps/strapi/src/api/event/`:

   ```
   apps/strapi/src/api/event/
   ├── content-types/
   │   └── event/
   │       └── schema.json
   ├── controllers/
   │   └── event.ts
   ├── routes/
   │   └── event.ts
   └── services/
       └── event.ts
   ```

2. Define the content type schema. The `kind` field determines whether this is a collection (many entries) or a single type (one entry).

   ```json title="apps/strapi/src/api/event/content-types/event/schema.json"
   {
     "kind": "collectionType",
     "collectionName": "events",
     "info": {
       "singularName": "event",
       "pluralName": "events",
       "displayName": "Event"
     },
     "options": {
       "draftAndPublish": true
     },
     "pluginOptions": {},
     "attributes": {
       "title": {
         "type": "string",
         "required": true
       },
       "slug": {
         "type": "string",
         "required": true
       }
     }
   }
   ```

   For a single type (e.g. a site-wide banner), set `"kind": "singleType"` instead.

   See the [schema reference](../backend/schemas) for all available field types and options.

3. Add the controller, router, and service. These use Strapi's core factories -- no custom logic needed for basic CRUD.

   ```ts title="apps/strapi/src/api/event/controllers/event.ts"
   import { factories } from "@strapi/strapi"

   export default factories.createCoreController("api::event.event")
   ```

   ```ts title="apps/strapi/src/api/event/routes/event.ts"
   import { factories } from "@strapi/strapi"

   export default factories.createCoreRouter("api::event.event")
   ```

   ```ts title="apps/strapi/src/api/event/services/event.ts"
   import { factories } from "@strapi/strapi"

   export default factories.createCoreService("api::event.event")
   ```

   All three files follow the same pattern. Without these files Strapi will not expose the REST API for the content type.

For an overview of how content types relate to each other, see the [content model reference](../template/content-model).

## Step 2: Add to API_ENDPOINTS

1. Open `apps/ui/src/lib/strapi-api/base.ts` and add the new UID-to-path mapping:

   ```ts title="apps/ui/src/lib/strapi-api/base.ts"
   export const API_ENDPOINTS: Partial<Record<UID.ContentType, string>> = {
     "api::page.page": "/pages",
     "api::footer.footer": "/footer",
     "api::navbar.navbar": "/navbar",
     "api::subscriber.subscriber": "/subscribers",
     // highlight-next-line
     "api::event.event": "/events",
   } as const
   ```

   If you skip this step, the client throws: `Endpoint for UID "api::event.event" not found. Extend API_ENDPOINTS in lib/api/client.ts.`

See the [API client documentation](../frontend/api-client) for details on how `BaseStrapiClient` resolves UIDs to paths.

## Step 3: Add a server fetcher

1. Add a fetcher function in `apps/ui/src/lib/strapi-api/content/server.ts`:

   ```ts title="apps/ui/src/lib/strapi-api/content/server.ts"
   export async function fetchEvents(locale: Locale) {
     try {
       return await PublicStrapiClient.fetchMany("api::event.event", {
         locale,
         populate: {},
       })
     } catch (e: unknown) {
       logNonBlockingError({
         message: `Error fetching events for locale '${locale}'`,
         error: {
           error: e instanceof Error ? e.message : String(e),
           stack: e instanceof Error ? e.stack : undefined,
         },
       })
     }
   }
   ```

   Key conventions:
   - **`PublicStrapiClient`** for publicly accessible data, **`PrivateStrapiClient`** for data requiring authentication.
   - **`fetchMany`** for collection types (returns a list), **`fetchOne`** for single types (returns one entry).
   - Always wrap in `try/catch` with `logNonBlockingError` -- server fetchers never throw. A failed fetch returns `undefined` instead of crashing the page.

## Step 4: Generate types

1. Run the type generator from the Strapi app:

   ```bash
   cd apps/strapi && pnpm generate:types
   ```

   This regenerates the `@repo/strapi-types` package from your schema JSON files. TypeScript will not recognize `"api::event.event"` as a valid UID until this step runs.

:::warning Don't skip type generation
Without running `pnpm generate:types`, any code referencing the new UID will fail with a TypeScript error. Always regenerate after adding or modifying a schema.
:::

## Optional: Allow client-side access

If the content type needs to be fetched from browser components (via the Next.js proxy), add the path to `ALLOWED_STRAPI_ENDPOINTS` in `apps/ui/src/lib/strapi-api/request-auth.ts`:

```ts title="apps/ui/src/lib/strapi-api/request-auth.ts"
const ALLOWED_STRAPI_ENDPOINTS: Record<string, string[]> = {
  GET: [
    "api/pages",
    "api/footer",
    "api/navbar",
    // highlight-next-line
    "api/events",
    // ...
  ],
  // ...
}
```

This is only needed for client components that fetch directly. Server components use `PublicStrapiClient` which bypasses the proxy.

:::tip Anti-patterns to avoid

- **Don't manually write types** -- always use `pnpm generate:types`. Hand-written types drift from the schema.
- **Don't skip the routes/services/controllers files** -- Strapi will not expose the API endpoint without all three.
  :::
