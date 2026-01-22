"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"

import { getAuthErrorMessage } from "@/lib/general-helpers"
import { useUserMutations } from "@/hooks/useUserMutations"
import { useToast } from "@/components/ui/use-toast"

export default function StrapiOAuthCallbackPage({
  params,
}: {
  params: { locale: string; provider: string }
}) {
  const locale = useLocale()
  const t = useTranslations("auth.oauth")
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { syncOauthStrapiMutation } = useUserMutations()
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent running multiple times
    if (hasProcessed.current) return
    hasProcessed.current = true

    const accessToken = searchParams.get("access_token")
    const provider = params?.provider || "github"

    if (!accessToken) {
      toast({
        variant: "destructive",
        description: "Missing access_token from Strapi redirect",
      })
      return
    }

    syncOauthStrapiMutation.mutate(
      { accessToken, provider },
      {
        onSuccess: (result) => {
          if (result.error) {
            const message = getAuthErrorMessage(
              result.error.message,
              "OAuth sign-in failed"
            )
            toast({ variant: "destructive", description: message })
            return
          }

          // Redirect on success
          window.location.href = `/${locale}`
        },
        onError: (error: any) => {
          const rawMessage = typeof error === "string" ? error : error?.message
          const message = getAuthErrorMessage(
            rawMessage,
            "OAuth sign-in failed"
          )
          toast({ variant: "destructive", description: message })
        },
      }
    )
  }, [locale, params?.provider, searchParams, syncOauthStrapiMutation, toast])

  // Derive UI from mutation state
  const { isPending, isSuccess, isError, error } = syncOauthStrapiMutation

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="text-center">
        {isPending && (
          <div className="space-y-2">
            <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="text-lg">{t("signingIn")}</p>
          </div>
        )}

        {isSuccess && (
          <div className="space-y-2">
            <p className="text-2xl">🎉</p>
            <p className="text-lg font-medium">{t("signedInSuccessfully")}</p>
            <p className="text-muted-foreground text-sm">{t("redirecting")}</p>
          </div>
        )}

        {isError && (
          <div className="space-y-2">
            <p className="text-2xl">🚨</p>
            <p className="text-lg font-medium">{t("signInFailed")}</p>
            <p className="text-muted-foreground text-sm">
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
