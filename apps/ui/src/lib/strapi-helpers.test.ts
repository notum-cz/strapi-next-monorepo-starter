import { afterEach, describe, expect, it, vi } from "vitest"

import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"

vi.mock("@/lib/env-vars", () => ({
  getEnvVar: (name: string) =>
    name === "STRAPI_URL" ? "http://localhost:1337" : undefined,
}))

/**
 * The server renders media from STRAPI_URL while the browser has to infer the
 * origin. When those disagree — `localhost` on one side, `127.0.0.1` on the
 * other — every media element hydrates with a mismatched src and React bails
 * out of patching it. Nothing fails loudly, so pin both halves here.
 */
const setBrowser = (href: string) => {
  vi.stubGlobal("window", { location: new URL(href) })
}

describe("formatStrapiMediaUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("uses STRAPI_URL when rendering on the server", () => {
    expect(formatStrapiMediaUrl("/uploads/a.webp")).toBe(
      "http://localhost:1337/uploads/a.webp"
    )
  })

  it.each([
    ["http://localhost:3000/", "http://localhost:1337/uploads/a.webp"],
    ["http://127.0.0.1:3000/", "http://127.0.0.1:1337/uploads/a.webp"],
  ])("mirrors the browsing host on the client (%s)", (href, expected) => {
    setBrowser(href)
    expect(formatStrapiMediaUrl("/uploads/a.webp")).toBe(expected)
  })

  it("matches the server output when the UI host matches STRAPI_URL", () => {
    const server = formatStrapiMediaUrl("/uploads/a.webp")
    setBrowser("http://localhost:3000/")
    expect(formatStrapiMediaUrl("/uploads/a.webp")).toBe(server)
  })

  it("leaves absolute and non-upload URLs untouched", () => {
    setBrowser("http://localhost:3000/")
    expect(formatStrapiMediaUrl("https://cdn.example.com/a.webp")).toBe(
      "https://cdn.example.com/a.webp"
    )
    expect(formatStrapiMediaUrl("/other/a.webp")).toBe("/other/a.webp")
    expect(formatStrapiMediaUrl(null)).toBeUndefined()
  })

  it("returns the raw path in a deployed browser, where media should be absolute", () => {
    setBrowser("https://www.example.com/")
    expect(formatStrapiMediaUrl("/uploads/a.webp")).toBe("/uploads/a.webp")
  })
})
