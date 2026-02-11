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

## Lifecycle Subscribers

Database event handlers in `apps/strapi/src/lifeCycles/`:

```typescript
// src/lifeCycles/user.ts
export default {
  register({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      async afterCreate(event) {
        const user = event.result
        // Send welcome email, create related records, etc.
      },

      async beforeUpdate(event) {
        const { data, where } = event.params
        // Validate changes, transform data
      },
    })
  },
}
```

Available events:

- `beforeCreate`, `afterCreate`
- `beforeUpdate`, `afterUpdate`
- `beforeDelete`, `afterDelete`
- `beforeFindOne`, `afterFindOne`
- `beforeFindMany`, `afterFindMany`

## Document Middlewares

Intercept and modify queries. Used for deep population of dynamic zones.

**`apps/strapi/src/documentMiddlewares/page.ts`**

```typescript
const middleware = (strapi) => ({
  async findMany(event) {
    const { params } = event

    if (params.middlewarePopulate?.includes("content")) {
      params.populate = {
        ...params.populate,
        content: {
          on: {
            "sections.hero": {
              populate: { links: true, image: { populate: { media: true } } },
            },
            "utilities.ck-editor-content": true,
          },
        },
      }
    }

    return event.next()
  },
})
```

See [Page Builder](./page-builder.md) for population patterns.

## Adding New Components

Use the skill for automated creation:

```
/create-content-component
```

Or follow manual steps in [Page Builder](./page-builder.md#adding-new-components).

## Related Documentation

- [Page Builder](./page-builder.md) — Component registry and rendering
- [Pages Hierarchy](./pages-hierarchy.md) — URL structure and redirects
