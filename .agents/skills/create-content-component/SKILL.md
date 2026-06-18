---
name: create-content-component
description: "Creates a new page builder content component for both Strapi and the Next.js frontend. Triggers: add/create page component, new page section, page builder component, add form component."
---

# Add Page Builder

Add a new page builder (component) to both Strapi and the Next.js frontend.

## Input Validation

Before proceeding, validate inputs:

- **Name**: must be kebab-case, lowercase only (e.g. `pricing-table`). Reject PascalCase/camelCase like `MyComponent` or `pricingTable` — ask user to correct.
- **Category**: must be lowercase, no spaces (e.g. `sections`, `forms`). Reject invalid formats.

If invalid format provided, ask user to correct before proceeding.

## Inputs

Ask the user for:

- **Name**: kebab-case component name (e.g. `testimonials`, `pricing-table`)
- **Category**: one of `sections`, `forms`, `utilities`, `seo-utilities`, `elements` (default: `sections`), or any custom category.
- **Attributes**: what fields the component needs (e.g. title, description, image, items list)

### Custom Category Handling

If category doesn't exist in `apps/strapi/src/components/`, create the folder first before creating the component schema.

## Duplication prevention

Before proceeding, first check if the component or similar one already exists in Strapi or the Next.js frontend. If so, ask user if they want to proceed, or go with a different name.

## Naming Convention

Given category `sections` and name `testimonials`:

- Strapi UID: `sections.testimonials`
- Strapi file: `apps/strapi/src/components/sections/testimonials.json`
- `collectionName`: `components_sections_testimonials` (format: `components_{category}_{name_underscored}`)
- React component: `StrapiTestimonials` (prefix `Strapi` + PascalCase of name)
- React file: `apps/ui/src/components/page-builder/components/sections/StrapiTestimonials.tsx`

## Steps

### 1. Create Strapi component schema

Create `apps/strapi/src/components/{category}/{name}.json`:

```json
{
  "collectionName": "components_{category}_{name_with_underscores}",
  "info": {
    "displayName": "{PascalCaseName}",
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

Populate `attributes` based on user requirements. Common attribute patterns:

- Text: `{ "type": "string" }` or `{ "type": "text" }` (multiline) or `{ "type": "richtext" }`
- Required: add `"required": true`
- Nested component: `{ "type": "component", "repeatable": false, "component": "utilities.link" }`
- Repeatable component: `{ "type": "component", "repeatable": true, "component": "utilities.basic-image" }`
- Media: use a component like `utilities.image-with-link` or `utilities.basic-image`
- Enum: `{ "type": "enumeration", "enum": ["option1", "option2"] }`
- Boolean: `{ "type": "boolean", "default": false }`

**Additional attribute options** (add as needed):

- `description`: admin UI hint (e.g. `"description": "Displayed below the section title"`)
- `default`: default value (e.g. `"default": "Click here"`)
- `minLength`/`maxLength`: string length constraints (e.g. `"minLength": 3, "maxLength": 100`)
- `min`/`max`: number constraints
- `private`: hide from API response (e.g. `"private": true`)

Reference the strapi documentation for more information on component schemas: https://docs.strapi.io/cms/backend-customization/models#model-schema

### 2. Register in page dynamic zone

Edit `apps/strapi/src/api/page/content-types/page/schema.json`.

Add the new UID to the `attributes.content.components` array:

```json
"content": {
  "type": "dynamiczone",
  "components": [
    ...existing,
    "{category}.{name}"
  ]
}
```

### 3. Review smart populate overrides

Smart populate generates component, nested component, and media population from Strapi schemas automatically. Do not add per-component population files.

Only add or update a `populateOverrides` entry in `apps/strapi/config/plugins.ts` when the new component contains a relation field that needs a project-specific shape, such as limiting relation fields or adding deeper relation population.

If the component has no relation fields, do nothing for this step.

### 4. Create React component

Create `apps/ui/src/components/page-builder/components/{category}/Strapi{PascalCaseName}.tsx`:

```tsx
import { Data } from "@repo/strapi-types"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"

export function Strapi{PascalCaseName}({
  component,
}: {
  readonly component: Data.Component<"{category}.{name}">
}) {
  removeThisWhenYouNeedMe("Strapi{PascalCaseName}")

  return (
    <section>
      <Container className="py-8">
        <h2 className="mb-4 text-3xl font-bold">{component.title}</h2>
        {/* TODO: Implement component UI */}
      </Container>
    </section>
  )
}

Strapi{PascalCaseName}.displayName = "Strapi{PascalCaseName}"

export default Strapi{PascalCaseName}
```

Key patterns:

- Named export + default export
- Props typed with `Data.Component<"{category}.{name}">` from `@repo/strapi-types`
- `removeThisWhenYouNeedMe` call — starter template placeholder, keep it for new components
- `displayName` set explicitly
- Wrap content in `<Container>` from `@/components/elementary/Container`, if it's not a root level component, or not explicit "container" component wrapping other components.
- Follow the repository Code Style Guide

### 5. Register in PageContentComponents

Edit `apps/ui/src/components/page-builder/index.tsx`:

1. Add import at top (alphabetical within category group):

```typescript
import Strapi{PascalCaseName} from "@/components/page-builder/components/{category}/Strapi{PascalCaseName}"
```

2. Add mapping entry in `PageContentComponents` under the matching category comment:

```typescript
"{category}.{name}": Strapi{PascalCaseName},
```

### 6. Generate types

Run:

```bash
cd apps/strapi && pnpm generate:types
```

This updates `@repo/strapi-types` so the React component gets proper typing for `Data.Component<"{category}.{name}">`.

## Path Resilience

If expected paths are not found, search for existing similar files before reporting an error.
Example: glob for `**/page-builder/**/Strapi*.tsx` to find component location.

### Mocking & Showcase (updated)

After you add a Strapi component and its frontend React implementation, add a mocked wrapper so the component is visible in the dev Showcase.

The workflow is simplified: mocked files should export a single default component and should not use `ManualSection` / `ManualItem` wrappers — the Showcase reads `showcaseItems.tsx` and renders the component directly.

1. Create a mocked file
   - Path: `apps/ui/src/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapi{PascalName}.tsx`
   - Export default `MockedStrapi{PascalName}` which renders the production `Strapi{PascalName}` with a `data` object typed as `Data.Component<"{category}.{name}">`.

   Example:

```tsx
import type { Data } from "@repo/strapi-types"
import StrapiMyComponent from "@/components/page-builder/components/sections/StrapiMyComponent"

const data = {
  id: 1,
  __component: "sections.my-component",
  /* attributes */
} as unknown as Data.Component<"sections.my-component">

export default function MockedStrapiMyComponent() {
  return <StrapiMyComponent component={data} />
}
```

2. Register in `showcaseItems.tsx`
   - Import the mocked file:

     `import MockedStrapiMyComponent from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiMyComponent"`

   - Add an entry to the `showcaseItems` array with `kind: "component"`, `component: MockedStrapiMyComponent`, `id`, `label` and `description`.

3. Attribute tips
   - Use HTML strings for `richtext` fields.
   - For images/icons reuse `mockImage` / `mockIcon` from the dev showcase helpers.
   - Keep mock objects minimal but representative.

See `/docs/showcase.md` for full examples and conventions.

## See also

- `apps/docs/docs/page-builder/introduction.md` — architecture overview, naming conventions, component props
