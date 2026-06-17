import { beforeEach, describe, expect, it, vi } from "vitest"

const { fetchManyMock } = vi.hoisted(() => ({
  fetchManyMock: vi.fn(),
}))

vi.mock("@/lib/strapi-api/content/server", () => ({
  fetchRedirects: fetchManyMock,
}))

// The logger pulls in env validation at import; stub it to keep the suite hermetic.
vi.mock("@/lib/logging", () => ({
  logger: {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
  logError: vi.fn(),
  withSpan: vi.fn(),
}))

import {
  buildRedirectDestinationUrl,
  clearRedirectCache,
  findRedirectForPath,
} from "./redirects"

describe("redirect helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    clearRedirectCache()
    fetchManyMock.mockResolvedValue([])
  })

  it("preserves the current query string when destination has none", () => {
    const destination = buildRedirectDestinationUrl(
      new URL("https://www.test/en/old-page?utm=test"),
      "/en/new-page"
    )

    expect(destination?.href).toBe("https://www.test/en/new-page?utm=test")
  })

  it("removes the default locale prefix from internal destinations", () => {
    const destination = buildRedirectDestinationUrl(
      new URL("https://www.test/contact-us"),
      "/en/contact-usxxxxxx",
      "en"
    )

    expect(destination?.href).toBe("https://www.test/contact-usxxxxxx")
  })

  it("uses the destination query string when one is configured", () => {
    const destination = buildRedirectDestinationUrl(
      new URL("https://www.test/en/old-page?utm=test"),
      "/en/new-page?from=strapi"
    )

    expect(destination?.href).toBe("https://www.test/en/new-page?from=strapi")
  })

  it("returns null for malformed destination URLs instead of throwing", () => {
    // Note: most garbage strings ("not a url", "ht!tp://x") resolve as
    // relative paths against the origin; only these shapes actually throw.
    for (const malformed of ["https://", "http://exa mple.com/page", "//"]) {
      const destination = buildRedirectDestinationUrl(
        new URL("https://www.test/old-page"),
        malformed
      )

      expect(destination).toBeNull()
    }
  })

  it("rejects external destinations", () => {
    const destination = buildRedirectDestinationUrl(
      new URL("https://www.test/en/old-page?utm=test"),
      "https://evil.com/new-page"
    )

    expect(destination).toBeNull()
  })

  it("finds redirects from the cached redirect list", async () => {
    fetchManyMock.mockResolvedValue([
      {
        source: "/en/old-page",
        destination: "/en/new-page",
      },
    ])

    const redirect = await findRedirectForPath("/old-page", "en")

    expect(redirect).toMatchObject({
      source: "/en/old-page",
      destination: "/en/new-page",
    })
    expect(fetchManyMock).toHaveBeenCalledTimes(1)
  })

  it("matches sources stored with editor slips (whitespace, missing or trailing slash)", async () => {
    fetchManyMock.mockResolvedValue([
      { source: "en/old-page", destination: "/en/new-page" },
      { source: " /en/other-page/ ", destination: "/en/other-destination" },
    ])

    await expect(findRedirectForPath("/old-page", "en")).resolves.toMatchObject(
      {
        destination: "/en/new-page",
      }
    )
    await expect(
      findRedirectForPath("/other-page", "en")
    ).resolves.toMatchObject({
      destination: "/en/other-destination",
    })
  })

  it("reuses the cached redirect list", async () => {
    fetchManyMock.mockResolvedValue([
      {
        source: "/en/old-page",
        destination: "/en/new-page",
      },
    ])

    await findRedirectForPath("/old-page", "en")
    await findRedirectForPath("/missing-page", "en")

    expect(fetchManyMock).toHaveBeenCalledTimes(1)
  })

  it("serves stale redirects while refreshing expired cache", async () => {
    let resolveRefresh: (
      redirects: { source: string; destination: string }[]
    ) => void

    vi.useFakeTimers()
    vi.setSystemTime(0)

    fetchManyMock
      .mockResolvedValueOnce([
        {
          source: "/en/old-page",
          destination: "/en/old-destination",
        },
      ])
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveRefresh = resolve
        })
      )

    await expect(findRedirectForPath("/old-page", "en")).resolves.toMatchObject(
      {
        destination: "/en/old-destination",
      }
    )

    vi.setSystemTime(5 * 60 * 1000 + 1)

    await expect(findRedirectForPath("/old-page", "en")).resolves.toMatchObject(
      {
        destination: "/en/old-destination",
      }
    )
    expect(fetchManyMock).toHaveBeenCalledTimes(2)

    resolveRefresh!([
      {
        source: "/en/new-page",
        destination: "/en/new-destination",
      },
    ])
    await Promise.resolve()
    await Promise.resolve()

    await expect(findRedirectForPath("/new-page", "en")).resolves.toMatchObject(
      {
        destination: "/en/new-destination",
      }
    )
  })

  it("waits for a refresh before returning an expired-cache miss", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)

    fetchManyMock
      .mockResolvedValueOnce([
        {
          source: "/en/old-page",
          destination: "/en/old-destination",
        },
      ])
      .mockResolvedValueOnce([
        {
          source: "/en/new-page",
          destination: "/en/new-destination",
        },
      ])

    await findRedirectForPath("/old-page", "en")

    vi.setSystemTime(5 * 60 * 1000 + 1)

    await expect(findRedirectForPath("/new-page", "en")).resolves.toMatchObject(
      {
        destination: "/en/new-destination",
      }
    )
    expect(fetchManyMock).toHaveBeenCalledTimes(2)
  })

  it("keeps serving the last known redirects when a refresh fails", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)

    fetchManyMock
      .mockResolvedValueOnce([
        {
          source: "/en/old-page",
          destination: "/en/new-page",
        },
      ])
      .mockRejectedValue(new Error("Strapi unavailable"))

    await findRedirectForPath("/old-page", "en")

    vi.setSystemTime(5 * 60 * 1000 + 1)

    // Stale hit triggers a background refresh that fails; let it settle, then
    // verify the failure did not replace the cached list with an empty one.
    await expect(findRedirectForPath("/old-page", "en")).resolves.toMatchObject(
      {
        destination: "/en/new-page",
      }
    )
    await Promise.resolve()
    await Promise.resolve()

    await expect(findRedirectForPath("/old-page", "en")).resolves.toMatchObject(
      {
        destination: "/en/new-page",
      }
    )
  })

  it("continues with no redirect when an expired-cache miss refresh fails", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)

    fetchManyMock
      .mockResolvedValueOnce([
        {
          source: "/en/old-page",
          destination: "/en/old-destination",
        },
      ])
      .mockRejectedValueOnce(new Error("Strapi unavailable"))

    await findRedirectForPath("/old-page", "en")

    vi.setSystemTime(5 * 60 * 1000 + 1)

    await expect(findRedirectForPath("/new-page", "en")).resolves.toBeNull()
    expect(fetchManyMock).toHaveBeenCalledTimes(2)
  })
})
