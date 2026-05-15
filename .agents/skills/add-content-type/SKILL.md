---
name: add-content-type
description: >
  Use when adding a new CMS entity that needs its own REST endpoint and
  DB table — e.g. "add content type", "new content type", "create
  strapi collection", "new single type", "add strapi model", "new
  entity". Not for page-builder sections; use `create-content-component`
  for those.
argument-hint: "[singularName]"
paths:
  - apps/strapi/src/api/**/content-types/**/schema.json
  - apps/strapi/src/api/**/controllers/**
  - apps/strapi/src/api/**/services/**
  - apps/strapi/src/api/**/routes/**
---

# Add a Strapi Content Type

Create a new top-level Strapi v5 content type. A content type owns a DB table, a REST endpoint at `/api/<plural>`, and admin UI entries. For schema fragments dropped into a page's dynamic zone, use `create-content-component` instead.

## Phase 1 — Decide kind

| Kind | When | Example |
|---|---|---|
| `collectionType` | Multiple entries | blog posts, authors, tours, events |
| `singleType` | Exactly one entry | navbar, footer, site settings |

Ask the user if unclear. Default to `collectionType`.

## Phase 2 — Decide i18n + draft/publish

- **Localized?** Most public content yes. Internal admin records often no. Check existing content types in `apps/strapi/src/api/` for project convention (Page, Footer, Navbar are localized).
- **Draft & publish?** Default `true` for editorial content. `false` for system records (e.g. internal-job).

## Phase 3 — Scaffold files

Singular kebab-case name (`blog-post`, `author`, `event`). Create at `apps/strapi/src/api/<name>/`:

```
apps/strapi/src/api/<name>/
  content-types/
    <name>/
      schema.json
  controllers/
    <name>.ts
  services/
    <name>.ts
  routes/
    <name>.ts
```

### schema.json (collection example)

```json
{
  "kind": "collectionType",
  "collectionName": "<plural_snake>",
  "info": {
    "singularName": "<name>",
    "pluralName": "<plural>",
    "displayName": "Display Name",
    "description": ""
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    }
  }
}
```

For single types: `"kind": "singleType"`. `collectionName` still required (used as table name).

### controllers/<name>.ts

```ts
import { factories } from "@strapi/strapi"

export default factories.createCoreController("api::<name>.<name>")
```

For custom logic, extend the factory — see `apps/strapi/src/api/page/controllers/page.ts` for an in-tree reference (custom `find` with breadcrumb generation).

### services/<name>.ts

```ts
import { factories } from "@strapi/strapi"

export default factories.createCoreService("api::<name>.<name>")
```

### routes/<name>.ts

```ts
import { factories } from "@strapi/strapi"

export default factories.createCoreRouter("api::<name>.<name>")
```

For custom routes, replace with a plain `routes` array — see Strapi v5 docs.

## Phase 4 — Common attribute types

| Type | Snippet |
|---|---|
| `string` | `{ "type": "string" }` |
| `text` | `{ "type": "text" }` |
| `richtext` | `{ "type": "richtext" }` |
| `integer` | `{ "type": "integer" }` |
| `boolean` | `{ "type": "boolean", "default": false }` |
| `enumeration` | `{ "type": "enumeration", "enum": ["A","B"] }` |
| `media` | `{ "type": "media", "allowedTypes": ["images"], "multiple": false }` |
| `relation` | `{ "type": "relation", "relation": "oneToMany", "target": "api::other.other" }` |
| `component` | `{ "type": "component", "component": "category.name", "repeatable": false }` |
| `dynamiczone` | `{ "type": "dynamiczone", "components": ["sections.hero","sections.cta"] }` |
| `json` | `{ "type": "json" }` |
| `uid` | `{ "type": "uid", "targetField": "title" }` |

Localized fields need `"pluginOptions": { "i18n": { "localized": true } }` per attribute (not just on the schema).

## Phase 5 — Regenerate types

```bash
pnpm --filter @repo/strapi generate:types
```

Runs `strapi ts:generate-types`. Required before the UI client can reference the new UID.

## Phase 6 — Wire UI client (if frontend reads it)

Edit `apps/ui/src/lib/strapi-api/base.ts` — add UID → path mapping in `API_ENDPOINTS`:

```ts
export const API_ENDPOINTS: Partial<Record<UID.ContentType, string>> = {
  // ...existing entries
  "api::<name>.<name>": "/<plural>",
}
```

Then add a fetcher in `apps/ui/src/lib/strapi-api/content/` (mirror an existing one — page, footer, navbar).

## Phase 7 — Configure admin permissions

Manual step in Strapi admin (not codifiable):

1. Settings → Roles → **Public** → enable `find` + `findOne` for the new content type.
2. If API tokens used, grant token access to the type.

## Phase 8 — Verify

1. `pnpm --filter @repo/strapi dev` boots without schema errors.
2. Visit `http://localhost:1337/admin` → confirm new content type appears.
3. Create one test entry, publish.
4. Hit `http://localhost:1337/api/<plural>` → expect non-empty `data` array.
5. If UI-wired: confirm fetcher returns data in dev UI.

## Checklist

- [ ] schema.json — correct `kind`, `collectionName`, `singularName`, `pluralName`
- [ ] controller, service, routes files created
- [ ] i18n flag set per schema + per localized attribute
- [ ] `pnpm --filter @repo/strapi generate:types` run
- [ ] `API_ENDPOINTS` entry added (if UI reads)
- [ ] UI fetcher added (if UI reads)
- [ ] Public permissions granted in admin
- [ ] Strapi boots clean
- [ ] **Schema migration check passes** — if you modify schemas later, run `strapi-schema-check` before opening PR

## Notes

- **Not for page-builder sections.** Sections live as components under `apps/strapi/src/components/sections/` and are dropped into a Page's dynamic zone. Use `create-content-component`.
- **No regional variants in this starter.** Don't create `page-au`, `blog-cz`, etc. — the starter is single-region.
- **No Meilisearch by default.** Don't add Meilisearch config unless the user explicitly opts in.
- **Schema changes after first ship are risky.** Renames/deletes/type-changes drop columns on boot. Always run `bash .agents/skills/strapi-schema-check/scripts/check.sh` before opening a PR that touches existing schemas.
