"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"

import { useUserMutations } from "@/hooks/useUserMutations"
import { useToast } from "@/components/ui/use-toast"

export function OAuthProvider({
  params,
}: {
  params: { locale: string; provider: string }
}) {
  const locale = useLocale()
  const t = useTranslations("auth.oauth")
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { syncOauthStrapiMutation } = useUserMutations()

  const handleSync = (accessToken: string, provider: string) => {
    syncOauthStrapiMutation.mutate(
      { accessToken, provider },
      {
        onSuccess: () => {
          // Redirect on success
          window.location.href = `/${locale}`
        },
        onError: (error) => {
          const errorMessage = error?.message

          const displayMessage = errorMessage ?? t("errors.signInFailed")

          toast({ variant: "destructive", description: displayMessage })
        },
      }
    )
  }

  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    const provider = params?.provider || "github"

    if (!accessToken) {
      toast({
        variant: "destructive",
        description: "Missing access_token from Strapi redirect",
      })
    } else {
      handleSync(accessToken, provider)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            <p className="text-lg font-medium">{t("errors.signInFailed")}</p>
            <p className="text-muted-foreground text-sm">
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
