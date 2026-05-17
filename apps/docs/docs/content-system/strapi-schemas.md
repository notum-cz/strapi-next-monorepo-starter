# Strapi Schemas

Guidelines for creating and managing Strapi content type and component schemas.

## Component Naming Convention

Pattern: `{category}.{kebab-case-name}`

| Element        | Pattern                                    | Example                             |
| -------------- | ------------------------------------------ | ----------------------------------- |
| Strapi UID     | `category.kebab-case`                      | `sections.hero`                     |
| Schema file    | `{name}.json`                              | `src/components/sections/hero.json` |
| collectionName | `components_{category}_{name_underscored}` | `components_sections_hero`          |

The UID must match exactly in:

1. Schema file location
2. Page's dynamiczone components array
3. Document middleware population rules
4. Frontend component registry

## Schema Attributes

### Basic Types

```json
{
  "title": {
    "type": "string",
    "required": true
  },
  "description": {
    "type": "text"
  },
  "content": {
    "type": "richtext"
  },
  "isActive": {
    "type": "boolean",
    "default": false
  }
}
```

### Enumerations

```json
{
  "variant": {
    "type": "enumeration",
    "enum": ["primary", "secondary", "outline"],
    "default": "primary"
  }
}
```

### Nested Components

```json
{
  "link": {
    "type": "component",
    "repeatable": false,
    "component": "utilities.link"
  },
  "images": {
    "type": "component",
    "repeatable": true,
    "component": "utilities.basic-image"
  }
}
```

### Media Fields

```json
{
  "image": {
    "type": "media",
    "multiple": false,
    "allowedTypes": ["images"]
  },
  "documents": {
    "type": "media",
    "multiple": true,
    "allowedTypes": ["files"]
  }
}
```

### Relations

```json
{
  "author": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::author.author",
    "inversedBy": "articles"
  }
}
```

## Localization

All localizable fields need the i18n plugin option:

```json
{
  "title": {
    "type": "string",
    "pluginOptions": {
      "i18n": { "localized": true }
    }
  },
  "internalCode": {
    "type": "string"
  }
}
```

Fields without `i18n.localized: true` share the same value across all locales.

## Document Middlewares (preferred)

Document middlewares are the v5-native way to react to or transform content operations. They run against the **Documents API** — the same surface the REST API and admin panel use — so they see actions in document terms (`create`, `update`, `publish`, `unpublish`, `discardDraft`, `findOne`, `findMany`, `findFirst`, `delete`) rather than raw DB rows.

**Prefer document middlewares over lifecycle subscribers for any new code.** They behave predictably under Draft & Publish, locale switches, and the published/draft duality that Strapi v5 introduces.

Files live in [`apps/strapi/src/documentMiddlewares/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/strapi/src/documentMiddlewares). Register them inside `bootstrap()` in [`src/index.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/src/index.ts).

```typescript
// src/documentMiddlewares/product.ts
import type { Core } from "@strapi/strapi"

export const registerProductMiddleware = ({
  strapi,
}: {
  strapi: Core.Strapi
}) => {
  strapi.documents.use(async (context, next) => {
    // context.uid          — e.g. "api::product.product"
    // context.action       — "create" | "update" | "publish" | "findMany" | ...
    // context.params       — request params (filters, populate, data, ...)
    if (context.uid !== "api::product.product") return next()

    if (context.action === "publish") {
      // Runs once per *document* publish, regardless of whether the row
      // already existed as a draft. No phantom "create" events.
    }

    const result = await next()
    return result
  })
}
```

Then in `src/index.ts`:

```typescript
bootstrap({ strapi }) {
  registerProductMiddleware({ strapi })
}
```

Typical use cases:

- Deep population of dynamic zones — the canonical example is [`documentMiddlewares/page.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/src/documentMiddlewares/page.ts) (intercepts `findMany`/`findOne`/`findFirst`, reads the `populateDynamicZone` request param, builds an optimal `populate` tree from [`src/populateDynamicZone/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/strapi/src/populateDynamicZone)). See [Page Builder → Population](./page-builder.md#population-rules).
- Side effects tied to **document state transitions** (publish, unpublish, discard draft) — e.g. invalidate a downstream cache when a `page` is published.
- Cross-document validation that needs the full Documents API context (locale, status, populated relations) — easier here than reconstructing it from raw DB rows in a lifecycle.

## Lifecycle Subscribers (legacy / row-level only)

Lower-level DB-row event handlers in [`apps/strapi/src/lifeCycles/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/strapi/src/lifeCycles). They subscribe to **database** events — not document events — via `strapi.db.lifecycles.subscribe`.

:::warning Lifecycle confusion under Draft & Publish

In Strapi v5, publishing a draft entry internally creates a **new DB row** for the published version while keeping the draft. That fires `afterCreate` on the lifecycle subscriber even though, from a content-editor perspective, the document already existed. Same trap for `beforeUpdate`/`afterDelete` during publish/discard.

If your handler is meant to react to "a new product was added" (a **document** concept), do not use `afterCreate` — you will fire on every publish of every existing draft. Use a [document middleware](#document-middlewares-preferred) on `context.action === "publish"` instead.

:::

Keep lifecycles for genuinely row-scoped concerns: ORM-level integrity checks, migrating non-document tables, or extending plugin internals (`plugin::users-permissions.user`, admin users) where the Documents API does not apply.

```typescript
// src/lifeCycles/user.ts — extending the Users & Permissions plugin
export const registerUserSubscriber = ({ strapi }) => {
  strapi.db.lifecycles.subscribe({
    models: ["plugin::users-permissions.user"],

    async afterCreate(event) {
      // Users & Permissions does not use Draft & Publish,
      // so afterCreate is unambiguous here.
    },
  })
}
```

Available events: `beforeCreate`/`afterCreate`, `beforeUpdate`/`afterUpdate`, `beforeDelete`/`afterDelete`, `beforeFindOne`/`afterFindOne`, `beforeFindMany`/`afterFindMany`.

:::caution Exceptions roll back the transaction

Lifecycle subscribers run **inside the same DB transaction as the triggering operation** — for both `before*` and `after*` events. Any uncaught exception thrown from a subscriber aborts the transaction and reverts the original write.

This includes "post-write" side effects in `afterCreate`/`afterUpdate`: if an email send, webhook call, or downstream service throws inside the handler, the user/page/whatever you just created **will not exist** after the request returns. Wrap fallible side effects in `try`/`catch` (or `void`-fire them outside the transaction) unless you genuinely want the write reverted on failure.

:::

## Adding New Components

Use the skill for automated creation:

```
/create-content-component
```

Or follow manual steps in [Page Builder](./page-builder.md#adding-new-components).

## Related Documentation

- [Page Builder](./page-builder.md) — Component registry and rendering
- [Pages Hierarchy](./pages-hierarchy.md) — URL structure and redirects
