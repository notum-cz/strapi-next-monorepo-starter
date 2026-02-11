import Heading from "@tiptap/extension-heading"
import { Mark } from "@tiptap/react"

export const OnlyCursive = Mark.create({
  name: "onlyCursive",
})

export const HeadingWithSEOTag = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      tag: { default: null },
    }
  },
}).configure({ levels: [1, 2, 3, 4] })
