import { useTranslations } from "next-intl"
import React from "react"
import type { z } from "zod"

/**
 * Hook that translates zod validation errors.
 *
 * All locale keys - https://raw.githubusercontent.com/aiji42/zod-i18n/main/packages/core/locales/en/zod.json
 * In case there are any missing keys and they will be used in validation, this will throw many errors in the console.
 */

function resolveSizeMessage(
  prefix: "too_small" | "too_big",
  issue: { origin: string; inclusive?: boolean; exact?: boolean }
) {
  const sizeKey = issue.inclusive === true ? "inclusive" : "not_inclusive"

  if (issue.origin === "string") {
    return issue.exact === true
      ? `${prefix}.string.exact`
      : `${prefix}.string.${sizeKey}`
  }

  if (
    issue.origin === "number" ||
    issue.origin === "int" ||
    issue.origin === "bigint"
  ) {
    return issue.exact === true
      ? `${prefix}.number.exact`
      : `${prefix}.number.${sizeKey}`
  }

  return "invalid_type"
}

function resolveCustomMessage(params?: { type?: string }) {
  switch (params?.type) {
    case "passwordNumber":
      return "custom.passwordWithNumber"
    case "phoneNumber":
      return "custom.phoneNumber"
    case "checkPassword":
      return "custom.password"

    default:
      return
  }
}

export function useTranslatedZod(zod: typeof z) {
  const t = useTranslations("errors.zodValidation")

  const errorMap: z.core.$ZodErrorMap = React.useCallback(
    (issue) => {
      let message: string | undefined
      const { code, message: _message, ...values } = issue
      const normalizedValues: Record<string, unknown> = { ...values }

      switch (code) {
        case "invalid_type": {
          const received = zod.util.parsedType(issue.input)
          normalizedValues.received = received
          message =
            received === "undefined"
              ? "invalid_type_received_undefined"
              : "invalid_type"
          break
        }
        case "too_small":
          message = resolveSizeMessage("too_small", issue)
          break
        case "too_big":
          message = resolveSizeMessage("too_big", issue)
          break
        case "invalid_format":
          message = "invalid_string.regex"
          break
        case "invalid_value":
          normalizedValues.expected = issue.values?.join(", ")
          message = "invalid_literal"
          break
        case "custom":
          message = resolveCustomMessage(issue.params)
          break

        default:
          message = code
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic translation keys from zod error codes
      return { message: t(message as any, normalizedValues as any) }
    },
    [t, zod]
  )

  React.useEffect(() => {
    zod.config({ localeError: errorMap })
  }, [errorMap, zod])

  return {}
}
