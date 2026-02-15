"use client"

import { useLocale } from "next-intl"
import { useEffect } from "react"

import { authClient } from "@/lib/auth-client"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { redirect, useRouter } from "@/lib/navigation"

export default function SignOutPage() {
  removeThisWhenYouNeedMe("SignOutPage")

  const { data: session, isPending } = authClient.useSession()
  const locale = useLocale()
  const router = useRouter()

  const handleSignOut = async () => {
    if (isPending) {
      // Wait for session to load or sign out to complete
      return
    }

    if (session?.user) {
      // User is authenticated, sign them out
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push(`/`)
            router.refresh()
          },
        },
      })
    } else {
      // User is not authenticated, redirect to home
      redirect({ href: "/", locale })
    }
  }

  useEffect(() => {
    handleSignOut()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending])

  return null
}
