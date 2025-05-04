import { Data } from "@strapi/strapi"
import { ROOT_PAGE_PATH } from "@repo/shared-data"

type Document = Data.ContentType<"api::page.page">

type DocumentType = "api::page.page"

type Breadcrumb = {
  title: string
  fullPath: string
}

export const generateBreadcrumbs = async (
  document: Document,
  type: DocumentType
) => {
  if (!document?.fullPath) {
    return []
  }

  // Get all parents based on the fullPath
  const allSegments = document.fullPath.split("/").filter(Boolean)
  // Ensure the first segment is the root page path
  allSegments.unshift(ROOT_PAGE_PATH)
  // Remove the last segment to get the parent segments
  const parents = allSegments.slice(0, -1)

  // Create a populate object based on the number of parents
  interface Populate {
    parent?: { populate: Populate } | true
  }

  const populate: Populate = {}
  let currentPopulate: Populate = populate

  parents.forEach((_, index) => {
    if (index === parents.length - 1) {
      // If it's the last parent, assign `true` to indicate the deepest level
      currentPopulate.parent = true
    } else {
      // Otherwise, keep nesting
      currentPopulate.parent = { populate: {} }
      // Move deeper into the next level
      currentPopulate = currentPopulate.parent.populate
    }
  })

  // Create Breadcrumbs data based on parents
  const breadcrumbs: Breadcrumb[] = [
    {
      title: document.breadcrumbTitle ?? document.title,
      fullPath: document.fullPath,
    },
  ]

  let hierarchy = await strapi.documents(type).findOne({
    documentId: document.documentId,
    populate,
    fields: ["breadcrumbTitle", "title", "fullPath"],
    locale: document.locale,
  })

  while (true) {
    // Pages have a `parent` field that points to the parent
    const parent = hierarchy?.parent ?? null

    if (!parent) {
      break
    }

    breadcrumbs.unshift({
      title: parent.breadcrumbTitle ?? parent.title,
      fullPath: parent.fullPath,
    })

    hierarchy = parent
  }

  return breadcrumbs
}

export const getFullPathFromQuery = (ctx: any) => {
  const query: Record<string, any> = ctx.request.query
  const fullPathFilter = query?.filters?.fullPath
  const fullPath = fullPathFilter ? fullPathFilter["$eq"] : null
  return fullPath
}
