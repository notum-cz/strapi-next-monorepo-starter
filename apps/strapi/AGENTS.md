# Strapi Backend

Strapi v5 CMS with PostgreSQL. Handles content management, page hierarchy, and API endpoints.

## Component Naming (Critical)

Pattern: `category.kebab-case`

| Element        | Pattern                                    | Example                             |
| -------------- | ------------------------------------------ | ----------------------------------- |
| Strapi UID     | `category.kebab-case`                      | `sections.hero`                     |
| Schema file    | `src/components/{category}/{name}.json`    | `src/components/sections/hero.json` |
| collectionName | `components_{category}_{name_underscored}` | `components_sections_hero`          |

The UID must match in: schema location, page dynamiczone, middleware population, frontend registry.

## Document Middleware

**`src/documentMiddlewares/page.ts`** intercepts queries and applies deep population.

Frontend triggers via `middlewarePopulate` parameter:

```typescript
await client.fetchOneByFullPath("api::page.page", fullPath, {
  populate: { content: true },
  middlewarePopulate: ["content"],
})
```

Population uses `on` pattern for dynamic zones — see [Page Builder docs](../../docs/page-builder.md#population-rules).

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
3. Add population rules: `src/documentMiddlewares/page.ts`
4. Generate types: `pnpm generate:types`
5. Create React component in `apps/ui` — see [apps/ui/AGENTS.md](../ui/AGENTS.md)

Full workflow: [Page Builder docs](../../docs/page-builder.md#adding-new-components)

## Page Hierarchy

Pages use parent-child relations. `fullPath` is auto-generated via internal jobs.

**Key files:**

| File                                            | Purpose                          |
| ----------------------------------------------- | -------------------------------- |
| `src/api/page/content-types/page/lifecycles.ts` | Triggers on publish              |
| `src/utils/hierarchy/index.ts`                  | Job processing logic             |
| `src/api/internal-job/services/internal-job.ts` | Job queue service                |
| `src/utils/constants.ts`                        | `PAGES_HIERARCHY_ENABLED` toggle |

**Admin endpoints:**

- `POST /api/internal-job/fullpaths/recalculate/all` — Process fullpath jobs
- `POST /api/internal-job/redirects/create/all` — Create redirect records

See [Pages Hierarchy docs](../../docs/pages-hierarchy.md) for content editor workflow.

## Related Documentation

- [Strapi Schemas](../../docs/strapi-schemas.md) — Schema attributes, localization, lifecycle hooks
- [Page Builder](../../docs/page-builder.md) — Component registry and rendering
- [Pages Hierarchy](../../docs/pages-hierarchy.md) — URL structure and redirects
