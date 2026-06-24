---
sidebar_position: 5
---

# Tiptap Editor

[`@notum-cz/strapi-plugin-tiptap-editor`](https://github.com/notum-cz/strapi-plugin-tiptap-editor) provides structured rich text editing based on [Tiptap](https://tiptap.dev/) and [ProseMirror](https://prosemirror.net/) JSON.

The UI renders the stored JSON through [`@tiptap/static-renderer`](https://tiptap.dev/docs/editor/api/utilities/static-renderer), which gives more control over nodes and marks than raw HTML.

:::warning
Plugin still in early stages. Stable for basic use; report issues to [strapi-plugin-tiptap-editor](https://github.com/notum-cz/strapi-plugin-tiptap-editor/issues).
:::

## Component

Strapi component: `utilities.tip-tap-rich-text`.

## Presets

Presets are configured in `apps/strapi/config/plugins/tiptap.ts`.

| Preset       | Description                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `everything` | All extensions: headings, color, highlight, images, tables, alignment, lists, code, sub/super. |
| `baseText`   | Bold, italic, links, lists. Paragraph content.                                                 |
| `headings`   | Bold, italic, heading only. Useful for heading components with SEO tags.                       |
| `minimal`    | Bold, italic, links only.                                                                      |

Assign a preset per field via `options.preset` in the component schema.

## Design Tokens

Colors and theme CSS come from `@repo/design-system/tiptap-color-config.json` and `tiptap-theme.css`, so the editor palette stays in sync with the UI design system. See [`@repo/design-system`](../../reference/packages/design-system.md).

For editor presets, shared styles, and renderer decisions, see [Rich Text Editors](/docs/design-system/rich-text-editors).

## UI Rendering

```tsx
import { TiptapRichText } from "@/components/elementary/tiptap-editor"

return (
  <TiptapRichText
    content={component.content}
    defaultVariant="medium" // typography variant for text nodes
    defaultWeight="normal" // font weight for text nodes
  />
```

The renderer supports bold, italic, underline, strike, text color, highlight, headings, links, images, blockquotes, lists, tables, code blocks, sub/superscript, and text alignment.

Typography variants used by TipTap rendering should stay aligned with [Typography](/docs/design-system/typography).
