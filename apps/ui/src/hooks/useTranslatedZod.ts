import { useTranslations } from "next-intl"
import React from "react"
import type { z } from "zod"

/**
 * Hook that translates zod validation errors.
 *
 * All locale keys - https://raw.githubusercontent.com/aiji42/zod-i18n/main/packages/core/locales/en/zod.json
 * In case there are any missing keys and they will be used in validation, this will throw many errors in the console.
 */

export function useTranslatedZod(zod: typeof z) {
  const t = useTranslations("errors.zodValidation")

  const errorMap: z.core.$ZodErrorMap = React.useCallback(
    (issue) => {
      let message
      const { code, message: _message, ...values } = issue
      const normalizedValues: Record<string, unknown> = { ...values }

      switch (issue.code) {
        case "invalid_type": {
          const received = zod.util.parsedType(issue.input)
          normalizedValues.received = received
          message =
            received === "undefined"
              ? "invalid_type_received_undefined"
              : "invalid_type"
          break
        }
        case "too_small": {
          const sizeKey = issue.inclusive ? "inclusive" : "not_inclusive"
          if (issue.origin === "string") {
            message = issue.exact
              ? "too_small.string.exact"
              : `too_small.string.${sizeKey}`
          } else if (
            issue.origin === "number" ||
            issue.origin === "int" ||
            issue.origin === "bigint"
          ) {
            message = issue.exact
              ? "too_small.number.exact"
              : `too_small.number.${sizeKey}`
          } else {
            message = "invalid_type"
          }
          break
        }
        case "too_big": {
          const sizeKey = issue.inclusive ? "inclusive" : "not_inclusive"
          if (issue.origin === "string") {
            message = issue.exact
              ? "too_big.string.exact"
              : `too_big.string.${sizeKey}`
          } else if (
            issue.origin === "number" ||
            issue.origin === "int" ||
            issue.origin === "bigint"
          ) {
            message = issue.exact
              ? "too_big.number.exact"
              : `too_big.number.${sizeKey}`
          } else {
            message = "invalid_type"
          }
          break
        }
        case "invalid_format":
          message = "invalid_string.regex"
          break
        case "invalid_value":
          normalizedValues.expected = issue.values?.join(", ")
          message = "invalid_literal"
          break
        case "custom":
          switch (issue.params?.type) {
            case "passwordNumber":
              message = "custom.passwordWithNumber"

              break

            case "phoneNumber":
              message = "custom.phoneNumber"

              break

            case "checkPassword":
              message = "custom.password"

              break

            // No default
          }
          break

        default:
          message = issue.code
      }

      return { message: t(message as any, normalizedValues as any) }
    },
    [t, zod]
  )

  React.useEffect(() => {
    zod.config({ localeError: errorMap })
  }, [errorMap, zod])

  return {}
}
