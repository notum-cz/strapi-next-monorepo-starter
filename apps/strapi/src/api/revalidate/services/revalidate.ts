import {
  revalidateNextCache,
  type RevalidateNextCacheParams,
  type RevalidationResponse,
} from "./next-cache"
import { withSpan } from "../../../utils/logging"

export default () => ({
  /**
   * Calls `revalidateNextCache` inside a tracing span. Used by the document
   * middleware on publish/update, by hierarchy jobs after fullPath
   * recalculation, and by the admin "Revalidate cache" button.
   */
  async run(params: RevalidateNextCacheParams): Promise<RevalidationResponse> {
    return withSpan(
      "strapi.revalidate.run",
      () => revalidateNextCache(params),
      {
        "strapi.uid": params.uid,
        "strapi.locale": params.locale,
        "strapi.fullPathCount": params.fullPaths?.length ?? 0,
        "strapi.tagCount": params.tags?.length ?? 0,
      }
    )
  },
})
