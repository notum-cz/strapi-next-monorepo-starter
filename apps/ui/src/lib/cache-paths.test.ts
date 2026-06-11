import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/navigation", () => ({
  routing: {
    defaultLocale: "en",
  },
}))

import { addDefaultLocalePathVariants } from "./cache-paths"

describe("cache path helpers", () => {
  it("adds default-locale variants for unprefixed page paths", () => {
    const paths = new Set<string>()

    addDefaultLocalePathVariants(paths, ["/about"])

    expect([...paths]).toEqual(["/en/about", "/about"])
  })

  it("adds unprefixed variants for default-locale-prefixed page paths", () => {
    const paths = new Set<string>()

    addDefaultLocalePathVariants(paths, ["/en/about"])

    expect([...paths]).toEqual(["/en/about", "/about"])
  })

  it("handles the default-locale root path", () => {
    const paths = new Set<string>()

    addDefaultLocalePathVariants(paths, ["/en"])

    expect([...paths]).toEqual(["/en", "/"])
  })

  it("adds default-locale variants for wildcard paths", () => {
    const paths = new Set<string>()

    addDefaultLocalePathVariants(paths, ["/jobs/*"])

    expect([...paths]).toEqual(["/en/jobs/*", "/jobs/*"])
  })

  it("keeps full-site wildcard purges as a single path", () => {
    const paths = new Set<string>()

    addDefaultLocalePathVariants(paths, ["/*"])

    expect([...paths]).toEqual(["/*"])
  })
})
