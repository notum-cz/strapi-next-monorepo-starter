"use client"

import { useEffect } from "react"
import { useLocale } from "next-intl"

import { authClient } from "@/lib/auth-client"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { redirect } from "@/lib/navigation"
import { useUserMutations } from "@/hooks/useUserMutations"

export default function SignOutPage() {
  removeThisWhenYouNeedMe("SignOutPage")

  const { data: session, isPending } = authClient.useSession()
  const locale = useLocale()
  const { signOutMutation } = useUserMutations()

  useEffect(() => {
    const handleSignOut = async () => {
      if (isPending || signOutMutation.isPending) {
        // Wait for session to load or sign out to complete
        return
      }

      if (session?.user) {
        // User is authenticated, sign them out
        await signOutMutation.mutateAsync()
        // Use full page navigation for consistency with login/register
        // This ensures session is fully cleared and navbar updates
        window.location.href = `/${locale}`
      } else {
        // User is not authenticated, redirect to home
        redirect({ href: "/", locale })
      }
    }

    handleSignOut()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending, signOutMutation.isPending])

  return null
}
