/**
 * hierarchy service
 *
 * Computes and applies pending fullPath changes for the page hierarchy.
 * Replaces the legacy job queue: instead of recording jobs in
 * lifecycles, the pending changes are derived on demand by comparing each
 * published page's stored fullPath with the one calculated from its parent
 * chain. Applying a change updates the page's fullPath and creates the
 * matching redirect in one step.
 */

import { factories } from "@strapi/strapi"

import { PAGES_HIERARCHY_ENABLED } from "../../../utils/constants"
import { computeFullPathChanges } from "../utils"
import type { FullPathChange, HierarchyPageNode } from "../utils/types"

const PAGE_BATCH_SIZE = 500

export default factories.createCoreService(
  "api::hierarchy.hierarchy",
  ({ strapi }) => ({
    /**
     * Fetches all published pages of one locale as flat hierarchy nodes.
     */
    async listPublishedPages(locale: string): Promise<HierarchyPageNode[]> {
      const pages: HierarchyPageNode[] = []
      let start = 0
      let hasMore = true

      while (hasMore) {
        const batch = await strapi.documents("api::page.page").findMany({
          status: "published",
          locale,
          fields: ["slug", "fullPath"],
          populate: { parent: { fields: ["documentId"] } },
          start,
          limit: PAGE_BATCH_SIZE,
        })

        pages.push(
          ...batch.map((page) => ({
            documentId: page.documentId,
            locale,
            slug: page.slug,
            fullPath: page.fullPath ?? null,
            parentDocumentId: page.parent?.documentId ?? null,
          }))
        )

        hasMore = batch.length === PAGE_BATCH_SIZE
        start += PAGE_BATCH_SIZE
      }

      return pages
    },

    /**
     * Returns all fullPath changes that have not been applied yet,
     * across all locales.
     */
    async getPendingChanges(): Promise<FullPathChange[]> {
      if (!PAGES_HIERARCHY_ENABLED) {
        return []
      }

      const locales: { code: string }[] = await strapi
        .plugin("i18n")
        .service("locales")
        .find()

      const changes: FullPathChange[] = []

      for (const { code } of locales) {
        const pages = await this.listPublishedPages(code)
        changes.push(...computeFullPathChanges(pages))
      }

      return changes
    },

    /**
     * Applies all pending changes: updates each page's fullPath (as a system
     * write so lifecycles and the revalidate middleware skip it), creates a
     * published redirect from the old path, batch-revalidates the frontend
     * cache, and stamps `lastRecalculationAt`.
     */
    async applyPendingChanges(): Promise<{
      applied: FullPathChange[]
      failed: { change: FullPathChange; error: string }[]
    }> {
      const changes: FullPathChange[] = await this.getPendingChanges()

      const applied: FullPathChange[] = []
      const failed: { change: FullPathChange; error: string }[] = []

      // Aggregate touched paths so the frontend cache is revalidated once per
      // batch. FullPath writes use `updatedBy: null`, which the auto-revalidate
      // document middleware skips, so we revalidate here instead.
      const fullPathsByLocale = new Map<string, Set<string>>()
      const redirectSources = new Set<string>()

      for (const change of changes) {
        try {
          await strapi.documents("api::page.page").update({
            documentId: change.documentId,
            locale: change.locale,
            data: {
              fullPath: change.newFullPath,
              // `updatedBy: null` marks this as an automated/system change so
              // the page lifecycle and the revalidate middleware ignore it
              updatedBy: null,
            },
            status: "published",
          })
        } catch (error) {
          failed.push({ change, error: (error as Error).message })
          strapi.log.error(
            `Hierarchy: failed to apply change for ${change.documentId} (${change.locale}): ${(error as Error).message}`
          )
          continue
        }

        // The page is live under the new path from this point on — revalidate
        // it even if the redirect creation below fails.
        const localePaths =
          fullPathsByLocale.get(change.locale) ?? new Set<string>()
        localePaths.add(change.newFullPath)
        fullPathsByLocale.set(change.locale, localePaths)

        if (change.redirect) {
          try {
            await strapi.documents("api::redirect.redirect").create({
              data: {
                source: change.redirect.source,
                destination: change.redirect.destination,
              },
              status: "published",
            })
            redirectSources.add(change.redirect.source)
          } catch (error) {
            // The fullPath update already succeeded and pending changes are
            // derived from stored state, so a re-run won't recreate this
            // redirect — report it so it can be created manually.
            failed.push({
              change,
              error: `fullPath was updated but creating the redirect failed: ${(error as Error).message}`,
            })
            strapi.log.error(
              `Hierarchy: failed to create redirect ${change.redirect.source} -> ${change.redirect.destination}: ${(error as Error).message}`
            )
            continue
          }
        }

        applied.push(change)
        strapi.log.info(
          `Hierarchy: fullPath of ${change.documentId} (${change.locale}) updated to ${change.newFullPath}`
        )
      }

      // Revalidate each locale independently so a single failing path set
      // doesn't stop the rest of the revalidation pipeline.
      for (const [locale, paths] of fullPathsByLocale) {
        await this.revalidate({
          uid: "api::page.page",
          locale,
          fullPaths: [...paths],
        })
      }

      // Redirect sources are already locale-prefixed, so no `locale` here.
      if (redirectSources.size > 0) {
        await this.revalidate({
          uid: "api::redirect.redirect",
          fullPaths: [...redirectSources],
        })
      }

      // Stamped on every run (even a no-op one): it records when the
      // recalculation last ran, not when changes were last applied.
      await this.stampLastRecalculation()

      return { applied, failed }
    },

    async revalidate(params: {
      uid: string
      locale?: string
      fullPaths: string[]
    }) {
      try {
        await strapi.service("api::revalidate.revalidate").run(params)
      } catch (error) {
        const scope = params.locale ? ` for locale ${params.locale}` : ""
        strapi.log.error(
          `Revalidation after hierarchy recalculation failed${scope}: ${(error as Error).message}`
        )
      }
    },

    async stampLastRecalculation() {
      const data = { lastRecalculationAt: new Date().toISOString() }

      try {
        const existing = await strapi
          .documents("api::hierarchy.hierarchy")
          .findFirst()

        await (existing
          ? strapi.documents("api::hierarchy.hierarchy").update({
              documentId: existing.documentId,
              data,
            })
          : strapi.documents("api::hierarchy.hierarchy").create({ data }))
      } catch (error) {
        strapi.log.error(
          `Hierarchy: failed to stamp lastRecalculationAt: ${(error as Error).message}`
        )
      }
    },
  })
)
