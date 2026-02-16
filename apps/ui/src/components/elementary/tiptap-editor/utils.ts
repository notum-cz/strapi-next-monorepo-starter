export function textAlignClassName(
  alignment: "left" | "center" | "right" | "justify" | null | undefined
) {
  switch (alignment) {
    case "left":
      return "text-left"
    case "center":
      return "text-center"
    case "right":
      return "text-right"
    case "justify":
      return "text-justify"

    default:
      return ""
  }
}
