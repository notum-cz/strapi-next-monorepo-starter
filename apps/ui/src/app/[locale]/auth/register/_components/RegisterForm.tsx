"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { PASSWORD_MIN_LENGTH } from "@/lib/constants"
import { Link } from "@/lib/navigation"
import Strapi from "@/lib/strapi"
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

export function RegisterForm() {
  const t = useTranslations("auth.register")
  const { toast } = useToast()

  const { mutate, isSuccess } = useMutation({
    mutationFn: (values: {
      username: string
      email: string
      password: string
      firstName: string
      lastName: string
    }) =>
      Strapi.fetchAPI(
        `/auth/local/register`,
        undefined,
        {
          body: JSON.stringify(values),
          method: "POST",
        },
        { omitAuthorization: true }
      ),
  })

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(RegisterFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
      firstName: "",
      lastName: "",
    },
  })

  async function onSubmit(values: z.infer<FormSchemaType>) {
    mutate(
      {
        username: values.email,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      },
      {
        onError: (error) => {
          const errorMap = {
            "already taken": t("errors.emailUsernameTaken"),
          } as const

          let errorMessage = t("errors.unexpectedError")

          if (error instanceof Error) {
            const errorKey = Object.keys(errorMap).find(
              (key): key is keyof typeof errorMap =>
                error.message?.includes(key)
            )

            errorMessage = errorKey ? errorMap[errorKey] : errorMessage
          }

          toast({
            variant: "destructive",
            description: errorMessage,
          })
        },
      }
    )
  }

  if (isSuccess) {
    // This message is relevant if system requires email verification
    // If user is `confirmed` immediately, this message is not needed
    // and user should be redirected to sign in page
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
            <AppField
              name="firstName"
              type="text"
              required
              label={t("firstName")}
            />
            <AppField
              name="lastName"
              type="text"
              required
              label={t("lastName")}
            />
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
    firstName: z.string().min(1),
    lastName: z.string().min(1),
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
