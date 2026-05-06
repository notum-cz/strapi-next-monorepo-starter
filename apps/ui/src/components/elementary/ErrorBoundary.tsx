"use client"

import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import * as Sentry from "@sentry/nextjs"
import { XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ErrorBoundary as ErrorBoundaryComp } from "react-error-boundary"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { isDevelopment } from "@/lib/general-helpers"

function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
  customErrorTitle,
  hideReset,
  showErrorMessage,
}: {
  readonly error: unknown
  readonly resetErrorBoundary: () => void
  readonly customErrorTitle?: string
  readonly hideReset?: boolean
  readonly showErrorMessage?: boolean
}) {
  const [hidden, setHidden] = useState(false)
  const t = useTranslations("errors.global")

  if (hidden) {
    return null
  }

  const handleTryAgain = () => {
    // Attempt to recover by trying to re-render the segment
    resetErrorBoundary()
  }

  const isDev = isDevelopment()
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  return (
    <Alert variant="destructive" className="relative">
      <ExclamationTriangleIcon className="s-4" />
      <AlertTitle>{customErrorTitle ?? t("invalidContent")}</AlertTitle>
      <AlertDescription>
        {(showErrorMessage || isDev) && (
          <p className="mt-1 text-sm text-black">{errorMessage}</p>
        )}

        {isDev && (
          <div className="mt-2 w-full overflow-x-auto bg-gray-100 p-3 text-xs">
            <pre>{errorStack?.split("\n").slice(0, 5).join("\n")}</pre>
          </div>
        )}

        {!hideReset && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={handleTryAgain}
            className="mt-2"
          >
            {t("tryAgain")}
          </Button>
        )}
      </AlertDescription>

      <span className="absolute top-2 right-2 block">
        <XIcon
          className="size-4 cursor-pointer"
          onClick={() => setHidden(true)}
        />
      </span>
    </Alert>
  )
}

export function ErrorBoundary({
  children,
  hideReset,
  hideFallback,
  customErrorTitle,
  showErrorMessage,
  onReset,
  onError,
}: {
  readonly children: React.ReactNode
  readonly hideReset?: boolean
  readonly hideFallback?: boolean
  readonly customErrorTitle?: string
  readonly showErrorMessage?: boolean
  readonly onReset?: () => void
  readonly onError?: (
    error: unknown,
    info: { componentStack?: string | null }
  ) => void
}) {
  const handleError = (
    error: unknown,
    info: { componentStack?: string | null }
  ) => {
    const errorDigest =
      error instanceof Error
        ? (error as Error & { digest?: string }).digest
        : undefined
    const infoDigest = (info as { digest?: string | null }).digest
    const digest = errorDigest ?? infoDigest
    if (digest === "NEXT_NOT_FOUND" || digest?.includes("404")) {
      throw error
    }

    if (onError) {
      onError(error, info)
    }

    Sentry.captureException(error)
  }

  return (
    <ErrorBoundaryComp
      fallbackRender={(props) =>
        hideFallback ? null : (
          <ErrorBoundaryFallback
            {...props}
            hideReset={hideReset}
            customErrorTitle={customErrorTitle}
            showErrorMessage={showErrorMessage}
          />
        )
      }
      onError={handleError}
      onReset={onReset}
    >
      {children}
    </ErrorBoundaryComp>
  )
}
