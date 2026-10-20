import { describe, expect, it, vi } from "vitest"

import { registerDraftFullPath } from "../src/documentMiddlewares/draftFullPath"

type Doc = Record<string, unknown> | null

const buildMiddleware = ({
  published = null,
  draft = null,
  conflict = null,
}: {
  published?: Doc
  draft?: Doc
  conflict?: Doc
}) => {
  const useMock = vi.fn()
  const findOne = vi.fn(async ({ status }: { status: string }) =>
    status === "published" ? published : draft
  )
  const updateMock = vi.fn()
  const query = vi.fn(() => ({
    findOne: vi.fn(async () => conflict),
    updateMany: updateMock,
  }))
  const logError = vi.fn()

  registerDraftFullPath({
    strapi: {
      documents: Object.assign(
        vi.fn(() => ({ findOne })),
        { use: useMock }
      ),
      db: { query },
      log: { error: logError },
    } as never,
  })

  return {
    middleware: useMock.mock.calls[0]?.[0] as (
      context: Record<string, unknown>,
      next: () => Promise<unknown>
    ) => Promise<unknown>,
    findOne,
    query,
    updateMock,
    logError,
  }
}

const pageContext = { uid: "api::page.page", action: "create" }

describe("draft fullPath middleware", () => {
  it("stamps /<slug> on a new root page", async () => {
    const { middleware, query, updateMock } = buildMiddleware({
      draft: { slug: "about", parent: null },
    })
    const result = { documentId: "doc1", locale: "en" }

    await expect(middleware(pageContext, async () => result)).resolves.toBe(
      result
    )

    expect(query).toHaveBeenCalledWith("api::page.page")
    expect(updateMock).toHaveBeenCalledWith({
      where: { documentId: "doc1", locale: "en", publishedAt: null },
      data: { fullPath: "/about" },
    })
    expect(result).toMatchObject({ fullPath: "/about" })
  })

  it("stamps <parent fullPath>/<slug> on a child page", async () => {
    const { middleware, updateMock } = buildMiddleware({
      draft: { slug: "team", parent: { fullPath: "/about" } },
    })
    const result = { documentId: "doc2", locale: "en" }

    await middleware({ ...pageContext, action: "update" }, async () => result)

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: { fullPath: "/about/team" } })
    )
    expect(result).toMatchObject({ fullPath: "/about/team" })
  })

  it("leaves an already-published page untouched", async () => {
    const { middleware, findOne, updateMock } = buildMiddleware({
      published: { slug: "about", fullPath: "/about" },
      draft: { slug: "renamed", parent: null },
    })
    const result = { documentId: "doc3", locale: "en", fullPath: "/about" }

    await middleware({ ...pageContext, action: "update" }, async () => result)

    expect(findOne).toHaveBeenCalledTimes(1)
    expect(updateMock).not.toHaveBeenCalled()
    expect(result.fullPath).toBe("/about")
  })

  it("skips a draft without a slug", async () => {
    const { middleware, updateMock } = buildMiddleware({
      draft: { slug: null, parent: null },
    })

    await middleware(pageContext, async () => ({ documentId: "doc4" }))

    expect(updateMock).not.toHaveBeenCalled()
  })

  it("skips when the fullPath is unchanged", async () => {
    const { middleware, updateMock } = buildMiddleware({
      draft: { slug: "about", fullPath: "/about", parent: null },
    })

    await middleware(pageContext, async () => ({ documentId: "doc5" }))

    expect(updateMock).not.toHaveBeenCalled()
  })

  it("skips when another page already uses the fullPath", async () => {
    const { middleware, updateMock } = buildMiddleware({
      draft: { slug: "about", parent: null },
      conflict: { id: 99 },
    })
    const result = { documentId: "doc6", locale: "en" }

    await middleware(pageContext, async () => result)

    expect(updateMock).not.toHaveBeenCalled()
    expect(result).not.toHaveProperty("fullPath")
  })

  it("returns the save result and logs when stamping fails", async () => {
    const { middleware, findOne, logError } = buildMiddleware({})
    findOne.mockRejectedValueOnce(new Error("db down"))
    const result = { documentId: "doc7", locale: "en" }

    await expect(middleware(pageContext, async () => result)).resolves.toBe(
      result
    )
    expect(logError).toHaveBeenCalledWith(expect.stringContaining("db down"))
  })

  it("passes non-page UIDs through", async () => {
    const { middleware, findOne } = buildMiddleware({})
    const result = { documentId: "nav" }

    await expect(
      middleware(
        { uid: "api::navbar.navbar", action: "update" },
        async () => result
      )
    ).resolves.toBe(result)

    expect(findOne).not.toHaveBeenCalled()
  })
})
