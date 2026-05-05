import { readFileSync } from "node:fs"

// @ts-expect-error - Import from monorepo
import colorConfig from "@repo/design-system/tiptap-color-config.json"

export function tipTapEditorConfig() {
  return {
    enabled: true,
    config: {
      presets: {
        everything: {
          bold: true,
          italic: true,
          strike: true,
          mediaLibrary: true,
          textColor: true,
          highlightColor: true,
          underline: true,
          code: true,
          codeBlock: true,
          blockquote: true,
          bulletList: true,
          orderedList: true,
          history: true,
          heading: { levels: [1, 2, 3, 4, 5, 6] },
          link: true,
          table: { resizable: true },
          textAlign: {
            types: ["heading", "paragraph"],
            alignments: ["left", "center", "right", "justify"],
          },
          superscript: true,
          subscript: true,
        },
        minimal: {
          bold: true,
          italic: true,
          link: true,
        },
        baseText: {
          bold: true,
          italic: true,
          link: true,
          bulletList: true,
          orderedList: true,
        },
        headings: {
          bold: true,
          italic: true,
          heading: { levels: [1, 2, 3, 4] },
        },
      },
      theme: {
        colors: colorConfig,

        css: readFileSync(
          require.resolve("@repo/design-system/tiptap-theme.css"),
          "utf8"
        ),
      },
    },
  }
}
