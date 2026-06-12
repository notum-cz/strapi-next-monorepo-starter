import { beforeEach, describe, expect, it, vi } from "vitest"

import serviceFactory from "../src/api/hierarchy/services/hierarchy"
import type { FullPathChange } from "../src/utils/hierarchy/types"

const CHANGES: FullPathChange[] = [
  {
    documentId: "parent",
    locale: "en",
    slug: "page-b",
    oldFullPath: "/page-a",
    newFullPath: "/page-b",
    redirect: { source: "/en/page-a", destination: "/en/page-b" },
  },
  {
    documentId: "child",
    locale: "en",
    slug: "page-child",
    oldFullPath: "/page-a/page-child",
    newFullPath: "/page-b/page-child",
    redirect: {
      source: "/en/page-a/page-child",
      destination: "/en/page-b/page-child",
    },
  },
  {
    documentId: "new-page",
    locale: "cs",
    slug: "nova",
    oldFullPath: null,
    newFullPath: "/nova",
    redirect: null,
  },
]

const buildService = ({
  pageUpdate = vi.fn().mockResolvedValue({}),
  redirectCreate = vi.fn().mockResolvedValue({}),
  revalidateRun = vi.fn().mockResolvedValue({}),
  hierarchyFindFirst = vi.fn().mockResolvedValue({ documentId: "h1" }),
  pageFindMany = vi.fn().mockResolvedValue([]),
} = {}) => {
  const hierarchyDocuments = {
    findFirst: hierarchyFindFirst,
    update: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
  }

  const strapiMock = {
    documents: vi.fn((uid: string) => {
      if (uid === "api::page.page") {
        return { update: pageUpdate, findMany: pageFindMany }
      }
      if (uid === "api::redirect.redirect") {
        return { create: redirectCreate }
      }

      return hierarchyDocuments
    }),
    service: vi.fn(() => ({ run: revalidateRun })),
    plugin: vi.fn(() => ({
      service: vi.fn(() => ({
        find: vi.fn(async () => [{ code: "en" }, { code: "cs" }]),
      })),
    })),
    log: { info: vi.fn(), error: vi.fn() },
    // `factories.createCoreService` builds a base service from
    // `strapi.contentType(uid)` before merging our methods, so the mock must
    // provide it.
    contentType: vi.fn(() => ({ uid: "api::hierarchy.hierarchy" })),
  }

  vi.stubGlobal("strapi", strapiMock as never)

  const factory = serviceFactory as unknown as (args: {
    strapi: unknown
  }) => Record<string, (...a: unknown[]) => Promise<unknown>>

  const service = factory({ strapi: strapiMock })

  return {
    service,
    pageUpdate,
    redirectCreate,
    revalidateRun,
    hierarchyDocuments,
    pageFindMany,
  }
}

describe("hierarchy applyPendingChanges", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it("updates fullPaths as system writes and creates published redirects", async () => {
    const { service, pageUpdate, redirectCreate } = buildService()
    vi.spyOn(service, "getPendingChanges").mockResolvedValue(CHANGES as never)

    const result = (await service.applyPendingChanges()) as {
      applied: FullPathChange[]
      failed: { change: FullPathChange; error: string }[]
    }

    expect(pageUpdate).toHaveBeenCalledWith({
      documentId: "parent",
      locale: "en",
      data: { fullPath: "/page-b", updatedBy: null },
      status: "published",
    })
    expect(redirectCreate).toHaveBeenCalledWith({
      data: { source: "/en/page-a", destination: "/en/page-b" },
      status: "published",
    })
    // no redirect for the newly published page
    expect(redirectCreate).toHaveBeenCalledTimes(2)
    expect(result.applied).toHaveLength(3)
    expect(result.failed).toHaveLength(0)
  })

  it("continues after a failed change and reports it", async () => {
    const pageUpdate = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue({})
    const { service, redirectCreate } = buildService({ pageUpdate })
    vi.spyOn(service, "getPendingChanges").mockResolvedValue(CHANGES as never)

    const result = (await service.applyPendingChanges()) as {
      applied: FullPathChange[]
      failed: { change: FullPathChange; error: string }[]
    }

    expect(result.failed).toEqual([{ change: CHANGES[0], error: "boom" }])
    expect(result.applied).toHaveLength(2)
    // the failed change's redirect is not created
    expect(redirectCreate).toHaveBeenCalledTimes(1)
  })

  it("stamps lastRecalculationAt on the single type", async () => {
    const { service, hierarchyDocuments } = buildService()
    vi.spyOn(service, "getPendingChanges").mockResolvedValue(CHANGES as never)

    await service.applyPendingChanges()

    expect(hierarchyDocuments.update).toHaveBeenCalledWith({
      documentId: "h1",
      data: { lastRecalculationAt: expect.any(String) },
    })
  })

  it("creates the single type entry when it does not exist yet", async () => {
    const { service, hierarchyDocuments } = buildService({
      hierarchyFindFirst: vi.fn().mockResolvedValue(null),
    })
    vi.spyOn(service, "getPendingChanges").mockResolvedValue(CHANGES as never)

    await service.applyPendingChanges()

    expect(hierarchyDocuments.create).toHaveBeenCalledWith({
      data: { lastRecalculationAt: expect.any(String) },
    })
  })

  it("computes pending changes from published pages of every locale", async () => {
    const pageFindMany = vi.fn(async ({ locale }: { locale: string }) =>
      locale === "en"
        ? [
            { documentId: "root", slug: "/", fullPath: "/", parent: null },
            {
              documentId: "p",
              slug: "page-b",
              fullPath: "/page-a",
              parent: { documentId: "root" },
            },
          ]
        : []
    )
    const { service } = buildService({ pageFindMany })

    const changes = (await service.getPendingChanges()) as FullPathChange[]

    expect(changes).toEqual([
      {
        documentId: "p",
        locale: "en",
        slug: "page-b",
        oldFullPath: "/page-a",
        newFullPath: "/page-b",
        redirect: { source: "/en/page-a", destination: "/en/page-b" },
      },
    ])
    expect(pageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ status: "published", locale: "en" })
    )
    expect(pageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ status: "published", locale: "cs" })
    )
  })
})
