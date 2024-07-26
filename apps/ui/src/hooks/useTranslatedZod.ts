import React from "react"
import { useTranslations } from "next-intl"
import { z } from "zod"

/**
 * Hook that translates zod validation errors.
 *
 * All locale keys - https://raw.githubusercontent.com/aiji42/zod-i18n/main/packages/core/locales/en/zod.json
 * In case there are any missing keys and they will be used in validation, this will throw many errors in the console.
 */

export function useTranslatedZod(zod: typeof z) {
  const t = useTranslations("errors.zodValidation")

  const errorMap: z.ZodErrorMap = React.useCallback(
    // eslint-disable-next-line no-unused-vars
    (issue, _ctx) => {
      let message
      // eslint-disable-next-line no-unused-vars
      const { code, ...values } = issue
      switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
          if (issue.received === z.ZodParsedType.undefined) {
            message = "invalid_type_received_undefined"
          } else {
            message = `invalid_type`
          }
          break
        case z.ZodIssueCode.too_small:
          if (issue.type === "string") {
            if (issue.exact) {
              message = "too_small.string.exact"
            } else {
              message = `too_small.string.${
                issue.inclusive ? "inclusive" : "exclusive"
              }`
            }
          } else if (issue.type === "number")
            if (issue.exact) {
              message = "too_small.number.exact"
            } else {
              message = `too_small.number.${
                issue.inclusive ? "inclusive" : "exclusive"
              }`
            }
          else message = "invalid_type"
          break
        case z.ZodIssueCode.too_big:
          if (issue.type === "string") {
            if (issue.exact) {
              message = "too_big.string.exact"
            } else {
              message = `too_big.string.${
                issue.inclusive ? "inclusive" : "exclusive"
              }`
            }
          } else if (issue.type === "number")
            if (issue.exact) {
              message = "too_big.number.exact"
            } else {
              message = `too_big.number.${
                issue.inclusive ? "inclusive" : "exclusive"
              }`
            }
          else message = "invalid_type"
          break
        case z.ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`

              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`
            } else {
              z.util.assertNever(issue.validation)
            }
          } else {
            message = `invalid_string.regex`
          }
          break
        case z.ZodIssueCode.custom:
          if (issue.params?.type === "passwordNumber") {
            message = "custom.passwordWithNumber"
          } else if (issue.params?.type === "phoneNumber") {
            message = "custom.phoneNumber"
          } else if (issue.params?.type === "checkPassword") {
            message = "custom.password"
          }
          break
        default:
          message = issue.code
      }
      return { message: t(message as any, values as any) }
    },
    [t]
  )

  React.useEffect(() => {
    zod.setErrorMap(errorMap)
  }, [errorMap, zod])

  return {}
}
