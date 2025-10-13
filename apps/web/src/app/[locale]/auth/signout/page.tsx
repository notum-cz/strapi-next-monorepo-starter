"use client"

import { useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { useLocale } from "next-intl"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { redirect } from "@/lib/navigation"

export default function SignOutPage() {
  removeThisWhenYouNeedMe("SignOutPage")

  const session = useSession()
  const locale = useLocale()

  useEffect(() => {
    if (session.status === "authenticated") {
      signOut({ callbackUrl: "/" })
    } else {
      redirect({ href: "/", locale })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status])

  return null
}
