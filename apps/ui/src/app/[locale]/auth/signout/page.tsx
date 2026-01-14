"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/auth-client"
import { useLocale } from "next-intl"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { redirect } from "@/lib/navigation"

export default function SignOutPage() {
  removeThisWhenYouNeedMe("SignOutPage")

  const { data: session, isPending } = authClient.useSession()
  const locale = useLocale()
  const router = useRouter()

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
            onSuccess: () => {
              router.push("/")
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
