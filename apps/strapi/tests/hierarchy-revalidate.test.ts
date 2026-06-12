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

const buildService = (revalidateRun = vi.fn().mockResolvedValue({})) => {
  const strapiMock = {
    documents: vi.fn((uid: string) => {
      if (uid === "api::hierarchy.hierarchy") {
        return {
          findFirst: vi.fn().mockResolvedValue({ documentId: "h1" }),
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({}),
        }
      }

      return {
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([]),
      }
    }),
    service: vi.fn(() => ({ run: revalidateRun })),
    plugin: vi.fn(() => ({
      service: vi.fn(() => ({ find: vi.fn(async () => []) })),
    })),
    log: { info: vi.fn(), error: vi.fn() },
    contentType: vi.fn(() => ({ uid: "api::hierarchy.hierarchy" })),
  }

  vi.stubGlobal("strapi", strapiMock as never)

  const factory = serviceFactory as unknown as (args: {
    strapi: unknown
  }) => Record<string, (...a: unknown[]) => Promise<unknown>>

  const service = factory({ strapi: strapiMock })
  vi.spyOn(service, "getPendingChanges").mockResolvedValue(CHANGES as never)

  return { service, revalidateRun }
}

describe("hierarchy revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it("revalidates aggregated fullpaths once per locale", async () => {
    const { service, revalidateRun } = buildService()

    await service.applyPendingChanges()

    expect(revalidateRun).toHaveBeenCalledWith({
      uid: "api::page.page",
      locale: "en",
      fullPaths: ["/page-b", "/page-b/page-child"],
    })
    expect(revalidateRun).toHaveBeenCalledWith({
      uid: "api::page.page",
      locale: "cs",
      fullPaths: ["/nova"],
    })
  })

  it("revalidates redirect sources without a locale (already prefixed)", async () => {
    const { service, revalidateRun } = buildService()

    await service.applyPendingChanges()

    expect(revalidateRun).toHaveBeenCalledWith({
      uid: "api::redirect.redirect",
      fullPaths: ["/en/page-a", "/en/page-a/page-child"],
    })
  })

  it("does not throw when revalidation fails and still reports applied changes", async () => {
    const { service } = buildService(
      vi.fn().mockRejectedValue(new Error("boom"))
    )

    const result = (await service.applyPendingChanges()) as {
      applied: FullPathChange[]
    }

    expect(result.applied).toHaveLength(3)
  })
})
