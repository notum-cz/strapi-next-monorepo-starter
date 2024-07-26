"use client"

import { useEffect } from "react"
import { signOut, useSession } from "next-auth/react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { redirect } from "@/lib/navigation"

export default function SignOutPage() {
  removeThisWhenYouNeedMe("SignOutPage")

  const session = useSession()
  useEffect(() => {
    if (session.status === "authenticated") {
      signOut({ callbackUrl: "/" })
    } else {
      redirect("/")
    }
  }, [session.status])

  return null
}
