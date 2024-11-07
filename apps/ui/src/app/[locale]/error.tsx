"use client"

// Error boundaries must be Client Components - https://nextjs.org/docs/14/app/building-your-application/routing/error-handling
import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { useTranslations } from "next-intl"

import { isDevelopment } from "@/lib/general-helpers"
import { Button } from "@/components/ui/button"

interface Props {
  readonly error: Error
  readonly reset: () => void
}

export default function Error({ error, reset }: Props) {
  const t = useTranslations("errors.global")

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  const handleTryAgain = () => {
    // Attempt to recover by trying to re-render the segment
    reset()
  }

  const isDev = isDevelopment()

  return (
    <div className="w-full overflow-x-hidden">
      <h1 className="text-xl font-semibold tracking-tight">
        {t("somethingWentWrong")}
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        {t("invalidContent")}
        {isDev ? `: ${error.message}` : null}
      </p>
      {isDev && (
        <p className="mt-2 w-full overflow-x-auto bg-gray-100 p-3 text-xs">
          <pre>{error.stack?.split("\n").slice(0, 7).join("\n")}</pre>
        </p>
      )}

      <Button type="button" size="sm" onClick={handleTryAgain} className="mt-2">
        {t("tryAgain")}
      </Button>
    </div>
  )
}
