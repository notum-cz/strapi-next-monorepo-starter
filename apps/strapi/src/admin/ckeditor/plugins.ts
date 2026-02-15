import { typoClassNone } from "./headings"

const processElement = (el: Element) => {
  const typoClasses = Array.from(el.classList).filter((c) =>
    c.startsWith("typo-")
  )

  if (typoClasses.length > 1) {
    const lastTypoClass = typoClasses.at(-1)

    // Remove all other typo-* classes
    for (const cls of typoClasses) {
      if (cls !== lastTypoClass || lastTypoClass === typoClassNone) {
        el.classList.remove(cls)
      }
    }
  }
}

const hasTypoClass = (el: Element) =>
  Array.from(el.classList).some((c) => c.startsWith("typo-"))

const getTypoElements = (doc: Document) =>
  Array.from(doc.querySelectorAll("[class]")).filter(hasTypoClass)

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- CKEditor (@_sh/strapi-plugin-ckeditor) does not have types for editor itself
export function StyleChangePlugin(editor: any) {
  return {
    init() {
      const styleCommand = editor.commands.get("style")
      if (styleCommand) {
        styleCommand.on("execute", () => {
          const html = editor.getData()
          const doc = new DOMParser().parseFromString(html, "text/html")

          for (const el of getTypoElements(doc)) {
            processElement(el)
          }

          editor.setData(doc.body.innerHTML)
        })
      }
    },
  }
}
