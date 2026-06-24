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

import { computeFullPathChanges } from "../utils"
import type { FullPathChange, HierarchyPageNode } from "../utils/types"

const PAGE_BATCH_SIZE = 500

// Strapi core services are object factories where methods dispatch to each
// other via `this` (the merged service instance). That late binding is what
// lets the service be composed/overridden and lets tests spy on individual
// methods. `unicorn/no-this-outside-of-class` assumes `this` only belongs in
// classes, which does not fit this framework pattern.
/* eslint-disable unicorn/no-this-outside-of-class */
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
            const affectedSources = await this.upsertRedirectWithCompaction(
              change.redirect
            )
            for (const source of affectedSources) {
              redirectSources.add(source)
            }
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

    /**
     * Creates the `source -> destination` redirect while keeping the redirect
     * set free of chains and loops:
     *  - any existing redirect pointing TO `source` is repointed straight to
     *    `destination`, so a renamed-twice page (a -> b -> c) resolves in one
     *    hop (a -> c) instead of a chain,
     *  - a repointed record that would now point to its own source is deleted,
     *    which resolves reverts (a -> b -> a) and longer loops (a -> b -> c -> a)
     *    that would otherwise redirect endlessly,
     *  - a stale redirect already using `source` is updated in place instead of
     *    creating a duplicate record for the same source path.
     *
     * Returns every redirect source whose target changed so the caller can
     * revalidate them.
     */
    async upsertRedirectWithCompaction({
      source,
      destination,
    }: {
      source: string
      destination: string
    }): Promise<string[]> {
      const redirects = strapi.documents("api::redirect.redirect")
      const affectedSources = new Set<string>([source])

      // 1. Collapse chains leading into `source`: X -> source becomes X -> destination.
      const inbound = await redirects.findMany({
        filters: { destination: source },
        status: "published",
      })

      for (const record of inbound) {
        affectedSources.add(record.source)

        // Repointing a record whose source equals the new destination would
        // create a self-redirect (revert or loop), so drop it instead.
        await (record.source === destination
          ? redirects.delete({ documentId: record.documentId })
          : redirects.update({
              documentId: record.documentId,
              data: { destination },
              status: "published",
            }))
      }

      // 2. Upsert the `source -> destination` record itself, reusing any stale
      // record that already maps this source instead of duplicating it.
      const [existing, ...duplicates] = await redirects.findMany({
        filters: { source },
        status: "published",
      })

      if (existing) {
        await redirects.update({
          documentId: existing.documentId,
          data: { destination },
          status: "published",
        })

        for (const duplicate of duplicates) {
          await redirects.delete({ documentId: duplicate.documentId })
        }
      } else {
        await redirects.create({
          data: { source, destination },
          status: "published",
        })
      }

      return [...affectedSources]
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
      const now = new Date()
      const data = { lastRecalculationAt: now.toISOString() }

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
