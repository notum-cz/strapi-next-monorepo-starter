"use client"

import { useEffect } from "react"
import { authClient } from "@/auth-client"
import { useLocale } from "next-intl"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { redirect } from "@/lib/navigation"

export default function SignOutPage() {
  removeThisWhenYouNeedMe("SignOutPage")

  const { data: session, isPending } = authClient.useSession()
  const locale = useLocale()

  useEffect(() => {
    const handleSignOut = async () => {
      if (isPending) {
        // Wait for session to load
        return
      }

      if (session?.user) {
        // User is authenticated, sign them out
        await authClient.signOut({
          fetchOptions: {
            onSuccess: async () => {
              // Use full page navigation for consistency with login/register
              // This ensures session is fully cleared and navbar updates
              window.location.href = `/${locale}`
            },
          },
        })
    } else {
        // User is not authenticated, redirect to home
      redirect({ href: "/", locale })
      }
    }

    handleSignOut()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending])

  return null
}
