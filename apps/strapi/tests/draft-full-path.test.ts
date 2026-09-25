import { describe, expect, it, vi } from "vitest"

import { registerDraftFullPath } from "../src/documentMiddlewares/draftFullPath"

type Doc = Record<string, unknown> | null

const buildMiddleware = ({
  published = null,
  draft = null,
}: {
  published?: Doc
  draft?: Doc
}) => {
  const useMock = vi.fn()
  const findOne = vi.fn(async ({ status }: { status: string }) =>
    status === "published" ? published : draft
  )
  const updateMock = vi.fn()
  const whereNull = vi.fn(() => ({ update: updateMock }))
  const where = vi.fn(() => ({ whereNull }))
  const connection = vi.fn(() => ({ where }))

  registerDraftFullPath({
    strapi: {
      documents: Object.assign(
        vi.fn(() => ({ findOne })),
        { use: useMock }
      ),
      db: { connection },
    } as never,
  })

  return {
    middleware: useMock.mock.calls[0]?.[0] as (
      context: Record<string, unknown>,
      next: () => Promise<unknown>
    ) => Promise<unknown>,
    findOne,
    connection,
    where,
    updateMock,
  }
}

const pageContext = { uid: "api::page.page", action: "create" }

describe("draft fullPath middleware", () => {
  it("stamps /<slug> on a new root page", async () => {
    const { middleware, connection, where, updateMock } = buildMiddleware({
      draft: { slug: "about", parent: null },
    })
    const result = { documentId: "doc1", locale: "en" }

    await expect(middleware(pageContext, async () => result)).resolves.toBe(
      result
    )

    expect(connection).toHaveBeenCalledWith("pages")
    expect(where).toHaveBeenCalledWith({ document_id: "doc1", locale: "en" })
    expect(updateMock).toHaveBeenCalledWith({ full_path: "/about" })
    expect(result).toMatchObject({ fullPath: "/about" })
  })

  it("stamps <parent fullPath>/<slug> on a child page", async () => {
    const { middleware, updateMock } = buildMiddleware({
      draft: { slug: "team", parent: { fullPath: "/about" } },
    })
    const result = { documentId: "doc2", locale: "en" }

    await middleware({ ...pageContext, action: "update" }, async () => result)

    expect(updateMock).toHaveBeenCalledWith({ full_path: "/about/team" })
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
