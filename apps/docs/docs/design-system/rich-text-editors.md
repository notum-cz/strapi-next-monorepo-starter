---
sidebar_position: 6
---

# Rich Text Editors

The template supports CKEditor and TipTap. Pick the editor strategy at project start, because the choice affects CMS schemas, editor presets, frontend rendering, and how much formatting control content editors get.

For design tokens, generated package exports, and build output, see [Tokens And Global Styles](/docs/design-system/tokens-and-global-styles).

:::tip Select Only One Rich Text Editor
Do not let both editors become active content-authoring paths unless the project explicitly needs both. Maintaining two rich text models increases schema, rendering, and QA work.
:::

Relevant files:

- `packages/design-system/src/custom-styles.css`
- `packages/design-system/src/build-ck-config.js`
- `packages/design-system/src/build-tiptap-config.js`
- `apps/strapi/config/plugins.ts`
- `apps/strapi/config/plugins/tiptap.ts`
- `apps/strapi/src/admin/ckeditor/configs.ts`
- `apps/strapi/src/admin/ckeditor/headings.ts`
- `apps/strapi/src/admin/app.tsx`
- `apps/ui/src/components/page-builder/components/utilities/StrapiCkEditorContent.tsx`
- `apps/ui/src/components/page-builder/components/utilities/StrapiTipTapEditorContent.tsx`

## Editor Choice

### CKEditor

CKEditor is a good fit when editor familiarity matters, when the project already uses CKEditor, or when the content team expects a more traditional WYSIWYG editing experience.

In this template, CKEditor:

- Uses generated color and font-size config from `@repo/design-system`.
- Renders on the frontend through `CKEditorRenderer` and `StrapiCkEditorContent`.
- Aims for closer Strapi admin preview parity with frontend rendering.

### TipTap

TipTap is a good fit when the project needs stricter editor presets, structured editor behavior, or tighter control over available formatting tools.

In this template, TipTap:

- Uses generated color config and theme CSS from `@repo/design-system`.
- Renders on the frontend through `TiptapRichText` and `StrapiTipTapEditorContent`.
- Works best as a structured content editor with frontend rendering handled separately.

:::info Preview Expectations
CKEditor is configured closer to WYSIWYG preview behavior. TipTap should be treated more as structured content input unless the project invests in matching preview styles.
:::

## Shared Styles

Shared rich text styles live in:

```text
packages/design-system/src/custom-styles.css
```

This file contains the shared styling contract for:

- CKEditor content.
- TipTap content wrappers.
- Typography classes such as `.typo-h1` and `.typo-p-medium`.
- List and media behavior.
- Selected Strapi editor overrides.

Keep typography class names consistent with [Typography](/docs/design-system/typography). The same `.typo-*` classes should work in frontend components, frontend-rendered rich text, and editor previews.

## CKEditor Config

Generated CKEditor config comes from:

```text
packages/design-system/src/build-ck-config.js
```

It provides color options, font-size options, and serialized Strapi editor CSS. The generated exports are listed in [Tokens And Global Styles](/docs/design-system/tokens-and-global-styles#build-outputs).

:::caution Font Sizes In CKEditor
CKEditor font-size options need concrete values in the generated config. Responsive typography tokens can still exist in CSS, but the editor dropdown cannot represent them as responsive values.
:::

### CKEditor Presets

Presets let different Strapi fields expose different editing tools. They are defined in:

```text
apps/strapi/src/admin/ckeditor/configs.ts
```

They are registered in:

```text
apps/strapi/src/admin/app.tsx
```

Use focused presets:

- A heading field might only allow heading selection, bold text, and color.
- A short description field might allow links, bullet lists, and basic inline formatting.
- A full rich text field might allow lists, tables, embeds, media, and more advanced formatting.

The goal is to give editors the tools needed for the field, not a full page editor everywhere.

## TipTap Config

Generated TipTap config comes from:

```text
packages/design-system/src/build-tiptap-config.js
```

The outputs are imported by the Strapi TipTap plugin config:

```text
apps/strapi/config/plugins/tiptap.ts
```

Use TipTap presets to limit editor freedom. Current examples include:

- `everything`
- `minimal`
- `baseText`
- `headings`

:::tip Keep Presets Narrow
Editors should get the formatting options they need for the field, not every available formatting option by default.
:::

## Frontend Renderers

CKEditor content is rendered through:

```text
apps/ui/src/components/page-builder/components/utilities/StrapiCkEditorContent.tsx
```

TipTap content is rendered through:

```text
apps/ui/src/components/page-builder/components/utilities/StrapiTipTapEditorContent.tsx
```

When creating or changing rich text fields, decide:

- Should the component include a container?
- Should text color come from the CMS or from the section wrapper?
- Should spacing be controlled inside the rich text component or by the page-builder layout?
- Which typography variants are allowed?
- Which heading levels editors can use?

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

:::caution Decide Before Content Entry
Changing allowed headings, presets, or renderers after content is already entered usually creates cleanup work in Strapi content and frontend rendering.
:::
