import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/navigation", () => ({
  routing: {
    locales: ["cs", "en"],
    defaultLocale: "en",
  },
}))

import type { StrapiLocalization } from "@/types/api"

import { getMetaAlternates } from "./helpers"

const localization = (
  locale: StrapiLocalization["locale"],
  fullPath: string
): StrapiLocalization => ({ id: 1, documentId: "doc", locale, fullPath })

const bothLocales = [localization("cs", "/about"), localization("en", "/about")]

describe("getMetaAlternates", () => {
  it("does not prefix the default-locale homepage", () => {
    expect(
      getMetaAlternates({
        seo: null,
        fullPath: "/",
        locale: "en",
        localizations: [localization("cs", "/")],
      })
    ).toEqual({
      canonical: "/",
      languages: { cs: "/cs", en: "/", "x-default": "/" },
    })
  })

  it("does not prefix default-locale subpages", () => {
    expect(
      getMetaAlternates({
        seo: null,
        fullPath: "/about",
        locale: "en",
        localizations: bothLocales,
      })
    ).toEqual({
      canonical: "/about",
      languages: { cs: "/cs/about", en: "/about", "x-default": "/about" },
    })
  })

  it("prefixes non-default locales", () => {
    expect(
      getMetaAlternates({
        seo: null,
        fullPath: "/about",
        locale: "cs",
        localizations: bothLocales,
      })
    ).toEqual({
      canonical: "/cs/about",
      languages: { cs: "/cs/about", en: "/about", "x-default": "/about" },
    })
  })

  it("adds a self-referencing hreflang for non-default locales", () => {
    expect(
      getMetaAlternates({
        seo: null,
        fullPath: "/about",
        locale: "cs",
        localizations: [localization("en", "/about")],
      }).languages
    ).toEqual({ cs: "/cs/about", en: "/about", "x-default": "/about" })
  })

  it("strips an explicit default-locale prefix from a CMS canonical URL", () => {
    expect(
      getMetaAlternates({
        seo: { canonicalUrl: "/en/landing" } as never,
        fullPath: "/about",
        locale: "en",
      })
    ).toEqual({ canonical: "/landing", languages: undefined })
  })

  it("treats paths that merely start with the locale code as unprefixed", () => {
    expect(
      getMetaAlternates({ seo: null, fullPath: "/english", locale: "en" })
        .canonical
    ).toBe("/english")
  })

  it("uses each version's own path when slugs are translated", () => {
    expect(
      getMetaAlternates({
        seo: null,
        fullPath: "/o-nas",
        locale: "cs",
        localizations: [localization("en", "/about")],
      }).languages
    ).toEqual({ cs: "/cs/o-nas", en: "/about", "x-default": "/about" })
  })

  it("applies other locales to a default-locale-prefixed CMS override", () => {
    expect(
      getMetaAlternates({
        seo: { canonicalUrl: "/en/landing" } as never,
        fullPath: "/o-nas",
        locale: "cs",
        localizations: [localization("en", "/about")],
      })
    ).toEqual({
      canonical: "/cs/landing",
      languages: { cs: "/cs/landing", en: "/landing", "x-default": "/landing" },
    })
  })

  it("lets a CMS canonical override drive every locale", () => {
    expect(
      getMetaAlternates({
        seo: { canonicalUrl: "/landing" } as never,
        fullPath: "/about",
        locale: "en",
        localizations: [localization("cs", "/o-nas")],
      })
    ).toEqual({
      canonical: "/landing",
      languages: { cs: "/cs/landing", en: "/landing", "x-default": "/landing" },
    })
  })
})
