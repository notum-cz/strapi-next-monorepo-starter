import Heading from "@tiptap/extension-heading"
import Image from "@tiptap/extension-image"
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
}).configure({ levels: [1, 2, 3, 4, 5, 6] })

export const StrapiImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-asset-id": { default: null },
      "data-align": { default: null },
    }
  },
})
