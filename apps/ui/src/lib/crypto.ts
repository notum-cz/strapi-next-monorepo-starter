/**
 * WARNING: Do not use this function for any sensitive data!
 *
 * This has been implemented purely to avoid sharing Strapi URL to client-side bundle.
 * It is not impenetrable, however in this instance the attacker would only gain access to force-reload the page.
 *
 * This works both on the client-side and server-side
 *
 * @param string Input String
 * @returns SHA-256 hashed string
 */
export async function hashStringSHA256(string: string) {
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(string)
  )
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}
