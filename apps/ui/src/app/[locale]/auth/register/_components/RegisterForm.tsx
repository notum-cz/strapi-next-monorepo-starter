"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { authClient } from "@/lib/auth-client"
import { PASSWORD_MIN_LENGTH } from "@/lib/constants"
import { getAuthErrorMessage } from "@/lib/general-helpers"
import { Link } from "@/lib/navigation"
import { cn } from "@/lib/styles"
import { AppField } from "@/components/forms/AppField"
import { AppForm } from "@/components/forms/AppForm"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// To enable email confirmation, Strapi Users-Permissions plugin must be configured (e.g. email provider, redirect URL)
// http://localhost:1337/admin/settings/users-permissions/advanced-settings
const ENABLE_EMAIL_CONFIRMATION = false

export function RegisterForm() {
  const t = useTranslations("auth.register")
  const { toast } = useToast()
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(RegisterFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  })

  async function onSubmit(values: z.infer<FormSchemaType>) {
    try {
      // Call Better Auth custom registration endpoint
      // The path /register-strapi becomes registerStrapi (kebab-case to camelCase)
      const result = await authClient.registerStrapi({
        username: values.email,
        email: values.email,
        password: values.password,
      })

      if (result.data) {
        // User is registered AND signed in automatically!
        setIsSuccess(true)

        if (!ENABLE_EMAIL_CONFIRMATION) {
          // Use full page navigation to ensure session is reloaded
          window.location.href = "/"
        }
      } else if (result.error) {
        const errorMessage = getAuthErrorMessage(
          result.error.message,
          t("errors.unexpectedError")
        )

        // Try to match common errors to translated messages
        const errorMap = {
          "already taken": t("errors.emailUsernameTaken"),
        } as const

        const errorKey = Object.keys(errorMap).find(
          (key): key is keyof typeof errorMap =>
            errorMessage?.includes(key) ?? false
        )

        const displayMessage = errorKey ? errorMap[errorKey] : errorMessage

        toast({
          variant: "destructive",
          description: displayMessage,
        })
      }
    } catch (error: any) {
      // Fallback error handling
      const rawMessage =
        typeof error === "string" ? error : (error as Error)?.message
      const errorMap = {
        "already taken": t("errors.emailUsernameTaken"),
      } as const

      let errorMessage = getAuthErrorMessage(
        rawMessage,
        t("errors.unexpectedError")
      )
      const errorKey = Object.keys(errorMap).find(
        (key): key is keyof typeof errorMap => errorMessage?.includes(key)
      )
      errorMessage = errorKey ? errorMap[errorKey] : errorMessage

      toast({
        variant: "destructive",
        description: errorMessage,
      })
    }
  }

  if (isSuccess && ENABLE_EMAIL_CONFIRMATION) {
    // This message is relevant if system requires email verification
    return (
      <Card className="m-auto w-[400px]">
        <CardHeader>
          <h2 className="mx-auto">{t("checkEmail")}</h2>
        </CardHeader>
        <CardContent>
          <Link
            href="/auth/signin"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-[44px] w-full"
            )}
          >
            <p>{t("signInLink")}</p>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="m-auto w-[400px]">
        <CardHeader>
          <CardTitle>{t("header")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AppForm form={form} onSubmit={onSubmit} id={registerFormName}>
            <AppField name="email" type="text" required label={t("email")} />
            <AppField
              name="password"
              type="password"
              required
              label={t("password")}
            />
            <AppField
              name="passwordConfirmation"
              type="password"
              required
              label={t("checkPassword")}
            />
          </AppForm>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <Button
            type="submit"
            size="lg"
            variant="default"
            form={registerFormName}
            className="w-full"
          >
            {t("submit")}
          </Button>
        </CardFooter>
      </Card>

      <p className="mx-auto flex gap-1">
        {t("signInLinkLinkDescription")}
        <span>
          <Link href="/auth/signin" className="underline">
            {t("signInLink")}.
          </Link>
        </span>
      </p>
    </div>
  )
}

const RegisterFormSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
    passwordConfirmation: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        params: { type: "checkPassword" },
        path: ["passwordConfirmation"],
      })
    }
  })

type FormSchemaType = typeof RegisterFormSchema

const registerFormName = "registerForm"
