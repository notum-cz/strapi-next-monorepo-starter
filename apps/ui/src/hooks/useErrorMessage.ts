import { useTranslations } from "next-intl"

import { AppError } from "@/types/general"

export function useErrorMessage() {
  const t = useTranslations()

  function getErrorMessage(
    keysPrefix: Parameters<typeof useTranslations>[0],
    customMessageOrCode: number | string,
    httpStatusCode?: number
  ): string {
    const customErrorMessageKey = `${keysPrefix}.${customMessageOrCode}` as any
    const tCustomErrorMessage = t(customErrorMessageKey)
    if (tCustomErrorMessage !== customErrorMessageKey) {
      return tCustomErrorMessage
    }

    const httpErrorMessageKey = `errors.http.${httpStatusCode}` as any
    const tHttpErrorMessage = t(httpErrorMessageKey)
    if (tHttpErrorMessage !== httpErrorMessageKey) {
      return tHttpErrorMessage
    }

    return t("errors.global.title")
  }

  function parseAppError(error: AppError) {
    return getErrorMessage(
      error.translateKeyPrefixForErrors,
      error.message,
      error.status
    )
  }

  return { getErrorMessage, parseAppError }
}
