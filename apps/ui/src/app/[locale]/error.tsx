"use client"

// Error boundaries must be Client Components - https://nextjs.org/docs/app/building-your-application/routing/error-handling#using-error-boundaries
import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

interface Props {
  readonly error: Error
  readonly reset: () => void
}

export default function Error({ error, reset }: Props) {
  const t = useTranslations("errors.global")

  useEffect(() => {
    console.error(error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {t("title")} <span>🥹</span>
      </h4>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="mt-2"
      >
        {t("tryAgain")}
      </Button>
    </div>
  )
}
