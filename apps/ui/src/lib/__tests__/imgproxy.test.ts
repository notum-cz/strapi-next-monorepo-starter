import type { ImageLoaderProps } from "next/image"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { getEnvVarMock } = vi.hoisted(() => ({
  getEnvVarMock: vi.fn(),
}))

vi.mock("@/lib/env-vars", () => ({
  getEnvVar: getEnvVarMock,
}))

import { imgproxyLoader, isImgproxyEnabled } from "../imgproxy"

const loaderProps = (src: string, width = 768): ImageLoaderProps => ({
  src,
  width,
  quality: undefined,
})

describe("imgproxy utilities", () => {
  beforeEach(() => {
    getEnvVarMock.mockReset()
  })

  describe("isImgproxyEnabled", () => {
    it("returns false when IMGPROXY_URL is missing", () => {
      getEnvVarMock.mockReturnValue(undefined)

      expect(isImgproxyEnabled()).toBe(false)
      expect(getEnvVarMock).toHaveBeenCalledWith("IMGPROXY_URL")
    })

    it("returns true when IMGPROXY_URL is configured", () => {
      getEnvVarMock.mockReturnValue("https://imgproxy.example.com")

      expect(isImgproxyEnabled()).toBe(true)
    })
  })

  describe("imgproxyLoader", () => {
    it("returns the original source when imgproxy is disabled", () => {
      getEnvVarMock.mockReturnValue(undefined)

      const src = "https://cdn.example.com/uploads/image.png"

      expect(imgproxyLoader(loaderProps(src))).toBe(src)
    })

    it("returns the original source for SVG images", () => {
      getEnvVarMock.mockReturnValue("https://imgproxy.example.com")

      const src = "https://cdn.example.com/uploads/logo.svg"

      expect(imgproxyLoader(loaderProps(src))).toBe(src)
    })

    it("builds an imgproxy URL for the requested width", () => {
      getEnvVarMock.mockReturnValue("https://imgproxy.example.com")

      expect(
        imgproxyLoader(
          loaderProps("https://cdn.example.com/uploads/image.png", 1024)
        )
      ).toBe(
        "https://imgproxy.example.com/rs:fit:1024:0/plain/https://cdn.example.com/uploads/image.png@webp"
      )
    })

    it("rewrites local Strapi source URLs for Docker imgproxy access", () => {
      getEnvVarMock.mockReturnValue("http://localhost:8080")

      expect(
        imgproxyLoader(
          loaderProps("http://127.0.0.1:1337/uploads/image.png", 420)
        )
      ).toBe(
        "http://localhost:8080/rs:fit:420:0/plain/http://host.docker.internal:1337/uploads/image.png@webp"
      )
    })
  })
})
