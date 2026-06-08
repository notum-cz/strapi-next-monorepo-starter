import { beforeEach, describe, expect, it, vi } from "vitest"

import serviceFactory from "../src/api/internal-job/services/internal-job"

// Stub the hierarchy handlers so runAll's aggregation is what we test.
const { recalcMock, redirectMock } = vi.hoisted(() => ({
  recalcMock: vi.fn(),
  redirectMock: vi.fn(),
}))

vi.mock("../src/utils/hierarchy", () => ({
  processRecalculateFullPathJob: recalcMock,
  processCreateRedirectJob: redirectMock,
}))

const buildService = (
  runMock: ReturnType<typeof vi.fn>,
  jobs: { documentId: string; id: number; jobType: string }[] = [
    { documentId: "j1", id: 1, jobType: "RECALCULATE_FULLPATH" },
    { documentId: "j2", id: 2, jobType: "RECALCULATE_FULLPATH" },
  ]
) => {
  let index = 0

  const strapiMock = {
    documents: vi.fn(() => ({
      findFirst: vi.fn(async () => jobs[index] ?? null),
      delete: vi.fn(async () => {
        index += 1
      }),
      update: vi.fn(),
    })),
    service: vi.fn(() => ({ run: runMock })),
    log: { info: vi.fn(), error: vi.fn() },
    // `factories.createCoreService` builds a base service from
    // `strapi.contentType(uid)` before merging our methods, so the mock must
    // provide it.
    contentType: vi.fn(() => ({ uid: "api::internal-job.internal-job" })),
  }

  vi.stubGlobal("strapi", strapiMock as never)

  const factory = serviceFactory as unknown as (args: {
    strapi: unknown
  }) => Record<string, (...a: unknown[]) => Promise<unknown>>

  return factory({ strapi: strapiMock })
}

describe("internal-job runAll revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it("revalidates aggregated fullpaths after a RECALCULATE_FULLPATH batch", async () => {
    recalcMock
      .mockResolvedValueOnce({ fullPath: "/parent", locale: "en" })
      .mockResolvedValueOnce({ fullPath: "/parent/child", locale: "en" })
    const runMock = vi.fn().mockResolvedValue({})

    const service = buildService(runMock)
    await service.runAll("RECALCULATE_FULLPATH")

    expect(runMock).toHaveBeenCalledWith({
      uid: "api::page.page",
      locale: "en",
      fullPaths: ["/parent", "/parent/child"],
    })
  })

  it("revalidates once per locale when a batch touches multiple locales", async () => {
    recalcMock
      .mockResolvedValueOnce({ fullPath: "/a", locale: "en" })
      .mockResolvedValueOnce({ fullPath: "/b", locale: "cs" })
    const runMock = vi.fn().mockResolvedValue({})

    const service = buildService(runMock)
    await service.runAll("RECALCULATE_FULLPATH")

    expect(runMock).toHaveBeenCalledWith({
      uid: "api::page.page",
      locale: "en",
      fullPaths: ["/a"],
    })
    expect(runMock).toHaveBeenCalledWith({
      uid: "api::page.page",
      locale: "cs",
      fullPaths: ["/b"],
    })
  })

  it("revalidates aggregated redirect sources without a locale after a CREATE_REDIRECT batch", async () => {
    redirectMock.mockResolvedValue({ source: "/old" })
    const runMock = vi.fn().mockResolvedValue({})

    const service = buildService(runMock, [
      { documentId: "r1", id: 1, jobType: "CREATE_REDIRECT" },
    ])
    await service.runAll("CREATE_REDIRECT")

    expect(runMock).toHaveBeenCalledWith({
      uid: "api::redirect.redirect",
      fullPaths: ["/old"],
    })
  })

  it("does not throw when revalidation fails and still reports successful jobs", async () => {
    recalcMock
      .mockResolvedValueOnce({ fullPath: "/parent", locale: "en" })
      .mockResolvedValueOnce({ fullPath: "/parent/child", locale: "en" })
    const runMock = vi.fn().mockRejectedValue(new Error("boom"))

    const service = buildService(runMock)
    const result = (await service.runAll("RECALCULATE_FULLPATH")) as {
      successfulJobs: string[]
      failedJobs: string[]
    }

    expect(result.successfulJobs).toEqual(["j1", "j2"])
  })
})
