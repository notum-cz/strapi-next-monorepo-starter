// List of document types that are part of the page hierarchy
// Includes all content types that have `parent`, `fullPath` and optionally `children` fields
// Usually, they are visitable in the frontend through their `fullPath` (URL)
export type HierarchicalDocumentType = "api::page.page"

export type CreateRedirectPayload = {
  oldPath: string
  newPath: string
}
