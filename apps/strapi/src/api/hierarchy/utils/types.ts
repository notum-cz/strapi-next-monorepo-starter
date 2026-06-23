// Minimal page projection the hierarchy diff works on
export type HierarchyPageNode = {
  documentId: string
  locale: string
  slug: string
  fullPath: string | null
  parentDocumentId: string | null
}

export type FullPathChange = {
  documentId: string
  locale: string
  slug: string
  oldFullPath: string | null
  newFullPath: string
  redirect: null | { source: string; destination: string }
}
