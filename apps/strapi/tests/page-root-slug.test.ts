import { ROOT_PAGE_PATH } from "@repo/shared-data"
import { beforeEach, describe, expect, it, vi } from "vitest"

import lifecycles from "../src/api/page/content-types/page/lifecycles"

type Row = Record<string, unknown> | undefined

// Builds a Knex-like chainable connection. The published-row lookup is the only
// query that calls `whereNotNull`, so the terminal `first()` uses that to decide
// which row to return (published row vs. the numeric-id -> documentId lookup).
const buildStrapi = ({
  publishedRow = undefined as Row,
  idLookupRow = undefined as Row,
} = {}) => {
  const connection = vi.fn(() => {
    let usedWhereNotNull = false
    const builder: Record<string, unknown> = {}
    const passthrough =
      (onCall: () => void = () => {}) =>
      () => {
        onCall()

        return builder
      }

    builder.select = passthrough()
    builder.where = passthrough()
    builder.whereNotNull = passthrough(() => {
      usedWhereNotNull = true
    })
    builder.first = vi.fn(async () =>
      usedWhereNotNull ? publishedRow : idLookupRow
    )

    return builder
  })

  vi.stubGlobal("strapi", { db: { connection } } as never)

  return { connection }
}

const DEFAULT_WHERE = { id: 7 }

const beforeUpdate = (data: unknown, where: unknown = DEFAULT_WHERE) =>
  (
    lifecycles as unknown as {
      beforeUpdate: (event: unknown) => Promise<void>
    }
  ).beforeUpdate({ params: { data, where } })

const beforeCreate = (data: unknown) =>
  (
    lifecycles as unknown as {
      beforeCreate: (event: unknown) => Promise<void>
    }
  ).beforeCreate({ params: { data } })

describe("page root-slug guard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it("blocks changing the root page slug on a draft save (beforeUpdate)", async () => {
    buildStrapi({
      publishedRow: { slug: ROOT_PAGE_PATH },
      idLookupRow: { document_id: "root-doc" },
    })

    await expect(beforeUpdate({ slug: "home", updatedBy: 1 })).rejects.toThrow(
      /reserved for the root page/
    )
  })

  it("blocks changing the root page slug on publish (beforeCreate)", async () => {
    buildStrapi({ publishedRow: { slug: ROOT_PAGE_PATH } })

    await expect(
      beforeCreate({ documentId: "root-doc", slug: "home", updatedBy: 1 })
    ).rejects.toThrow(/reserved for the root page/)
  })

  it("allows changing the slug of a non-root page", async () => {
    buildStrapi({
      publishedRow: { slug: "about" },
      idLookupRow: { document_id: "about-doc" },
    })

    await expect(
      beforeUpdate({ slug: "about-us", updatedBy: 1 })
    ).resolves.toBeUndefined()
  })

  it("allows keeping the root slug unchanged", async () => {
    buildStrapi({
      publishedRow: { slug: ROOT_PAGE_PATH },
      idLookupRow: { document_id: "root-doc" },
    })

    await expect(
      beforeUpdate({ slug: ROOT_PAGE_PATH, updatedBy: 1 })
    ).resolves.toBeUndefined()
  })

  it("skips system writes (updatedBy null) without touching the database", async () => {
    const { connection } = buildStrapi({
      publishedRow: { slug: ROOT_PAGE_PATH },
    })

    await expect(
      beforeUpdate({ slug: "home", updatedBy: null })
    ).resolves.toBeUndefined()
    expect(connection).not.toHaveBeenCalled()
  })

  it("skips writes that do not touch the slug", async () => {
    const { connection } = buildStrapi({
      publishedRow: { slug: ROOT_PAGE_PATH },
    })

    await expect(
      beforeUpdate({ fullPath: "/whatever", updatedBy: 1 })
    ).resolves.toBeUndefined()
    expect(connection).not.toHaveBeenCalled()
  })

  it("allows creating a brand-new page with no published version", async () => {
    buildStrapi({ publishedRow: undefined })

    await expect(
      beforeCreate({ documentId: "new-doc", slug: "home", updatedBy: 1 })
    ).resolves.toBeUndefined()
  })

  it("resolves the documentId from where.id when data omits it", async () => {
    const { connection } = buildStrapi({
      publishedRow: { slug: ROOT_PAGE_PATH },
      idLookupRow: { document_id: "root-doc" },
    })

    await expect(
      beforeUpdate({ slug: "home", updatedBy: 1 }, { id: 7 })
    ).rejects.toThrow(/reserved for the root page/)

    // One query resolves the documentId by numeric id, the second reads the
    // published row by document_id.
    expect(connection).toHaveBeenCalledTimes(2)
  })
})
