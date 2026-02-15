"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

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
import { useUserMutations } from "@/hooks/useUserMutations"
import { PASSWORD_MIN_LENGTH } from "@/lib/constants"
import { Link } from "@/lib/navigation"
import { cn } from "@/lib/styles"

// To enable email confirmation, Strapi Users-Permissions plugin must be configured (e.g. email provider, redirect URL)
// http://localhost:1337/admin/settings/users-permissions/advanced-settings
const ENABLE_EMAIL_CONFIRMATION = false

export function RegisterForm() {
  const t = useTranslations("auth.register")
  const { registerMutation } = useUserMutations()

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
    registerMutation.mutate(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          // User is registered AND signed in automatically!

          if (!ENABLE_EMAIL_CONFIRMATION) {
            // Use full page navigation to ensure session is reloaded
            globalThis.location.href = "/"
          }
        },
        onError: (error) => {
          const errorMessage = error?.message

          // Try to match common errors to translated messages
          const errorMap = {
            "already taken": t("errors.emailUsernameTaken"),
          } as const

          const errorKey = Object.keys(errorMap).find(
            (key): key is keyof typeof errorMap =>
              errorMessage?.includes(key) ?? false
          )

          const displayMessage = errorKey
            ? errorMap[errorKey]
            : (errorMessage ?? t("errors.unexpectedError"))

          toast.error(displayMessage)
        },
      }
    )
  }

  if (registerMutation.isSuccess && ENABLE_EMAIL_CONFIRMATION) {
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
            variant="outline"
            form={registerFormName}
            className="w-full cursor-pointer"
            disabled={registerMutation.isPending}
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
