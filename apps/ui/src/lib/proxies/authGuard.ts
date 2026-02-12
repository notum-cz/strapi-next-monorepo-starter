import { NextRequest, NextResponse } from "next/server"

import { getSessionSSR } from "@/lib/auth"
import { routing } from "@/lib/navigation"

const authPages = ["/auth/change-password", "/auth"]

const authPathnameRegex = RegExp(
  `^(/(${routing.locales.join("|")}))?(${authPages.join("|")})/?$`,
  "i"
)

/**
 * Protects auth pages by requiring an active session.
 * Redirects to sign-in if unauthenticated.
 * Returns the intlProxy response if authenticated, or null if the page is not protected.
 */
export const authGuard = async (
  req: NextRequest,
  intlProxy: (req: NextRequest) => NextResponse
): Promise<NextResponse | null> => {
  if (!authPathnameRegex.test(req.nextUrl.pathname)) {
    return null
  }

  try {
    const session = await getSessionSSR(req.headers)

    if (!session?.user) {
      throw new Error("No valid session")
    }

    return intlProxy(req)
  } catch {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }
}
