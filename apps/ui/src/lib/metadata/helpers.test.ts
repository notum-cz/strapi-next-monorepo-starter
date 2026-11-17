import { describe, expect, it, vi } from "vitest"

// Keep the real routing and createPublicFullPath; only stub what can't load in node.
vi.mock("next-intl/navigation", () => ({
  createNavigation: () => ({}),
}))
vi.mock("@/lib/env-vars", () => ({
  getEnvVar: (name: string) =>
    name === "APP_PUBLIC_URL" ? "https://example.com" : undefined,
}))

import type { StrapiLocalization } from "@/types/api"

import { getMetaAlternates } from "./helpers"

const BASE = "https://example.com"

const localization = (
  locale: StrapiLocalization["locale"],
  fullPath: string
): StrapiLocalization => ({ id: 1, documentId: "doc", locale, fullPath })

const bothLocales = [localization("cs", "/about"), localization("en", "/about")]

describe("getMetaAlternates", () => {
  it("does not prefix the default-locale homepage", () => {
    expect(
      getMetaAlternates({
        fullPath: "/",
        locale: "en",
        localizations: [localization("cs", "/")],
      })
    ).toEqual({
      canonical: BASE,
      languages: { cs: `${BASE}/cs`, en: BASE, "x-default": BASE },
    })
  })

  it("does not prefix default-locale subpages", () => {
    expect(
      getMetaAlternates({
        fullPath: "/about",
        locale: "en",
        localizations: bothLocales,
      })
    ).toEqual({
      canonical: `${BASE}/about`,
      languages: {
        cs: `${BASE}/cs/about`,
        en: `${BASE}/about`,
        "x-default": `${BASE}/about`,
      },
    })
  })

  it("prefixes non-default locales", () => {
    expect(
      getMetaAlternates({
        fullPath: "/about",
        locale: "cs",
        localizations: bothLocales,
      })
    ).toEqual({
      canonical: `${BASE}/cs/about`,
      languages: {
        cs: `${BASE}/cs/about`,
        en: `${BASE}/about`,
        "x-default": `${BASE}/about`,
      },
    })
  })

  it("adds a self-referencing hreflang for non-default locales", () => {
    expect(
      getMetaAlternates({
        fullPath: "/about",
        locale: "cs",
        localizations: [localization("en", "/about")],
      })?.languages
    ).toEqual({
      cs: `${BASE}/cs/about`,
      en: `${BASE}/about`,
      "x-default": `${BASE}/about`,
    })
  })

  it("uses each version's own path when slugs are translated", () => {
    expect(
      getMetaAlternates({
        fullPath: "/o-nas",
        locale: "cs",
        localizations: [localization("en", "/about")],
      })?.languages
    ).toEqual({
      cs: `${BASE}/cs/o-nas`,
      en: `${BASE}/about`,
      "x-default": `${BASE}/about`,
    })
  })

  it("omits x-default when there is no default-locale version", () => {
    expect(
      getMetaAlternates({ fullPath: "/o-nas", locale: "cs" })?.languages
    ).toEqual({ cs: `${BASE}/cs/o-nas` })
  })

  it("skips localizations without a path or with an unsupported locale", () => {
    expect(
      getMetaAlternates({
        fullPath: "/about",
        locale: "en",
        localizations: [
          localization("cs", ""),
          { ...localization("en", "/about"), locale: "de" as never },
        ],
      })?.languages
    ).toEqual({ en: `${BASE}/about`, "x-default": `${BASE}/about` })
  })

  it("returns nothing for routes without a CMS page", () => {
    expect(getMetaAlternates({ fullPath: null, locale: "en" })).toBeUndefined()
  })
})
