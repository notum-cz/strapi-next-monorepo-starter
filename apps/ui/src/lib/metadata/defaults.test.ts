import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/navigation", () => ({
  createPublicFullPath: vi.fn(),
  isValidLocale: vi.fn(),
  routing: { defaultLocale: "en", locales: ["en"] },
}))

import { getDefaultMetadata } from "@/lib/metadata/defaults"
import { getMetaRobots } from "@/lib/metadata/helpers"

describe("default robots metadata", () => {
  const { robots } = getDefaultMetadata("https://example.com")

  it("lets production pages without page-level metaRobots be indexed", () => {
    expect(getMetaRobots(robots, false)).toEqual({ index: true, follow: true })
  })

  it("keeps non-production pages out of the index", () => {
    expect(getMetaRobots(robots, true)).toEqual({
      index: false,
      follow: false,
    })
  })
})
