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

Create a new top-level Strapi v5 content type — a DB table, a REST endpoint at `/api/<plural>`, and admin entries. For schema fragments dropped into a page's dynamic zone, use `create-content-component` instead.

Full worked walkthrough (with a `product` example): `apps/docs/docs/getting-started/add-content-type.md`. This skill is the condensed checklist.

## Phase 1 — Kind, i18n, draft/publish

- **Kind** — `collectionType` (many entries: blog posts, authors, events) or `singleType` (exactly one: navbar, footer, settings). Default `collectionType`; ask if unclear.
- **Localized?** Most public content yes (Page, Navbar, Footer are); internal records often no.
- **Draft & publish?** `true` for editorial content; `false` for system records.

## Phase 2 — Scaffold files

Singular kebab-case name (`blog-post`, `product`). Create under `apps/strapi/src/api/<name>/`: `content-types/<name>/schema.json`, `controllers/<name>.ts`, `services/<name>.ts`, `routes/<name>.ts`.

### schema.json

```json
{
  "kind": "collectionType",
  "collectionName": "<plural_snake>",
  "info": {
    "singularName": "<name>",
    "pluralName": "<plural>",
    "displayName": "Display Name"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": { "i18n": { "localized": true } },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": { "i18n": { "localized": true } }
    }
  }
}
```

Single types use `"kind": "singleType"` (`collectionName` still required — it's the table name).

### controllers / services / routes

Each is a one-line factory (substitute `<name>`):

```ts
import { factories } from "@strapi/strapi"

export default factories.createCoreController("api::<name>.<name>") // controller
export default factories.createCoreService("api::<name>.<name>") // service
export default factories.createCoreRouter("api::<name>.<name>") // router
```

This exposes standard CRUD (`GET`/`POST /api/<plural>`, …). For custom logic, override controller methods — see `apps/strapi/src/api/page/controllers/page.ts`. You can also scaffold via `pnpm -F @repo/strapi strapi generate`.

## Phase 3 — Attributes

Common types (full reference: `apps/docs/docs/strapi/strapi-schemas.md`):

| Type                           | Snippet                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `string` / `text` / `richtext` | `{ "type": "string" }`                                                          |
| `integer` / `decimal`          | `{ "type": "decimal" }`                                                         |
| `boolean`                      | `{ "type": "boolean", "default": false }`                                       |
| `enumeration`                  | `{ "type": "enumeration", "enum": ["A","B"] }`                                  |
| `media`                        | `{ "type": "media", "allowedTypes": ["images"], "multiple": false }`            |
| `relation`                     | `{ "type": "relation", "relation": "oneToMany", "target": "api::other.other" }` |
| `component`                    | `{ "type": "component", "component": "category.name", "repeatable": false }`    |
| `uid`                          | `{ "type": "uid", "targetField": "title" }`                                     |

Localized fields need `"pluginOptions": { "i18n": { "localized": true } }` **per attribute**; un-localized fields share one value across locales.

## Phase 4 — Regenerate types

```bash
pnpm --filter @repo/strapi generate:types
```

Required before the UI can reference the new UID. Afterward `UID.ContentType` and `Data.ContentType<"api::<name>.<name>">` resolve — see `apps/docs/docs/reference/packages/strapi-types.md`.

## Phase 5 — Wire the UI client (if the frontend reads it)

- Add the UID → path mapping to `API_ENDPOINTS` in `apps/ui/src/lib/strapi-api/base.ts`:

  ```ts
  "api::<name>.<name>": "/<plural>",
  ```

- Fetch with `PublicStrapiClient.fetchMany` / `fetchOneBySlug(...)` (mirror page/footer/navbar). See `apps/docs/docs/ui/strapi-api-client.md`.
- **Client-side fetches only:** also add `api/<plural>` to the allow-list in `apps/ui/src/lib/strapi-api/request-auth.ts`. Server Components don't need this.
- **Relations needing a specific shape:** add a `populateOverrides` entry in `apps/strapi/config/plugins.ts` (smart-populate). Flat schemas need nothing — see `apps/docs/docs/strapi/plugins/smart-populate.md`.

## Phase 6 — Access (usually nothing to do)

The UI authenticates with Strapi's **read-only API token**, which already covers `find`/`findOne` on every content type — including new ones — so a read-only UI needs **no permission change**. Adjust permissions only for:

- **UI writes** (Custom token) → Settings → API Tokens → enable actions on the type.
- **Per-user reads/writes** (user JWT via `PrivateStrapiClient`) → Settings → Users & Permissions → Roles → Authenticated.

Permissions live in the DB and travel via the seed export — see the walkthrough's "Grant access" section and `apps/docs/docs/strapi/data-seeding.md`.

## Phase 7 — Verify

1. `pnpm dev:strapi` boots without schema errors; the new type appears in admin.
2. Create + publish one entry; `GET http://localhost:1337/api/<plural>` returns a non-empty `data` array.
3. If UI-wired: the fetcher returns data in dev.
4. Optional — `pnpm seed:export` and commit the export so others get the sample content (only if you created new content).

## Checklist

- [ ] schema.json — correct `kind`, `collectionName`, `singularName`, `pluralName`
- [ ] controller, service, routes created
- [ ] i18n flag set per schema + per localized attribute
- [ ] `pnpm --filter @repo/strapi generate:types` run
- [ ] `API_ENDPOINTS` entry added (if UI reads); proxy allow-list updated (client-side only)
- [ ] Write / per-user permissions adjusted only if needed
- [ ] Strapi boots clean

## Notes

- **Not for page-builder sections** — those are components under `apps/strapi/src/components/` dropped into a Page's dynamic zone. Use `create-content-component`.
- **Schema changes after first ship are risky** — renames/deletes/type-changes drop columns on boot. Run `bash .claude/skills/strapi-schema-check/scripts/check.sh` (skill `strapi-schema-check`) before a PR that touches existing schemas.
