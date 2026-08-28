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

## Images

Images come from the Strapi Media Library and are enabled per preset via `mediaLibrary`. Only the `everything` preset enables it; `minimal`, `baseText`, and `headings` have no image support.

Resizing is off by default. Enable it in `apps/strapi/config/plugins/tiptap.ts`:

```ts
mediaLibrary: { resize: { enabled: true } },
```

This adds a drag handle on the image plus width/height inputs and a reset button in the image popover.

| Option                             | Default | Description                            |
| ---------------------------------- | ------- | -------------------------------------- |
| `resize.enabled`                   | `false` | Enables resizing or editing dimensions |
| `resize.minWidth`                  | `50`    | Minimum allowed width in pixels        |
| `resize.minHeight`                 | `50`    | Minimum allowed height in pixels       |
| `resize.alwaysPreserveAspectRatio` | `true`  | Locks the aspect ratio while resizing  |

### Persisted attributes

The editor stores these attributes on the ProseMirror `image` node:

| Attribute       | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| `src`           | Media Library URL, resolved through `formatStrapiMediaUrl` in UI |
| `width`         | Pixel width set by resizing, `null` when untouched               |
| `height`        | Pixel height set by resizing, `null` when untouched              |
| `alt`           | Alt text, editable in the image popover                          |
| `data-align`    | `left`, `center`, `right`, or `null`                             |
| `data-asset-id` | Media Library asset ID                                           |

`data-align` and `data-asset-id` are non-standard, and `@tiptap/static-renderer` drops attributes the extension does not declare. The UI therefore extends the image extension as `StrapiImage` in `apps/ui/src/components/elementary/tiptap-editor/extensions.tsx` to declare both.

:::note
The frontend deliberately does **not** pass `resize` to its image extension. In `@tiptap/extension-image`, `width` and `height` are declared unconditionally in `addAttributes()`, and `resize` only gates `addNodeView()` — which `@tiptap/static-renderer` never calls. Passing it would be dead config.
:::

Rendering lives in the `image` node mapping in `apps/ui/src/components/elementary/tiptap-editor/index.tsx`. It emits a full-width `<figure>` with `mx-auto`/`ml-auto` on the `<img>` handling alignment, and `h-auto max-w-full` so an image wider than the container scales down without distorting.

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
