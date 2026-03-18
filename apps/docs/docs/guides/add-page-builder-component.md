---
sidebar_position: 4
sidebar_label: "Add a page builder component"
---

# Add a page builder component

Add a Testimonials section that displays in the Strapi page builder and renders on the Next.js frontend.

## Step 1: Create the Strapi component schema

1. Create a new JSON file at `apps/strapi/src/components/sections/testimonials.json`:

   ```json title="apps/strapi/src/components/sections/testimonials.json"
   {
     "collectionName": "components_sections_testimonials",
     "info": {
       "displayName": "Testimonials",
       "description": ""
     },
     "options": {},
     "attributes": {
       "title": {
         "type": "string",
         "required": true
       },
       "items": {
         "type": "component",
         "repeatable": true,
         "component": "utilities.text"
       }
     }
   }
   ```

:::info Flat file path
Component schemas are flat `.json` files in the category folder -- **not** subdirectories. The correct path is `sections/testimonials.json`, not `sections/testimonials/schema.json`. Strapi will not find the schema if you use a subdirectory.
:::

Key details:

- **`collectionName`** follows the formula `components_{category}_{name}` -- here `components_sections_testimonials`.
- Nested components use `"type": "component"` with a `"component"` field pointing to the target UID (e.g., `"utilities.text"`).
- Common scalar types: `string`, `text`, `richtext`, `boolean`, `enumeration`.

See the [schema reference](../backend/schemas) for all available field types.

## Step 2: Register in the page dynamic zone

1. Open `apps/strapi/src/api/page/content-types/page/schema.json` and add `"sections.testimonials"` to the `attributes.content.components` array:

   ```json title="apps/strapi/src/api/page/content-types/page/schema.json (excerpt)"
   {
     "attributes": {
       "content": {
         "type": "dynamiczone",
         "components": [
           "sections.animated-logo-row",
           "sections.carousel",
           "sections.faq",
           "sections.heading-with-cta-button",
           "sections.hero",
           "sections.horizontal-images",
           "sections.image-with-cta-button",
           "forms.contact-form",
           "forms.newsletter-form",
           "utilities.ck-editor-content",
           "utilities.ck-editor-text",
           // highlight-next-line
           "sections.testimonials"
         ]
       }
     }
   }
   ```

   Append the new entry to the existing list. The order in this array does not affect rendering -- it only controls the order in the Strapi admin dropdown.

## Step 3: Add populate config

1. Create `apps/strapi/src/populateDynamicZone/sections/testimonials.ts`:

   ```ts title="apps/strapi/src/populateDynamicZone/sections/testimonials.ts"
   export default {
     populate: {
       items: true,
     },
   }
   ```

   Only populate relations and nested components -- scalar fields (strings, booleans) are included automatically. For media or deeply nested components, reuse existing populate configs from sibling files:

   ```ts title="Example with media and links (from hero.ts)"
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

2. No manual registration is needed. The `populateDynamicZone/index.ts` scanner discovers all `.ts` files in subdirectories automatically and maps `sections/testimonials.ts` to the UID `sections.testimonials`.

:::danger Missing populate config = silent null
If you skip this file, nested media and relations will return `null` in the API response. There is no error -- the data is simply missing. This is the most common pitfall when adding a new component.
:::

## Step 4: Create the React component

1. Create `apps/ui/src/components/page-builder/components/sections/StrapiTestimonials.tsx`:

   ```tsx title="apps/ui/src/components/page-builder/components/sections/StrapiTestimonials.tsx"
   import type { Data } from "@repo/strapi-types"

   import { Container } from "@/components/elementary/Container"
   import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

   export function StrapiTestimonials({
     component,
   }: {
     readonly component: Data.Component<"sections.testimonials">
   }) {
     removeThisWhenYouNeedMe("StrapiTestimonials")

     return (
       <section>
         <Container className="py-8">
           <h2 className="mb-4 text-3xl font-bold">{component.title}</h2>
         </Container>
       </section>
     )
   }

   StrapiTestimonials.displayName = "StrapiTestimonials"

   export default StrapiTestimonials
   ```

   Required patterns (following `StrapiHero.tsx`):
   - **Named export + default export** -- both are required. The named export is used for direct imports; the default export is used by the page builder registry.
   - **`Data.Component<"sections.testimonials">`** from `@repo/strapi-types` for type-safe props.
   - **`removeThisWhenYouNeedMe(...)`** -- starter placeholder that logs a reminder to implement the component. Remove it once you build out the real UI.
   - **`displayName`** set explicitly for React DevTools.
   - **`<Container>`** wraps section-level components for consistent max-width and padding.

See the [page builder architecture](../architecture/page-builder) for how components are resolved and rendered.

## Step 5: Register in PageContentComponents

1. Open `apps/ui/src/components/page-builder/index.tsx` and add the import alphabetically within the Sections group:

   ```ts title="apps/ui/src/components/page-builder/index.tsx"
   // highlight-next-line
   import StrapiTestimonials from "@/components/page-builder/components/sections/StrapiTestimonials"
   ```

2. Add the map entry under the `// Sections` comment:

   ```ts title="apps/ui/src/components/page-builder/index.tsx (excerpt)"
   export const PageContentComponents: Partial<
     Record<UID.Component, React.ComponentType<any>>
   > = {
     // Sections
     "sections.animated-logo-row": StrapiAnimatedLogoRow,
     "sections.faq": StrapiFaq,
     "sections.carousel": StrapiCarousel,
     "sections.heading-with-cta-button": StrapiHeadingWithCTAButton,
     "sections.hero": StrapiHero,
     "sections.horizontal-images": StrapiHorizontalImages,
     "sections.image-with-cta-button": StrapiImageWithCTAButton,
     // highlight-next-line
     "sections.testimonials": StrapiTestimonials,

     // Forms
     "forms.contact-form": StrapiContactForm,
     "forms.newsletter-form": StrapiNewsletterForm,
   }
   ```

   The page builder renders components by looking up their Strapi UID in this map. If the UID is missing, the component is silently skipped.

## Step 6: Generate types

1. Run the type generator from the Strapi app:

   ```bash
   cd apps/strapi && pnpm generate:types
   ```

   This regenerates `@repo/strapi-types` so that `Data.Component<"sections.testimonials">` resolves to the correct type. Without this step, TypeScript reports: `Type '"sections.testimonials"' does not satisfy the constraint`.

:::tip Anti-patterns to avoid

- **Don't create `sections/testimonials/schema.json`** -- use the flat path `sections/testimonials.json`. Strapi components are not API content types; they do not use subdirectories.
- **Don't forget the populate config** -- nested data will silently be `null` without it.
- **Don't skip `pnpm generate:types`** -- TypeScript cannot validate the component UID until types are regenerated.

:::
