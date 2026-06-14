import { beforeEach, describe, expect, it, vi } from "vitest"

import serviceFactory from "../src/api/hierarchy/services/hierarchy"
import type { FullPathChange } from "../src/api/hierarchy/utils/types"

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
  redirectFindMany = vi.fn().mockResolvedValue([]),
  redirectUpdate = vi.fn().mockResolvedValue({}),
  redirectDelete = vi.fn().mockResolvedValue({}),
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
        return {
          create: redirectCreate,
          findMany: redirectFindMany,
          update: redirectUpdate,
          delete: redirectDelete,
        }
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
    redirectFindMany,
    redirectUpdate,
    redirectDelete,
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

  it("still revalidates the new path when only the redirect creation fails", async () => {
    const redirectCreate = vi
      .fn()
      .mockRejectedValueOnce(new Error("redirect boom"))
      .mockResolvedValue({})
    const { service, revalidateRun } = buildService({ redirectCreate })
    vi.spyOn(service, "getPendingChanges").mockResolvedValue(CHANGES as never)

    const result = (await service.applyPendingChanges()) as {
      applied: FullPathChange[]
      failed: { change: FullPathChange; error: string }[]
    }

    expect(result.failed).toEqual([
      {
        change: CHANGES[0],
        error:
          "fullPath was updated but creating the redirect failed: redirect boom",
      },
    ])
    expect(result.applied).toHaveLength(2)
    // the successfully updated page is still revalidated
    expect(revalidateRun).toHaveBeenCalledWith({
      uid: "api::page.page",
      locale: "en",
      fullPaths: ["/page-b", "/page-b/page-child"],
    })
  })

  it("paginates through pages in batches of 500", async () => {
    const fullBatch = Array.from({ length: 500 }, (_, index) => ({
      documentId: `page-${index}`,
      slug: `slug-${index}`,
      fullPath: `/slug-${index}`,
      parent: null,
    }))
    const pageFindMany = vi
      .fn()
      .mockResolvedValueOnce(fullBatch)
      .mockResolvedValueOnce([])
    const { service } = buildService({ pageFindMany })

    const pages = (await service.listPublishedPages("en")) as unknown[]

    expect(pages).toHaveLength(500)
    expect(pageFindMany).toHaveBeenCalledTimes(2)
    expect(pageFindMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ start: 0, limit: 500 })
    )
    expect(pageFindMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ start: 500, limit: 500 })
    )
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

describe("hierarchy redirect compaction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it("collapses a redirect chain a -> b -> c into a -> c", async () => {
    // An existing `/en/a -> /en/b` record; the page is now moving b -> c.
    const redirectFindMany = vi.fn(
      async ({ filters }: { filters: Record<string, string> }) =>
        filters.destination === "/en/b"
          ? [{ documentId: "r-ab", source: "/en/a", destination: "/en/b" }]
          : []
    )
    const { service, redirectUpdate, redirectCreate, redirectDelete } =
      buildService({ redirectFindMany })

    const affected = (await service.upsertRedirectWithCompaction({
      source: "/en/b",
      destination: "/en/c",
    })) as string[]

    // The inbound `/en/a` record is repointed straight to the final path.
    expect(redirectUpdate).toHaveBeenCalledWith({
      documentId: "r-ab",
      data: { destination: "/en/c" },
      status: "published",
    })
    expect(redirectCreate).toHaveBeenCalledWith({
      data: { source: "/en/b", destination: "/en/c" },
      status: "published",
    })
    expect(redirectDelete).not.toHaveBeenCalled()
    expect(affected).toEqual(expect.arrayContaining(["/en/a", "/en/b"]))
  })

  it("removes a reverted redirect instead of creating a loop (a -> b -> a)", async () => {
    // An existing `/en/a -> /en/b` record; the page is reverting b -> a.
    const redirectFindMany = vi.fn(
      async ({ filters }: { filters: Record<string, string> }) =>
        filters.destination === "/en/b"
          ? [{ documentId: "r-ab", source: "/en/a", destination: "/en/b" }]
          : []
    )
    const { service, redirectDelete, redirectUpdate, redirectCreate } =
      buildService({ redirectFindMany })

    await service.upsertRedirectWithCompaction({
      source: "/en/b",
      destination: "/en/a",
    })

    // Repointing `/en/a` would yield `/en/a -> /en/a`, so it is dropped instead.
    expect(redirectDelete).toHaveBeenCalledWith({ documentId: "r-ab" })
    expect(redirectUpdate).not.toHaveBeenCalled()
    expect(redirectCreate).toHaveBeenCalledWith({
      data: { source: "/en/b", destination: "/en/a" },
      status: "published",
    })
  })

  it("revalidates repointed redirect sources, not just the new one", async () => {
    // Applying b -> c while `/en/a -> /en/b` already exists repoints the old
    // record to `/en/a -> /en/c`; both /en/a and /en/b must be revalidated.
    const redirectFindMany = vi.fn(
      async ({ filters }: { filters: Record<string, string> }) =>
        filters.destination === "/en/b"
          ? [{ documentId: "r-ab", source: "/en/a", destination: "/en/b" }]
          : []
    )
    const { service, revalidateRun } = buildService({ redirectFindMany })
    vi.spyOn(service, "getPendingChanges").mockResolvedValue([
      {
        documentId: "p",
        locale: "en",
        slug: "page-c",
        oldFullPath: "/page-b",
        newFullPath: "/page-c",
        redirect: { source: "/en/b", destination: "/en/c" },
      },
    ] as never)

    await service.applyPendingChanges()

    expect(revalidateRun).toHaveBeenCalledWith({
      uid: "api::redirect.redirect",
      fullPaths: expect.arrayContaining(["/en/a", "/en/b"]),
    })
  })

  it("updates a stale redirect reusing the same source instead of duplicating it", async () => {
    // `/en/a` already redirects somewhere; a page now claims `/en/a` as source.
    const redirectFindMany = vi.fn(
      async ({ filters }: { filters: Record<string, string> }) =>
        filters.source === "/en/a"
          ? [{ documentId: "r-ac", source: "/en/a", destination: "/en/c" }]
          : []
    )
    const { service, redirectUpdate, redirectCreate } = buildService({
      redirectFindMany,
    })

    await service.upsertRedirectWithCompaction({
      source: "/en/a",
      destination: "/en/d",
    })

    expect(redirectUpdate).toHaveBeenCalledWith({
      documentId: "r-ac",
      data: { destination: "/en/d" },
      status: "published",
    })
    expect(redirectCreate).not.toHaveBeenCalled()
  })
})
