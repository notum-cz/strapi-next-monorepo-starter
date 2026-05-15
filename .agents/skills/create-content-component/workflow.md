# Workflow — create-content-component

Full step-by-step. SKILL.md is the routing surface; this file holds the per-phase code blocks. See `examples.md` for attribute patterns.

## 1. Create the Strapi component schema

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

See `examples.md` for the full attribute palette (CKEditor, nested components, media, enums, etc.).

Reference: https://docs.strapi.io/cms/backend-customization/models#model-schema

## 2. Register in the Page dynamic zone

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

**Add-only is safe.** Renames/deletes trigger column drops on Strapi boot. Run `bash .agents/skills/strapi-schema-check/scripts/check.sh` before the PR.

## 3. Add the populate rule

The starter uses a **filesystem-driven populate map** — drop a file under `apps/strapi/src/populateDynamicZone/<category>/<name>.ts` and it auto-registers (see `apps/strapi/src/populateDynamicZone/index.ts`; don't edit that file).

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

- `true` for components/relations with no further nesting (e.g. `"utilities.ck-editor-content": true`)
- `{ populate: { fieldName: true } }` for one level of nested component
- `{ populate: { fieldName: { populate: { media: true } } } }` for deeper media
- **Only populate components and relations** — never scalar fields
- **Reuse existing populate configs** — when a nested component already has a populate file, `import` it rather than redefining

## 4. Create the React component

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
- Wrap content in `<Container>` from `@/components/elementary/Container` unless this component itself is a layout/container
- `cn()` from `@/lib/styles` for class merging
- Design tokens, not raw hex colors
- Lucide icons

## 5. Register in `PageContentComponents`

Edit `apps/ui/src/components/page-builder/index.tsx`:

1. Add import (alphabetical within the category group):

   ```ts
   import Strapi<PascalCaseName> from "@/components/page-builder/components/<category>/Strapi<PascalCaseName>"
   ```

2. Add mapping under the matching category comment:

   ```ts
   "<category>.<name>": Strapi<PascalCaseName>,
   ```

## 6. Regenerate types

```bash
pnpm --filter @repo/strapi generate:types
```

Updates `@repo/strapi-types` so `Data.Component<"<category>.<name>">` resolves. If the script errors with "Cannot find module @repo/design-system" or "@repo/shared-data", build those packages first:

```bash
pnpm --filter @repo/design-system build
pnpm --filter @repo/shared-data build
```

## Path resilience

If the expected paths don't match, glob first before raising an error:

- Strapi components: `apps/strapi/src/components/**/*.json`
- UI page-builder components: `apps/ui/src/components/page-builder/components/**/Strapi*.tsx`
- Populate: `apps/strapi/src/populateDynamicZone/**/*.ts`
- Mapping: `apps/ui/src/components/page-builder/index.tsx`
