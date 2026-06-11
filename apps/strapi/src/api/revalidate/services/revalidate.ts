import {
  revalidateNextCache,
  type RevalidateNextCacheParams,
  type RevalidationResponse,
} from "./next-cache"

export default () => ({
  /**
   * Calls `revalidateNextCache`. Used by the document middleware on
   * publish/update, by hierarchy jobs after fullPath recalculation, and by
   * the admin "Revalidate cache" button.
   */
  async run(params: RevalidateNextCacheParams): Promise<RevalidationResponse> {
    return revalidateNextCache(params)
  },
})
