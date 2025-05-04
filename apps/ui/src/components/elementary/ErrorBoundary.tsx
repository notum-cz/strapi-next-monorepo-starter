"use client"

import { useState } from "react"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import * as Sentry from "@sentry/nextjs"
import { XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { ErrorBoundary as ErrorBoundaryComp } from "react-error-boundary"

import { isDevelopment } from "@/lib/general-helpers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
  customErrorTitle,
  hideReset,
  showErrorMessage,
}: {
  readonly error: any
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

  return (
    <Alert variant="destructive" className="relative">
      <ExclamationTriangleIcon className="s-4" />
      <AlertTitle>{customErrorTitle ?? t("invalidContent")}</AlertTitle>
      <AlertDescription>
        {(showErrorMessage || isDev) && (
          <p className="mt-1 text-sm text-black">{error.message}</p>
        )}

        {isDev && (
          <div className="mt-2 w-full overflow-x-auto bg-gray-100 p-3 text-xs">
            <pre>{error.stack?.split("\n").slice(0, 5).join("\n")}</pre>
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
    // eslint-disable-next-line no-unused-vars
    error: Error,
    // eslint-disable-next-line no-unused-vars
    info: { componentStack?: string | null }
  ) => void
}) {
  const handleError = (
    error: Error,
    info: { componentStack?: string | null; digest?: string | null }
  ) => {
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
