export const typoClassNone = "typo-none"
// Keep label in sync with typography styles on Frontend
const styleVariants = [
  { label: "Default", class: typoClassNone },
  { label: "Heading 1", class: "typo-h1" },
  { label: "Heading 2", class: "typo-h2" },
  { label: "Heading 3", class: "typo-h3" },
  { label: "Heading 4", class: "typo-h4" },
  { label: "Heading 5", class: "typo-h5" },
  { label: "Heading 6", class: "typo-h6" },
  { label: "Paragraph Small", class: "typo-p-small" },
  { label: "Paragraph Medium", class: "typo-p-medium" },
  { label: "Paragraph Large", class: "typo-p-large" },
] as const

// These are the HTML elements we want to support and models are for CKEditor internal use
const supportedTags = [
  {
    model: "heading1",
    view: "h1",
    title: "Heading 1",
  },
  {
    model: "heading2",
    view: "h2",
    title: "Heading 2",
  },
  {
    model: "heading3",
    view: "h3",
    title: "Heading 3",
  },
  {
    model: "heading4",
    view: "h4",
    title: "Heading 4",
  },
  {
    model: "heading5",
    view: "h5",
    title: "Heading 5",
  },
  {
    model: "heading6",
    view: "h6",
    title: "Heading 6",
  },
  {
    model: "paragraph",
    view: "p",
    title: "Paragraph",
  },
] as const

export const getStyleDefinitions = () => {
  return (
    supportedTags.flatMap((element) =>
      styleVariants.map((v) => ({
        name: `${v.label} (${element.view})`,
        element: element.view,
        classes: [v.class],
      }))
    ) ?? []
  )
}

export const getHeadingOptions = () => {
  return (
    supportedTags.map((element) => ({
      model: element.model,
      view: element.view,
      title: element.title,
      class: `ck-heading_${element.model}`,
    })) ?? []
  )
}
