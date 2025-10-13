import { Data } from "@strapi/strapi"
import { ROOT_PAGE_PATH } from "@repo/shared-data"

export const hierarchyService = {
  async RECALCULATE_FULLPATH({
    documentType,
    documentId,
  }: {
    documentType: "api::page.page" // Currently only "api::page.page" is supported
    documentId: string
  }) {
    const page = await strapi.documents(documentType).findOne({
      documentId,
      populate: ["parent", "children"],
    })

    if (!page) {
      return
    }

    const oldFullPath = page.fullPath
    const newFullPath = this.calculateFullPath(page)

    if (newFullPath !== oldFullPath) {
      await strapi.documents(documentType).update({
        documentId,
        data: { fullPath: newFullPath },
        status: "published",
      })

      if (oldFullPath) {
        await strapi
          .service("api::internal-job.internal-job")
          .enqueueJob("CREATE_REDIRECT", page.documentId, {
            oldPath: oldFullPath,
            newPath: newFullPath,
            documentId: page.documentId,
          })
      }

      for (const child of page.children ?? []) {
        await strapi
          .service("api::internal-job.internal-job")
          .enqueueJob("RECALCULATE_FULLPATH", child.documentId, {
            documentType,
            documentId: child.documentId,
          })
      }
    }
  },

  async CREATE_REDIRECT({ oldPath, newPath, documentId }) {
    await strapi.documents("api::redirect.redirect").create({
      data: {
        source: oldPath,
        destination: newPath,
        page: documentId,
        permanent: true,
      },
      status: "published",
    })
  },

  calculateFullPath(page: Data.ContentType<"api::page.page">) {
    if (page.parent?.fullPath) {
      return joinPaths(page.parent.fullPath, page.slug)
    }

    return page.slug
  },

  getJobTypes(): Partial<
    Data.ContentType<"api::internal-job.internal-job">["jobType"][]
  > {
    return ["RECALCULATE_FULLPATH", "CREATE_REDIRECT"] as const
  },
}

const joinPaths = (...paths: Array<string | undefined | null>) => {
  const joinedPath = paths
    .flatMap((path) => path.split("/"))
    .filter(Boolean)
    .join("/")

  return `${ROOT_PAGE_PATH}${joinedPath}`
}
