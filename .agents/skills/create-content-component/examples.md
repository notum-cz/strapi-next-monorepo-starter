# Examples — create-content-component

Concrete attribute and populate shapes. SKILL.md is the routing surface; `workflow.md` is the per-phase procedure; this file is the copy-paste reference.

## Attribute patterns

```json
// Plain text
{ "type": "string" }
{ "type": "text" }       // multiline
{ "type": "richtext" }   // not preferred — see CKEditor below

// Required + length constraints
{ "type": "string", "required": true, "minLength": 1, "maxLength": 120 }

// Enum
{ "type": "enumeration", "enum": ["option1", "option2"], "default": "option1" }

// Boolean
{ "type": "boolean", "default": false }

// Number
{ "type": "integer", "min": 0, "max": 100 }
{ "type": "decimal" }

// Nested component (single)
{ "type": "component", "repeatable": false, "component": "utilities.link" }

// Repeatable component
{ "type": "component", "repeatable": true, "component": "utilities.basic-image" }

// Media (prefer wrapping in utility components)
// → utilities.basic-image, utilities.image-with-link

// Admin-only / API-hidden
{ "type": "string", "private": true }
```

Additional knobs: `description` (admin UI hint), `default`, `private`.

Reference: https://docs.strapi.io/cms/backend-customization/models#model-schema

## CKEditor rich text (editorial-copy default)

Starter convention — use this, **not** Strapi's built-in `richtext`:

```json
{
  "type": "customField",
  "customField": "plugin::ckeditor5.CKEditor",
  "options": { "preset": "defaultCkEditor" }
}
```

Working reference: `apps/strapi/src/components/sections/hero.json` — `description`, `tag`, `note` all use CKEditor.

## Populate-rule shapes

```ts
// Flat — no nested components
export default {
  populate: {
    image: true,
    cta: true,
  },
}
```

```ts
// One level of nested population
export default {
  populate: {
    items: {
      populate: { icon: true },
    },
  },
}
```

```ts
// Deeper nesting (media inside a nested component)
export default {
  populate: {
    cards: {
      populate: {
        image: { populate: { media: true } },
      },
    },
  },
}
```

```ts
// Reuse existing populate configs (preferred when a child component has its own file)
import basicImagePopulate from "../utilities/basic-image"
import linkPopulate from "../utilities/link"

export default {
  populate: {
    image: basicImagePopulate,
    cta: linkPopulate,
  },
}
```

Rules of thumb:

- `true` only for components/relations with no further nesting.
- Never populate scalar fields (`string`, `boolean`, `integer`, etc.).
- Reuse > redefine — if a nested component already has a populate file, `import` it.

## Worked example — `sections.testimonials`

Schema (`apps/strapi/src/components/sections/testimonials.json`):

```json
{
  "collectionName": "components_sections_testimonials",
  "info": {
    "displayName": "Testimonials"
  },
  "options": {},
  "attributes": {
    "title": { "type": "string", "required": true },
    "intro": {
      "type": "customField",
      "customField": "plugin::ckeditor5.CKEditor",
      "options": { "preset": "defaultCkEditor" }
    },
    "items": {
      "type": "component",
      "repeatable": true,
      "component": "utilities.testimonial-item"
    }
  }
}
```

Populate (`apps/strapi/src/populateDynamicZone/sections/testimonials.ts`):

```ts
import basicImagePopulate from "../utilities/basic-image"

export default {
  populate: {
    items: {
      populate: { avatar: basicImagePopulate },
    },
  },
}
```

Dynamic-zone registration (`apps/strapi/src/api/page/content-types/page/schema.json`):

```json
"content": {
  "type": "dynamiczone",
  "components": [
    "sections.hero",
    "sections.testimonials"
  ]
}
```
