import { typoClassNone } from "./headings"

// biome-ignore lint/suspicious/noExplicitAny: Ck editor (@_sh/strapi-plugin-ckeditor) does not have types for editor itself
export function StyleChangePlugin(editor: any) {
  return {
    init() {
      const processElement = (el: Element) => {
        const typoClasses = Array.from(el.classList).filter((c) =>
          c.startsWith("typo-")
        )

        if (typoClasses.length > 1) {
          const lastTypoClass = typoClasses[typoClasses.length - 1]

          // Remove all other typo-* classes
          for (const cls of typoClasses) {
            if (cls !== lastTypoClass || lastTypoClass === typoClassNone) {
              el.classList.remove(cls)
            }
          }
        }
      }

      const styleCommand = editor.commands.get("style")
      if (styleCommand) {
        styleCommand.on("execute", () => {
          // Get the current editor content as HTML
          const html = editor.getData()

          // Parse HTML to find elements with classes starting with "typo-"
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, "text/html")

          const elements = Array.from(doc.querySelectorAll("[class]")).filter(
            (el) => Array.from(el.classList).some((c) => c.startsWith("typo-"))
          )

          for (const el of elements) {
            processElement(el)
          }

          // Optionally, update the editor content with the modified HTML
          editor.setData(doc.body.innerHTML)
        })
      }
    },
  }
}
