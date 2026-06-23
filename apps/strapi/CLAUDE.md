# Strapi Backend

Strapi v5 CMS with PostgreSQL. Handles content management, page hierarchy, and API endpoints.

## Component Naming (Critical)

Pattern: `category.kebab-case`

| Element        | Pattern                                    | Example                             |
| -------------- | ------------------------------------------ | ----------------------------------- |
| Strapi UID     | `category.kebab-case`                      | `sections.hero`                     |
| Schema file    | `src/components/{category}/{name}.json`    | `src/components/sections/hero.json` |
| collectionName | `components_{category}_{name_underscored}` | `components_sections_hero`          |

The UID must match in: schema location, page dynamic zone, smart populate generation, frontend registry.

## Smart Populate

`@notum-cz/strapi-plugin-smart-populate` applies deep population for components and dynamic zones.

Frontend triggers it with the `"smart"` populate token:

```typescript
await client.fetchOneByFullPath("api::page.page", fullPath, {
  populate: { content: "smart" },
})
```

Use `populateOverrides` in `config/plugins/smart-populate.ts` only for project-specific relation shapes that should not use the generated default.

## Localization

Localizable fields need i18n plugin option:

```json
{
  "title": {
    "type": "string",
    "pluginOptions": { "i18n": { "localized": true } }
  }
}
```

## Adding Page Components

Use skill: `/create-content-component`

Or manually:

1. Create schema: `src/components/{category}/{name}.json`
2. Register in page dynamiczone: `src/api/page/content-types/page/schema.json`
3. Generate types: `pnpm generate:types`
4. Create React component in `apps/ui` — see [apps/ui/AGENTS.md](../ui/AGENTS.md)

Full workflow: [Page Builder docs](../docs/docs/page-builder/introduction.md#adding-new-components)

## Page Hierarchy

Pages use parent-child relations. `fullPath` is recalculated on demand via the Hierarchy single type.

**Key files:**

| File                                            | Purpose                           |
| ----------------------------------------------- | --------------------------------- |
| `src/api/page/content-types/page/lifecycles.ts` | Root-slug guard (save + publish)  |
| `src/api/hierarchy/utils/index.ts`              | fullPath diff computation         |
| `src/api/hierarchy/services/hierarchy.ts`       | Computes/applies fullPath changes |

**Admin endpoints:**

- `GET /api/hierarchy/pending-changes` — List pending fullPath changes
- `POST /api/hierarchy/recalculate` — Apply changes + create redirects

See [Pages Hierarchy docs](../docs/docs/page-builder/pages-hierarchy.md) for content editor workflow.

## Related Documentation

- [Strapi Schemas](../docs/docs/strapi/strapi-schemas.md) — Schema attributes, localization, lifecycle hooks
- [Page Builder](../docs/docs/page-builder/introduction.md) — Component registry and rendering
- [Pages Hierarchy](../docs/docs/page-builder/pages-hierarchy.md) — URL structure and redirects
