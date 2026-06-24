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

const request = (body: unknown, token?: string) =>
  new Request("http://localhost/api/strapi-revalidate", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : { "Content-Type": "application/json" },
  })

describe("POST /api/strapi-revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 503 when the revalidation secret is not configured", async () => {
    getEnvVarMock.mockReturnValue(undefined)

    const response = await POST(request({}, "test-secret"))

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      message: "Missing revalidation configuration.",
    })
  })

  it("returns 401 when no bearer token is provided", async () => {
    getEnvVarMock.mockReturnValue("test-secret")

    const response = await POST(
      request({
        uid: "api::page.page",
        next: { fullPaths: ["/about"], tags: [] },
      })
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      message: "Invalid token.",
    })
  })

  it("returns 401 for an invalid bearer token", async () => {
    getEnvVarMock.mockReturnValue("test-secret")

    const response = await POST(
      request(
        {
          uid: "api::page.page",
          next: { fullPaths: ["/about"], tags: [] },
        },
        "wrong-secret"
      )
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      message: "Invalid token.",
    })
  })

  it("returns 400 for invalid JSON", async () => {
    getEnvVarMock.mockReturnValue("test-secret")

    const response = await POST(request("{", "test-secret"))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      message: "Invalid JSON body.",
    })
  })

  it("revalidates normalized path variants and deduplicated tags", async () => {
    getEnvVarMock.mockReturnValue("test-secret")

    const response = await POST(
      request(
        {
          uid: "api::page.page",
          next: {
            fullPaths: [" /en/about ", "/about", "/en"],
            tags: [" strapi:api::page.page ", "", "news", "news"],
          },
        },
        "test-secret"
      )
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
      request(
        {
          uid: "api::page.page",
          next: { fullPaths: [" "], tags: [] },
        },
        "test-secret"
      )
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      message: "Provide at least one Next.js path or tag.",
    })
  })
})
