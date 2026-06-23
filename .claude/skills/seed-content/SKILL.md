---
name: seed-content
description: 'Use when populating the local Strapi with content programmatically through MCP — e.g. "seed content", "seed a page", "import content into strapi", "create demo content", "add a page with components". Schema-driven create/update of pages, navbar, and footer via the Strapi MCP server. For reproducible baseline content, use the native export/import seed flow instead.'
argument-hint: "[target-page-path]"
---

# Seed Content via MCP

Create or update content in the local Strapi using the Strapi MCP server, driven by the live schemas. Use it for interactive/demo seeding from a source you provide — a description, structured data, or a reference page.

For reproducible, code-tracked baseline content, prefer the native export/import flow — see `apps/docs/docs/strapi/data-seeding.md`. This skill is the interactive, MCP-driven complement.

## Prerequisites

- Strapi MCP reachable — verify with a read via MCP (list pages, or get the Navbar single type). If it isn't, stop and point the user to `apps/docs/docs/reference/AI/strapi-mcp.md`.
- Strapi running on `:1337`.

## Execution mode

- **Direct (default)** — preview the plan and get approval before writing.
- **Invoked by another skill** (e.g. `copy-component`, carrying the caller's authorization) — run autonomously: skip the approval prompt, default to **append** when a page already exists, never prompt. Log failures and report them at the end.

## Inputs

- **target page** — the page `fullPath` to seed into (existing or new).
- **target component(s)** — optional; specific UID(s) to seed (default: every section the source maps to).
- **locale** — which locale to seed into (default: the project's default locale). Every find and write is per-locale.
- **parent** — for a new page, its parent page (default: the root page `/`, or derived from the target path).

In direct mode, ask for any missing required input; when invoked by another skill, derive them and never prompt.

## Critical rules

### Schema is the source of truth

Read the target schema before mapping. Only set fields that exist; respect `required` fields and `enumeration` values; coerce scalars only when type-compatible. Skip anything that can't be mapped safely and report it — never fail the whole run over one unmappable fragment.

### A component must be registered before you write its UID

Strapi registers components from their schema files **on boot**. A component just created by `create-content-component` is not writable into a page's `content` until Strapi has **restarted** — writing an unregistered `__component` UID corrupts the dynamic zone. So when seeding a freshly created UID, first confirm Strapi restarted and is healthy (`GET http://localhost:1337/api/health` → `200`). If it isn't up, ask the user to restart it and wait — never start the dev server in the background.

### Dynamic-zone merge (page `content`, navbar, footer)

A Strapi PUT **replaces** the whole field. To add a component without wiping existing ones: GET the entry with `content` populated, append to the array, then PUT the full array back.

```text
WRONG: PUT { content: [{ new }] }              → deletes existing components
RIGHT: GET → content=[a,b]; PUT { content:[a,b,{ new }] }
```

### Page hierarchy — always set `parent`; keep `fullPath` consistent

A page's place in the tree is defined by its **`parent` relation** (which drives breadcrumbs, navigation, and child links) plus its required **`slug`** (lowercase `[a-z0-9-]`, no leading/trailing slash). **Always set `parent`** — top-level pages point at the root page (slug `/`), others at their parent page, in the same locale.

`fullPath` is the chained parent slugs + own slug (starts with `/`), normally derived from `slug` + `parent`. When seeding you **may** write it directly, but only as `<parent.fullPath>/<slug>` **and only with the matching `parent` set** — a `fullPath` without the right parent resolves the URL while breaking the hierarchy. Never invent a `fullPath` that disagrees with the parent chain.

If a stored `fullPath` ends up stale or mismatched, open the **Hierarchy** single type in Strapi admin and run **Update hierarchy** — it recalculates the affected `fullPath`s and creates the redirects in one action. While seeding pre-launch test content, those redirects are safe to delete (dev/staging only). See `apps/docs/docs/page-builder/pages-hierarchy.md`.

## Steps

1. **Verify MCP & registration** — confirm MCP is reachable; if seeding a freshly created component, confirm Strapi restarted (registration rule above).
2. **Read schemas** — page (`apps/strapi/src/api/page/content-types/page/schema.json`), the `navbar` / `footer` single types, and component schemas under `apps/strapi/src/components/` (recurse nested `component` refs). Only the dynamic-zone UIDs the Page registers are valid in `content`.
3. **Map source → UIDs** by schema:
   - **Media** — the MCP server **can't upload files**; media fields only accept **existing media ids**. So either reuse a library asset by name (`GET /api/upload/files?filters[name][$containsi]=<name>`) or upload the file _outside_ MCP first, then pass the returned id to the MCP create/update. Never screenshot an asset; if a _required_ media field can't be resolved, skip the whole fragment (don't write `null`). Upload flow below.
   - **Relations** — find-before-create by a natural key; resolve nested relations bottom-up (children before the entry that references them); reuse exact matches, create only when absent. For a `utilities.link` whose internal page target can't be resolved, fall back to an external link (`type: "external"`, `href` = the absolute source URL).
   - If no component matches a section, skip it and suggest `create-content-component`.
4. **Preview** the plan — UIDs, target page + locale, media, relations, skipped/invalid. Direct mode: approve before writing. Autonomous mode: log and proceed.
5. **Write**:
   - **Pages** (collection): find an existing page by `fullPath` + `locale` (the unique per-locale identifier — `slug` alone isn't unique). Create with `slug` / **`parent`** (root `/` or the parent page) / `content` / `status: "published"` — optionally `fullPath` as `<parent.fullPath>/<slug>`. Or GET → append → PUT to add to an existing page's `content`.
   - **Navbar / Footer** (single types): they always exist — GET, merge into `content`, PUT. Never create.
6. **Verify & report** — re-fetch by `documentId` + `locale`, confirm `fullPath`, and report created / updated / reused / skipped / invalid (with `documentId`, `fullPath`, `locale`) plus any manual follow-up (e.g. run **Update hierarchy**).

## Uploading media (outside MCP)

The MCP server references media by **id** but [cannot upload files](https://docs.strapi.io/cms/features/strapi-mcp-server). Upload first via Strapi's Upload API, then pass the id into the MCP create/update.

1. **Reuse check** — `GET /api/upload/files?filters[name][$containsi]=<name>`; if a match exists, use its `id`.
2. **Upload** (multipart) with an API token that has Upload permission (a full-access local token has it):

   ```bash
   curl -sS -X POST http://localhost:1337/api/upload \
     -H "Authorization: Bearer <API_TOKEN>" \
     -F "files=@/path/to/asset.png" \
     -F 'fileInfo={"name":"asset","alternativeText":"descriptive alt"}'
   ```

   The response is an array — take `[0].id`. (Strapi stores the file via its configured upload provider — local / S3 / etc.)

3. **Reference** that id in the MCP call: a single-media field takes the `id`; a multiple-media field takes an array of ids.

Never screenshot an asset to fake one. If a _required_ media field can't be uploaded or matched, skip the fragment (don't write `null`).

## See also

- `apps/docs/docs/reference/AI/strapi-mcp.md` — connect an agent to Strapi over MCP first.
- `create-content-component` — add (and register) a page-builder component before seeding into it.
- `copy-component` — replicate a section; may invoke this skill to seed a demo entry.
- `apps/docs/docs/strapi/data-seeding.md` — native snapshot seeding.
- `apps/docs/docs/page-builder/pages-hierarchy.md` — `fullPath`, parents, redirects.
- `apps/docs/docs/strapi/strapi-schemas.md` — schema rules.
