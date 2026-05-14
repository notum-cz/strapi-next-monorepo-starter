---
name: create-content-component
description: >
  Scaffold a new page-builder content component across Strapi and the
  Next.js frontend — Strapi component schema, dynamic-zone registration,
  populate middleware entry, React component, PageContentComponents
  mapping, and type regeneration. Use when adding a new CMS-driven page
  section. Triggers on: "add page component", "new page section",
  "page builder component", "create content component", "add section",
  "new strapi component". Not for top-level API resources — use
  `add-content-type`. Not for generic React components — use
  `add-ui-component`.
argument-hint: "[category] [name]"
---

# Create a Page-Builder Content Component

Add a new page-builder section to both Strapi (component schema + populate rules + dynamic-zone entry) and the Next.js frontend (React component + mapping). Single workflow spans both apps and ends with type regeneration.

## Phase 1 — Validate inputs

- **Name:** kebab-case, lowercase only (e.g. `pricing-table`). Reject PascalCase/camelCase (`MyComponent`, `pricingTable`).
- **Category:** lowercase, no spaces (e.g. `sections`, `forms`). Existing categories under `apps/strapi/src/components/`: `elements`, `forms`, `layout`, `sections`, `seo-utilities`, `shared`, `utilities`.
- **Custom category:** if the dir doesn't exist, create it before the component schema.
- **Confused?** If this should own its own DB table + REST endpoint, switch to `add-content-type`. If it's a generic React component not driven by Strapi, switch to `add-ui-component`.

## Phase 2 — Inputs to gather

- Name (kebab-case)
- Category (default `sections`)
- Attributes (fields the component needs — title, description, image, list of items, etc.)
- Whether any attribute should use CK Editor rich text (see Phase 3)

## Phase 3 — Duplication check

Before creating, search:

```bash
# Strapi side
ls apps/strapi/src/components/<category>/<name>.json 2>/dev/null

# UI side
find apps/ui/src/components/page-builder/components -iname "Strapi*<PascalName>*"
```

If a match exists, ask the user before proceeding (rename or extend).

## Phase 4 — Naming reference

Given `category=sections` and `name=testimonials`:

| Artifact           | Value                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| Strapi UID         | `sections.testimonials`                                                                 |
| Strapi schema file | `apps/strapi/src/components/sections/testimonials.json`                                 |
| `collectionName`   | `components_sections_testimonials` (format: `components_<category>_<name_underscored>`) |
| React component    | `StrapiTestimonials` (prefix `Strapi` + PascalCase)                                     |
| React file         | `apps/ui/src/components/page-builder/components/sections/StrapiTestimonials.tsx`        |
| Populate file      | `apps/strapi/src/populateDynamicZone/<category>/<name>.ts`                              |

## Phase 5 — Create Strapi component schema

`apps/strapi/src/components/<category>/<name>.json`:

```json
{
  "collectionName": "components_<category>_<name_underscored>",
  "info": {
    "displayName": "<PascalCaseName>",
    "description": ""
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    }
  }
}
```

### Common attribute patterns

- Plain text: `{ "type": "string" }` / `{ "type": "text" }` (multiline) / `{ "type": "richtext" }`
- **CK Editor rich text** (starter convention for editorial copy):

  ```json
  {
    "type": "customField",
    "customField": "plugin::ckeditor5.CKEditor",
    "options": { "preset": "defaultCkEditor" }
  }
  ```

  Reference: `apps/strapi/src/components/sections/hero.json` — `description`, `tag`, `note` all use CKEditor.

- Required: add `"required": true`
- Nested component (single): `{ "type": "component", "repeatable": false, "component": "utilities.link" }`
- Repeatable component: `{ "type": "component", "repeatable": true, "component": "utilities.basic-image" }`
- Media (prefer existing utility components): `utilities.basic-image`, `utilities.image-with-link`
- Enum: `{ "type": "enumeration", "enum": ["option1", "option2"] }`
- Boolean: `{ "type": "boolean", "default": false }`

Additional knobs as needed: `description` (admin UI hint), `default`, `minLength`/`maxLength`, `min`/`max`, `private` (hide from API).

Reference: https://docs.strapi.io/cms/backend-customization/models#model-schema

## Phase 6 — Register in Page dynamic zone

Edit `apps/strapi/src/api/page/content-types/page/schema.json`. Append the new UID to `attributes.content.components`:

```json
"content": {
  "type": "dynamiczone",
  "components": [
    "sections.existing-one",
    "<category>.<name>"
  ]
}
```

**Modifying Page schema is risky.** Adding a UID to the dynamic-zone list is additive + safe. Renames or removals trigger column drops. Run schema check before opening the PR:

```bash
bash .agents/skills/strapi-schema-check/scripts/check.sh
```

## Phase 7 — Add populate rule

Starter uses a **filesystem-driven populate map** — drop a file under `apps/strapi/src/populateDynamicZone/<category>/<name>.ts` and it's auto-registered (see `apps/strapi/src/populateDynamicZone/index.ts`).

```ts
import basicImagePopulate from "../utilities/basic-image"
import linkPopulate from "../utilities/link"

export default {
  populate: {
    links: linkPopulate,
    image: basicImagePopulate,
    steps: true,
  },
}
```

Rules:

- `true` for fields that are components/relations with no further nesting (e.g. `"utilities.ck-editor-content": true`)
- `{ populate: { fieldName: true } }` for one level of nested component
- `{ populate: { fieldName: { populate: { media: true } } } }` for deeper media
- **Only populate components and relations** — never scalar fields
- **Reuse existing populate configs** — when a nested component already has a populate file, `import` it rather than redefining

## Phase 8 — Create React component

`apps/ui/src/components/page-builder/components/<category>/Strapi<PascalCaseName>.tsx`:

```tsx
import { Data } from "@repo/strapi-types"

import { Container } from "@/components/elementary/Container"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

export function Strapi<PascalCaseName>({
  component,
}: {
  readonly component: Data.Component<"<category>.<name>">
}) {
  removeThisWhenYouNeedMe("Strapi<PascalCaseName>")

  return (
    <section>
      <Container className="py-8">
        <h2 className="mb-4 text-3xl font-bold">{component.title}</h2>
        {/* TODO: implement component UI */}
      </Container>
    </section>
  )
}

Strapi<PascalCaseName>.displayName = "Strapi<PascalCaseName>"

export default Strapi<PascalCaseName>
```

Conventions (cross-ref `add-ui-component`):

- Named export + default export
- Props typed via `Data.Component<"<category>.<name>">` from `@repo/strapi-types`
- `removeThisWhenYouNeedMe(...)` placeholder — keep until the component is real
- Wrap content in `<Container>` from `@/components/elementary/Container` unless this component itself is a layout/container wrapping others
- `cn()` from `@/lib/styles` for class merging
- Design tokens, not raw hex colors
- Lucide icons

## Phase 9 — Register in `PageContentComponents`

Edit `apps/ui/src/components/page-builder/index.tsx`:

1. Add import (alphabetical within category group):

   ```ts
   import Strapi<PascalCaseName> from "@/components/page-builder/components/<category>/Strapi<PascalCaseName>"
   ```

2. Add mapping under the matching category comment:

   ```ts
   "<category>.<name>": Strapi<PascalCaseName>,
   ```

## Phase 10 — Regenerate types

```bash
pnpm --filter @repo/strapi generate:types
```

Updates `@repo/strapi-types` so `Data.Component<"<category>.<name>">` resolves. If the script errors with "Cannot find module @repo/design-system" or "@repo/shared-data", build those packages first:

```bash
pnpm --filter @repo/design-system build
pnpm --filter @repo/shared-data build
```

## Phase 11 — Verify end-to-end

1. `pnpm --filter @repo/strapi dev` — Strapi boots clean (no schema error on new component).
2. Admin → Pages → edit a Page → add a new entry of the new component to the dynamic zone → publish.
3. `pnpm --filter @repo/ui dev` — render the page → confirm component renders + populated data is present.
4. `pnpm --filter @repo/ui exec tsc --noEmit` — no type errors in the new React component.
5. Run schema check before opening PR:

   ```bash
   bash .agents/skills/strapi-schema-check/scripts/check.sh
   ```

## Path resilience

If expected paths don't match, glob first before raising an error:

- Strapi components: `apps/strapi/src/components/**/*.json`
- UI page-builder components: `apps/ui/src/components/page-builder/components/**/Strapi*.tsx`
- Populate: `apps/strapi/src/populateDynamicZone/**/*.ts`
- Mapping: `apps/ui/src/components/page-builder/index.tsx`

## Checklist

- [ ] Strapi schema created with correct `collectionName` format
- [ ] Component UID registered in Page's `content` dynamic zone
- [ ] Populate file created under `populateDynamicZone/<category>/<name>.ts` (only if any field needs population)
- [ ] React component created with `Strapi` prefix, both named + default exports
- [ ] Component registered in `PageContentComponents` map
- [ ] Types regenerated (`pnpm --filter @repo/strapi generate:types`)
- [ ] Strapi boots clean
- [ ] Component renders in dev with real CMS data
- [ ] `tsc --noEmit` clean on UI side
- [ ] `strapi-schema-check` passes (or only flags additive UID, no risky diffs)

## Notes

- **No regional wrappers in this starter.** Scenic uses per-region wrapper components (`*_wrapper.json` w/ 6 region relations). The starter is single-region — skip the wrapper pattern.
- **No Storybook.** Don't scaffold `.stories.tsx`. Visual review via the dev server or Playwright visual tests.
- **CK Editor is the editorial-copy default**, not Strapi `richtext`. Use the `customField` + `plugin::ckeditor5.CKEditor` shape with `preset: "defaultCkEditor"` for rich content fields.
- **Filesystem-driven populate.** Don't edit `populateDynamicZone/index.ts` — it auto-scans sibling dirs. Just drop the file in.
- **Page schema is high-risk.** Any rename/delete in `apps/strapi/src/api/page/content-types/page/schema.json` triggers column drops on boot. Add-only operations on the dynamic-zone array are safe.

## See also

- `add-content-type` — when the new thing should be a top-level API resource, not a component
- `add-ui-component` — generic UI primitives (Button, Container, Form fields)
- `strapi-schema-check` — pre-PR schema risk validation
- `docs/page-builder.md` — architecture overview (if present in the repo)
