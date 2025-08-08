import { NextResponse } from "next/server"
import { env } from "@/env.mjs"

/**
 * This route handler acts as a private proxy for frontend requests with one goal:
 * - Hide the backend URL, so it cannot be accessed directly.
 *
 * It is a private proxy because it accesses Strapi API endpoints requiring Users-permissions (https://docs.strapi.io/cms/features/users-permissions)
 * authentication. Every user has a unique token, which is used to authenticate requests.
 *
 * Authorization tokens are injected on the client-side, based on NextAuth's session.
 */
async function handler(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const path = Array.isArray(slug) ? slug.join("/") : slug
  const isReadOnly = request.method === "GET" || request.method === "HEAD"

  const { search } = new URL(request.url)
  const url = `${env.STRAPI_URL}/${path}${search ?? ""}`

  const clonedRequest = request.clone()
  // Extract the body explicitly from the cloned request
  let body: string | Blob | undefined
  if (!isReadOnly) {
    const contentType = clonedRequest.headers.get("content-type")
    if (contentType?.includes("multipart/form-data")) {
      // File upload - preserve FormData as blob
      body = await clonedRequest.blob()
    } else {
      // Regular API call - use text for JSON
      body = await clonedRequest.text()
    }
  }

  const response = await fetch(url, {
    headers: {
      // Convert headers to object
      ...Object.fromEntries(clonedRequest.headers),
    },
    body,
    // this needs to be explicitly stated, because it is defaulted to GET
    method: request.method,
  })

  // Remove encoding headers, because the body is no longer compressed and the browser/client will choke on it.
  // (Built-in fetch in Node.js decompresses the body if the response has Content-Encoding: gzip
  // and gives the decompressed stream.)
  const headers = new Headers(response.headers)
  headers.delete("content-encoding")
  headers.delete("content-length")

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  })
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as POST,
  handler as PUT,
}
