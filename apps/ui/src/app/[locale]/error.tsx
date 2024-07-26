"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

interface Props {
  readonly error: Error
  readonly reset: () => void
}

export default function Error({ error, reset }: Props) {
  const t = useTranslations("errors.global")

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {t("title")} <span>🥹</span>
      </h4>
      <Button onClick={reset} className="mt-2">
        {t("goBack")}
      </Button>
    </div>
  )
}
