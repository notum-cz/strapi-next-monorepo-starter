import { normalizePageFullPath } from "@repo/shared-data"

import type { FullPathChange, HierarchyPageNode } from "./types"

/**
 * Computes which pages need a new fullPath by comparing the stored fullPath
 * with the one derived from the parent chain (parent fullPath + own slug).
 *
 * Pure function over one locale's published pages. Pages whose stored
 * fullPath already matches produce no change; pages without a previous
 * fullPath (newly published) produce a change without a redirect.
 */
export function computeFullPathChanges(
  pages: HierarchyPageNode[]
): FullPathChange[] {
  const pagesById = new Map(pages.map((page) => [page.documentId, page]))
  const expectedFullPaths = new Map<string, string>()

  const getExpectedFullPath = (
    page: HierarchyPageNode,
    visited: Set<string>
  ): string => {
    const cached = expectedFullPaths.get(page.documentId)
    if (cached != null) {
      return cached
    }

    const parent = page.parentDocumentId
      ? pagesById.get(page.parentDocumentId)
      : undefined

    let fullPath: string
    if (parent && !visited.has(parent.documentId)) {
      visited.add(parent.documentId)
      fullPath = normalizePageFullPath([
        getExpectedFullPath(parent, visited),
        page.slug,
      ])
    } else {
      // No parent (root page or orphan), parent not published, or a parent
      // cycle — fall back to the page's own slug, matching the previous
      // behavior when the `parent` relation did not populate.
      fullPath = normalizePageFullPath([page.slug])
    }

    expectedFullPaths.set(page.documentId, fullPath)

    return fullPath
  }

  const changes: FullPathChange[] = []

  for (const page of pages) {
    const newFullPath = getExpectedFullPath(page, new Set([page.documentId]))

    if (newFullPath === page.fullPath) {
      continue
    }

    let redirect: FullPathChange["redirect"] = null
    if (page.fullPath) {
      const source = normalizePageFullPath([page.fullPath], page.locale)
      const destination = normalizePageFullPath([newFullPath], page.locale)

      // A redirect pointing to itself (e.g. the stored fullPath only differed
      // in normalization) would be useless, so skip it.
      redirect = source === destination ? null : { source, destination }
    }

    changes.push({
      documentId: page.documentId,
      locale: page.locale,
      slug: page.slug,
      oldFullPath: page.fullPath ?? null,
      newFullPath,
      redirect,
    })
  }

  return changes
}
