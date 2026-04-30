import { normalizePageFullPath } from "@repo/shared-data"

type RevalidateParams = {
  uid: string
  fullPaths?: string[]
  locale?: string
  tags?: string[]
}

export default () => ({
  async run({ uid, fullPaths = [], locale, tags = [] }: RevalidateParams) {
    const clientUrl = process.env.CLIENT_URL
    const secret = process.env.STRAPI_REVALIDATE_SECRET

    if (!clientUrl || !secret) {
      throw new Error(
        "Revalidation configuration missing. Ensure CLIENT_URL and STRAPI_REVALIDATE_SECRET are set."
      )
    }

    const normalizedFullPaths = [
      ...new Set(
        fullPaths
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
          .map((path) => normalizePageFullPath([path], locale))
      ),
    ]

    const normalizedTags = tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const deduplicatedTags = [
      ...new Set([
        `strapi:${uid}`,
        // ...normalizedFullPaths.map((path) => `strapi:${uid}:${path}`),
        ...normalizedTags,
      ]),
    ]

    const payload = {
      uid,
      secret,
      tags: deduplicatedTags,
      fullPaths:
        normalizedFullPaths.length > 0 ? normalizedFullPaths : undefined,
    }

    const response = await fetch(`${clientUrl}/api/strapi-revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const message = await response.text()
      strapi.log.error(
        `[revalidate.run] Revalidation request failed (${response.status}) for "${uid}" "${payload.fullPaths?.join(",") ?? "-"}": ${message}`
      )
      throw new Error("Failed to revalidate frontend cache.")
    }

    return response.json()
  },
})
