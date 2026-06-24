# Workflow — create-content-component

Full step-by-step. SKILL.md is the routing surface; this file holds the per-phase code blocks. See `examples.md` for attribute patterns.

## 1. Create the Strapi component schema

`apps/strapi/src/components/<category>/<name>.json`:

```json
{
  "collectionName": "components_<category>_<name_underscored>",
  "info": {
    "displayName": "<PascalCaseName>",
    "icon": "<chosen-icon>",
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

`info.icon` is the admin-panel icon (optional but recommended). Pick one that represents the component's purpose from [`references/strapi-icons.txt`](references/strapi-icons.txt) — use the exact name, and vary it across components rather than reusing one.

See `examples.md` for the full attribute palette (rich text — CKEditor & TipTap, nested components, media, enums, etc.).

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

**Add-only is safe.** Renames/deletes trigger column drops on Strapi boot. Run `bash .claude/skills/strapi-schema-check/scripts/check.sh` before the PR.

## 3. Population — usually nothing to do

The page fetch in `apps/ui/src/lib/strapi-api/content/server.ts` uses `populate: { content: "smart" }`. The [smart-populate plugin](https://github.com/notum-cz/strapi-plugin-smart-populate) reads each component's schema at bootstrap and auto-populates its nested components, media, and relations. A new section therefore needs **no populate code** in the common case.

Add an override only when a relation needs specific fields or extra depth. Edit `populateOverrides` in `apps/strapi/config/plugins/smart-populate.ts`:

```ts
const populateOverrides = [
  {
    componentUid: "utilities.link",
    mergeWithGeneratedPopulate: true,
    overridePopulate: {
      page: { fields: ["fullPath"] },
    },
  },
] satisfies PopulateOverrideEntries<ComponentPopulateMap>
```

`mergeWithGeneratedPopulate: true` keeps the auto-generated shape and layers the override on top. See `apps/docs/docs/strapi/plugins/smart-populate.md`.

## 4. Create the React component

`apps/ui/src/components/page-builder/components/<category>/Strapi<PascalCaseName>.tsx`:

```tsx
import "server-only"

import type { Data } from "@repo/strapi-types"

import { Container } from "@/components/elementary/Container"
import { cn } from "@/lib/styles"
import type { PageBuilderComponentProps } from "@/types/general"

export function Strapi<PascalCaseName>({
  component,
}: PageBuilderComponentProps & {
  component: Data.Component<"<category>.<name>">
}) {
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

- `import "server-only"` at the top — every shipped page-builder section has it; it forces a build-time error if a client component ever imports this file.
- Props typed as `PageBuilderComponentProps & { component: Data.Component<"<category>.<name>"> }` — `PageBuilderComponentProps` carries page-level context (locale, etc.); the closest references are `StrapiFeaturesList.tsx` and `StrapiFigures.tsx`.
- Named export + default export.
- Wrap content in `<Container>` from `@/components/elementary/Container` unless this component is itself a layout/container.
- `cn()` from `@/lib/styles` for class merging.
- Design tokens (`bg-background`, `text-primary`, `text-muted-foreground`), not raw hex colors.
- Lucide icons.
- Static UI copy (e.g. a "/month" suffix, "Most popular" badge) should come from the i18n message catalog under `apps/ui/locales/`, not be hardcoded in the component.

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

## 6. Regenerate types (optional, done automatically on Strapi restart)

```bash
pnpm --filter @repo/strapi generate:types
```

Updates `@repo/strapi-types` so `Data.Component<"<category>.<name>">` resolves.

If the script errors with "Cannot find module @repo/design-system" or "@repo/shared-data" or "@repo/logging" build those packages first:

```bash
pnpm --filter @repo/design-system build
pnpm --filter @repo/shared-data build
pnpm --filter @repo/logging build
```

## Path resilience

If the expected paths don't match, glob first before raising an error:

- Strapi components: `apps/strapi/src/components/**/*.json`
- UI page-builder components: `apps/ui/src/components/page-builder/components/**/Strapi*.tsx`
- Mapping: `apps/ui/src/components/page-builder/index.tsx`
- Populate overrides: `apps/strapi/config/plugins/smart-populate.ts`
