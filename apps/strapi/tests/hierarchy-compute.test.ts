import { describe, expect, it } from "vitest"

import { computeFullPathChanges } from "../src/api/hierarchy/utils"
import type { HierarchyPageNode } from "../src/api/hierarchy/utils/types"

const page = (
  overrides: Partial<HierarchyPageNode> & { documentId: string; slug: string }
): HierarchyPageNode => ({
  locale: "en",
  fullPath: null,
  parentDocumentId: null,
  ...overrides,
})

describe("computeFullPathChanges", () => {
  it("returns no changes for a consistent tree", () => {
    const pages = [
      page({ documentId: "root", slug: "/", fullPath: "/" }),
      page({
        documentId: "about",
        slug: "about",
        fullPath: "/about",
        parentDocumentId: "root",
      }),
      page({
        documentId: "team",
        slug: "team",
        fullPath: "/about/team",
        parentDocumentId: "about",
      }),
    ]

    expect(computeFullPathChanges(pages)).toEqual([])
  })

  it("cascades a parent slug change to all descendants with locale-prefixed redirects", () => {
    // slug was changed from "page-a" to "page-b" but fullPaths still hold the old value
    const pages = [
      page({ documentId: "root", slug: "/", fullPath: "/" }),
      page({
        documentId: "parent",
        slug: "page-b",
        fullPath: "/page-a",
        parentDocumentId: "root",
      }),
      page({
        documentId: "child",
        slug: "page-child",
        fullPath: "/page-a/page-child",
        parentDocumentId: "parent",
      }),
    ]

    expect(computeFullPathChanges(pages)).toEqual([
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
    ])
  })

  it("collapses multiple unprocessed renames into a single redirect (a -> c)", () => {
    // slug went a -> b -> c without recalculation; stored fullPath is still /page-a
    const pages = [
      page({ documentId: "root", slug: "/", fullPath: "/" }),
      page({
        documentId: "p",
        slug: "page-c",
        fullPath: "/page-a",
        parentDocumentId: "root",
      }),
    ]

    const changes = computeFullPathChanges(pages)

    expect(changes).toHaveLength(1)
    expect(changes[0]?.redirect).toEqual({
      source: "/en/page-a",
      destination: "/en/page-c",
    })
  })

  it("emits no change when a rename was reverted before recalculation", () => {
    // slug went a -> b -> a; stored fullPath already matches
    const pages = [
      page({ documentId: "root", slug: "/", fullPath: "/" }),
      page({
        documentId: "p",
        slug: "page-a",
        fullPath: "/page-a",
        parentDocumentId: "root",
      }),
    ]

    expect(computeFullPathChanges(pages)).toEqual([])
  })

  it("emits a change without redirect for a new page (no fullPath yet)", () => {
    const pages = [
      page({ documentId: "root", slug: "/", fullPath: "/" }),
      page({ documentId: "new", slug: "fresh", parentDocumentId: "root" }),
    ]

    expect(computeFullPathChanges(pages)).toEqual([
      {
        documentId: "new",
        locale: "en",
        slug: "fresh",
        oldFullPath: null,
        newFullPath: "/fresh",
        redirect: null,
      },
    ])
  })

  it("prefixes redirects with the page locale", () => {
    const pages = [
      page({ documentId: "root", slug: "/", fullPath: "/", locale: "cs" }),
      page({
        documentId: "p",
        slug: "nova",
        fullPath: "/stara",
        parentDocumentId: "root",
        locale: "cs",
      }),
    ]

    expect(computeFullPathChanges(pages)[0]?.redirect).toEqual({
      source: "/cs/stara",
      destination: "/cs/nova",
    })
  })

  it("treats a missing (unpublished) parent like no parent", () => {
    const pages = [
      page({
        documentId: "orphan",
        slug: "orphan",
        fullPath: "/draft-parent/orphan",
        parentDocumentId: "not-published",
      }),
    ]

    expect(computeFullPathChanges(pages)[0]?.newFullPath).toBe("/orphan")
  })

  it("emits no redirect when the change is only path normalization", () => {
    const pages = [
      page({ documentId: "root", slug: "/", fullPath: "/" }),
      page({
        documentId: "p",
        slug: "page-a",
        fullPath: "/page-a/",
        parentDocumentId: "root",
      }),
    ]

    const changes = computeFullPathChanges(pages)

    expect(changes).toHaveLength(1)
    expect(changes[0]?.newFullPath).toBe("/page-a")
    expect(changes[0]?.redirect).toBeNull()
  })

  it("does not hang on a parent cycle", () => {
    const pages = [
      page({
        documentId: "a",
        slug: "a",
        fullPath: "/a",
        parentDocumentId: "b",
      }),
      page({
        documentId: "b",
        slug: "b",
        fullPath: "/b",
        parentDocumentId: "a",
      }),
    ]

    expect(Array.isArray(computeFullPathChanges(pages))).toBe(true)
  })
})
