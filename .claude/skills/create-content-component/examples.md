# Examples — create-content-component

Concrete attribute and populate shapes. SKILL.md is the routing surface; `workflow.md` is the per-phase procedure; this file is the copy-paste reference.

## Attribute patterns

```json
// Plain text
{ "type": "string" }
{ "type": "text" }       // multiline
{ "type": "richtext" }   // avoid — use a rich-text customField, see "Rich text" below

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

## Admin icon (`info.icon`)

Optional but recommended — the icon shown for the component in the admin builder. Pick a representative name from [`references/strapi-icons.txt`](references/strapi-icons.txt) (e.g. `discuss` for testimonials, `cube` for a feature grid, `bell` for a banner) and use the exact string. Vary icons across components.

## Rich text (CKEditor or TipTap)

Two rich-text editors are configured — both are `customField`s. **Never use Strapi's raw `richtext`.** When you just need a rich-text block, reuse an existing `utilities.*` component rather than redeclaring the field.

| Editor   | `customField`                    | presets                                         | reusable component                                         | stored as        | renderer                                                   |
| -------- | -------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- | ---------------- | ---------------------------------------------------------- |
| CKEditor | `plugin::ckeditor5.CKEditor`     | `defaultCkEditor` (full), `simpleCkEditor`      | `utilities.ck-editor-content` / `utilities.ck-editor-text` | HTML             | `CKEditorRenderer` (`@/components/elementary/ck-editor`)   |
| TipTap   | `plugin::tiptap-editor.RichText` | `everything`, `baseText`, `headings`, `minimal` | `utilities.tip-tap-rich-text`                              | ProseMirror JSON | `TiptapRichText` (`@/components/elementary/tiptap-editor`) |

Declare an inline customField only when rich text is one field of a larger component:

```json
// CKEditor
{ "type": "customField", "customField": "plugin::ckeditor5.CKEditor", "options": { "preset": "defaultCkEditor" } }

// TipTap
{ "type": "customField", "customField": "plugin::tiptap-editor.RichText", "options": { "preset": "everything" } }
```

Render with the matching renderer above, passing `component.<field>`. CKEditor is the most common in shipped sections (e.g. `sections/hero.json`); choose TipTap when you need its structured nodes/marks. Editor choice, presets, and renderer guidance: `apps/docs/docs/design-system/rich-text-editors.md` (also `strapi/plugins/ckeditor.md`, `strapi/plugins/tiptap-editor.md`).

## Population

Nested components, media, and relations are populated automatically by the smart-populate plugin (`content: "smart"` in the page fetch). New sections need no populate code.

Override only when a relation needs specific fields/depth — add an entry to `populateOverrides` in `apps/strapi/config/plugins/smart-populate.ts`:

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

Full details: `apps/docs/docs/strapi/plugins/smart-populate.md`.

## Worked example — `sections.testimonials`

Schema (`apps/strapi/src/components/sections/testimonials.json`):

```json
{
  "collectionName": "components_sections_testimonials",
  "info": {
    "displayName": "Testimonials",
    "icon": "discuss"
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

Population: none needed — `content: "smart"` auto-populates `items` and its nested `avatar` media from the schema.

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
