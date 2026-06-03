# Rich Text Editors

The template contains support for both CKEditor and TipTap. At project start, decide which editor the project should use and remove the unused path for that project.

Current relevant files:

- `packages/design-system/src/custom-styles.css`
- `packages/design-system/src/build-ck-config.js`
- `packages/design-system/src/build-tiptap-config.js`
- `apps/strapi/config/plugins.ts`
- `apps/strapi/config/plugins/tiptap.ts`
- `apps/ui/src/components/page-builder/components/utilities/StrapiCkEditorContent.tsx`
- `apps/ui/src/components/page-builder/components/utilities/StrapiTipTapEditorContent.tsx`

## Decide Early

Choose the editor before building content components. The choice affects:

- Strapi component schemas.
- Editor presets.
- Allowed formatting.
- Color configuration.
- Typography classes.
- Frontend renderer components.
- Editor experience for content teams.

Avoid letting both editors become active content-authoring paths unless the project explicitly needs both.

## CKEditor And TipTap Comparison

### CKEditor

CKEditor is a mature WYSIWYG editor with a broad plugin ecosystem. It is a good fit when the project already uses CKEditor, when editor familiarity matters, or when the content team expects a more traditional rich text editing experience.

In this template, CKEditor:

- Uses generated color and font-size config from `@repo/design-system`.
- Renders on the frontend through `CKEditorRenderer` and `StrapiCkEditorContent`.
- Is configured to make Strapi admin content look as close as possible to the frontend output, so editors get a more accurate WYSIWYG preview.
- Can require specific editor overrides to keep Strapi admin preview aligned with frontend rendering.

### TipTap

TipTap is based on ProseMirror and has a more configurable extension model. It is a good fit when the project needs stricter editor presets, structured editor behavior, or tighter control over which formatting tools are available.

In this template, TipTap:

- Uses generated color config and theme CSS from `@repo/design-system`.
- Renders on the frontend through `TiptapRichText` and `StrapiTipTapEditorContent`.
- Does not aim for the same full WYSIWYG parity in Strapi admin as CKEditor, treat it more as a structured content editor with frontend rendering handled separately.
- Depends heavily on clear presets, so editors do not get more formatting freedom than the project actually supports.

## Shared Editor Styles

Shared rich text and editor styles live in:

```text
packages/design-system/src/custom-styles.css
```

This file currently styles:

- CKEditor content.
- TipTap content wrappers.
- Heading classes such as `.typo-h1`.
- Paragraph variants such as `.typo-p-medium`.
- List and media behavior.
- Selected Strapi editor overrides.

Typography classes should behave consistently in:

- Frontend-rendered rich text.
- CKEditor content.
- TipTap content.
- Standard frontend typography components.

## CKEditor Config

CKEditor generated config is built by:

```text
packages/design-system/src/build-ck-config.js
```

The script reads compiled design-system CSS and generates:

- `ckeditor-color-config.json`
- `ckeditor-fontSize-config.json`
- `styles-strapi.json`

These are exported as:

- `@repo/design-system/ck-color-config.json`
- `@repo/design-system/ck-fontSize-config.json`
- `@repo/design-system/styles-strapi.json`

CKEditor font sizes must be concrete values in the generated config. Keep this in mind when using responsive typography tokens.

### CKEditor Presets

CKEditor supports multiple presets, so different fields can expose different editing options.

In this repository, presets are defined in:

```text
apps/strapi/src/admin/ckeditor/configs.ts
```

They are registered in:

```text
apps/strapi/src/admin/app.tsx
```

Current examples include:

- `simpleCkEditorConfig`
- `defaultCkEditorConfig`

Use presets to keep each field focused. For example:

- A heading field might only allow heading selection, bold text, and color.
- A short description field might allow links, bullet lists, and basic inline formatting.
- A full rich text field might allow lists, tables, embeds, media, and more advanced formatting.

The goal is to give editors the tools they need for that content field without making every field a full page editor.

## TipTap Config

TipTap generated config is built by:

```text
packages/design-system/src/build-tiptap-config.js
```

The script generates:

- `tiptap-color-config.json`
- `tiptap-theme.css`

These are imported by the Strapi TipTap plugin config:

```text
apps/strapi/config/plugins/tiptap.ts
```

Current presets include:

- `everything`
- `minimal`
- `baseText`
- `headings`

Use presets to limit editor freedom. Editors should get the formatting options they need, not every possible formatting option by default.

## Frontend Renderers

CKEditor content is rendered through:

```text
apps/ui/src/components/page-builder/components/utilities/StrapiCkEditorContent.tsx
```

TipTap content is rendered through:

```text
apps/ui/src/components/page-builder/components/utilities/StrapiTipTapEditorContent.tsx
```

When creating or changing rich text components, decide:

- Should the component include a container?
- Should text color come from the CMS or from the section wrapper?
- Should spacing be controlled inside the rich text component or by the page-builder layout?
- Which typography variants are allowed?
- Which heading levels editors can use?

For reusable projects, it can be useful to have both containerized and uncontained rich text variants, but only add them when there is a real use case.

## Rich Text Rules

Define these rules before content entry starts:

- Allowed heading levels.
- Default paragraph variant.
- Available text colors.
- Available font weights.
- Allowed alignment options.
- Link behavior.
- List styling.
- Image and media behavior.
- Whether tables are allowed.
- Whether embedded video is allowed.

The stricter and clearer this is at the beginning, the less cleanup is needed after content is entered.

## Checklist

Use the [Rich Text Editors checklist](../checklist.md#rich-text-editors) before starting or reviewing editor work.
