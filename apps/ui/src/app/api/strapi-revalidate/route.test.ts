import { beforeEach, describe, expect, it, vi } from "vitest"

const { getEnvVarMock, revalidatePathMock, revalidateTagMock } = vi.hoisted(
  () => ({
    getEnvVarMock: vi.fn(),
    revalidatePathMock: vi.fn(),
    revalidateTagMock: vi.fn(),
  })
)

vi.mock("@/lib/env-vars", () => ({
  getEnvVar: getEnvVarMock,
}))

vi.mock("@/lib/navigation", () => ({
  routing: {
    defaultLocale: "en",
  },
}))

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: revalidateTagMock,
}))

import { POST } from "./route"

describe("POST /api/strapi-revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 404 when the revalidation secret is not configured", async () => {
    getEnvVarMock.mockReturnValue(undefined)

    const response = await POST(
      new Request("http://localhost/api/strapi-revalidate", {
        method: "POST",
        body: JSON.stringify({}),
      })
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      message: "Missing revalidation configuration.",
    })
  })

  it("returns 400 for invalid JSON", async () => {
    getEnvVarMock.mockReturnValue("test-secret")

    const response = await POST(
      new Request("http://localhost/api/strapi-revalidate", {
        method: "POST",
        body: "{",
        headers: {
          "Content-Type": "application/json",
        },
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      message: "Invalid JSON body.",
    })
  })

  it("returns 401 for an invalid secret", async () => {
    getEnvVarMock.mockReturnValue("test-secret")

    const response = await POST(
      new Request("http://localhost/api/strapi-revalidate", {
        method: "POST",
        body: JSON.stringify({
          uid: "api::page.page",
          fullPaths: ["/about"],
          secret: "wrong-secret",
        }),
      })
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      message: "Invalid token.",
    })
  })

  it("revalidates normalized path variants and deduplicated tags", async () => {
    getEnvVarMock.mockReturnValue("test-secret")

    const response = await POST(
      new Request("http://localhost/api/strapi-revalidate", {
        method: "POST",
        body: JSON.stringify({
          uid: "api::page.page",
          fullPaths: [" /en/about ", "/about", "/en"],
          tags: [" strapi:api::page.page ", "", "news", "news"],
          secret: "test-secret",
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(revalidatePathMock).toHaveBeenCalledTimes(4)
    expect(revalidatePathMock).toHaveBeenCalledWith("/en/about")
    expect(revalidatePathMock).toHaveBeenCalledWith("/about")
    expect(revalidatePathMock).toHaveBeenCalledWith("/en")
    expect(revalidatePathMock).toHaveBeenCalledWith("/")

    expect(revalidateTagMock).toHaveBeenCalledTimes(2)
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "strapi:api::page.page",
      "max"
    )
    expect(revalidateTagMock).toHaveBeenCalledWith("news", "max")

    await expect(response.json()).resolves.toMatchObject({
      uid: "api::page.page",
      revalidated: true,
      fullPaths: expect.arrayContaining(["/en/about", "/about", "/en", "/"]),
      tags: expect.arrayContaining(["strapi:api::page.page", "news"]),
    })
  })

  it("returns 400 when neither paths nor tags are provided", async () => {
    getEnvVarMock.mockReturnValue("test-secret")

    const response = await POST(
      new Request("http://localhost/api/strapi-revalidate", {
        method: "POST",
        body: JSON.stringify({
          uid: "api::page.page",
          fullPaths: [" "],
          tags: [],
          secret: "test-secret",
        }),
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      message: "Provide fullPaths or at least one tag.",
    })
  })
})
