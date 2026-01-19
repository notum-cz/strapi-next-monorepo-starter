"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { authClient } from "@/auth-client"
import { useLocale } from "next-intl"

import { getAuthErrorMessage } from "@/lib/general-helpers"
import { useToast } from "@/components/ui/use-toast"

export default function StrapiOAuthCallbackPage() {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const accessToken = searchParams.get("access_token")

    if (!accessToken) {
      setStatus("error")
      setMessage("Missing access_token from Strapi redirect")
      return
    }

    authClient
      .syncOauthStrapi({
        accessToken,
        provider: "github",
      })
      .then((result) => {
        if (result.error) {
          const message = getAuthErrorMessage(
            result.error.message,
            "OAuth sign-in failed"
          )

          setStatus("error")
          setMessage(message)
          toast({ variant: "destructive", description: message })
          return
        }

        setStatus("success")
        setMessage("Signed in successfully. Redirecting…")
        window.location.href = `/${locale}`
      })
      .catch((error) => {
        setStatus("error")
        const rawMessage =
          typeof error === "string" ? error : (error as Error)?.message
        const message = getAuthErrorMessage(rawMessage, "OAuth sign-in failed")
        setMessage(message)
        toast({ variant: "destructive", description: message })
      })
  }, [locale, searchParams, toast])

  return (
    <div className="p-6">
      {status === "loading" && <p>Signing you in…</p>}
      {status === "success" && (
        <>
          <p>🎉 Signed in successfully 🎉</p>
          <p className="text-muted-foreground text-sm">{message}</p>
        </>
      )}
      {status === "error" && (
        <>
          <p>🚨 Sign in failed 🚨</p>
          <p className="text-muted-foreground text-sm">{message}</p>
        </>
      )}
    </div>
  )
}
