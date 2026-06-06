---
sidebar_position: 4
---

# CKEditor

[`@_sh/strapi-plugin-ckeditor`](https://www.npmjs.com/package/@_sh/strapi-plugin-ckeditor) provides HTML-based rich text editing through [CKEditor](https://ckeditor.com/docs/ckeditor5/latest/).

Content is stored as HTML and rendered in the UI via `dangerouslySetInnerHTML` with link processing and sanitization.

For editor choice, shared rich text styles, presets, and frontend renderer guidance, see [Rich Text Editors](/docs/design-system/rich-text-editors).

## Components

Strapi components:

- `utilities.ck-editor-content`
- `utilities.ck-editor-text`

They use different toolbars, but share the same rendering approach.

## UI Rendering

```tsx
import CkEditorRenderer from "@/components/elementary/ck-editor"

return (
  <CkEditorRenderer
    htmlContent={component.content}
    className="mx-auto w-full max-w-[1296px] px-4 py-8"
    variant="page"
  />
)
```

`variant` can be `"page"` or `"blog"`.

Custom CKEditor plugins and heading styles live in `apps/strapi/src/admin/ckeditor`. Typography variant guidance lives in [Typography](/docs/design-system/typography).
