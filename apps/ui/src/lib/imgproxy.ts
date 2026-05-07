/**
 * imgproxy URL builder utility.
 *
 * Requires IMGPROXY_URL to be set (e.g. "https://imgproxy.example.com").
 * Server-side: read directly via process.env.
 * Client-side: injected at runtime via window.CSR_CONFIG (see root layout),
 * accessed through getEnvVar("IMGPROXY_URL").
 *
 * When not configured (local dev), all helpers return the original URL unchanged.
 */

import type { ImageLoaderProps } from "next/image"

import { getEnvVar } from "@/lib/env-vars"

interface ImgproxyOptions {
  width?: number
  height?: number
  /** Output format — defaults to "webp" */
  format?: "webp" | "avif" | "jpeg" | "png"
  /** Resize type — defaults to "fit" */
  resizeType?: "fit" | "fill" | "auto"
  /** Device pixel ratio — defaults to 1 */
  dpr?: number
}

function isSvg(url: string): boolean {
  return new URL(url, "http://n").pathname.endsWith(".svg")
}

export function isImgproxyEnabled() {
  return !!getEnvVar("IMGPROXY_URL")
}

/**
 * Build an imgproxy URL for the given source image.
 *
 * Uses the "plain" source URL style:
 *   {base}/rs:{type}:{w}:{h}/dpr:{dpr}/plain/{sourceUrl}@{format}
 *
 * Returns the original `sourceUrl` unchanged when imgproxy is not configured.
 */
function imgproxyUrl(sourceUrl: string, options: ImgproxyOptions = {}): string {
  const IMGPROXY_URL = getEnvVar("IMGPROXY_URL")
  if (!IMGPROXY_URL || !sourceUrl || isSvg(sourceUrl)) {
    return sourceUrl
  }

  const {
    width = 0,
    height = 0,
    format = "webp",
    resizeType = "fit",
    dpr = 1,
  } = options

  const parts = [`rs:${resizeType}:${width}:${height}`]
  if (dpr > 1) {
    parts.push(`dpr:${dpr}`)
  }

  const processing = parts.join("/")

  // When imgproxy runs in Docker locally, 127.0.0.1/localhost in the source URL
  // points to the container itself — not the host where Strapi runs.
  // Replace with host.docker.internal so imgproxy can reach Strapi.
  // In production, Strapi URLs are absolute (https://...) and unaffected.
  const resolvedSource = sourceUrl
    .replace("http://127.0.0.1:", "http://host.docker.internal:")
    .replace("http://localhost:", "http://host.docker.internal:")

  return `${IMGPROXY_URL}/${processing}/plain/${resolvedSource}@${format}`
}

/**
 * Next.js image loader that routes through imgproxy.
 *
 * Next.js calls this for every width in the generated srcSet,
 * so retina and responsive breakpoints are handled automatically.
 */
export function imgproxyLoader({ src, width }: ImageLoaderProps): string {
  return imgproxyUrl(src, { width, resizeType: "fit", format: "webp" })
}
