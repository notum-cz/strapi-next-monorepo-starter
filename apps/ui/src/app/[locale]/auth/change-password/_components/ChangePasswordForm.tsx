"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { PASSWORD_MIN_LENGTH } from "@/lib/constants"
import { useRouter } from "@/lib/navigation"
import Strapi from "@/lib/strapi"
import { AppField } from "@/components/forms/AppField"
import { AppForm } from "@/components/forms/AppForm"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export function ChangePasswordForm() {
  const t = useTranslations("auth.changePassword")
  const router = useRouter()
  const { toast } = useToast()

  const { mutate } = useMutation({
    mutationFn: (values: {
      currentPassword: string
      password: string
      passwordConfirmation: string
    }) => {
      return Strapi.fetchAPI(
        `/auth/change-password`,
        undefined,
        {
          body: JSON.stringify(values),
          method: "POST",
          next: { revalidate: 0 },
        },
        {
          translateKeyPrefixForErrors: "auth.changePassword.errors",
        }
      )
    },
  })

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(ChangePasswordFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirmation: "",
    },
  })

  const onSubmit = (data: z.infer<FormSchemaType>) =>
    mutate(data, {
      onSuccess: () => {
        toast({
          variant: "default",
          description: t("successfullyChanged"),
        })
        form.reset()
        router.push("/")
      },
    })

  return (
    <Card className="m-auto w-[400px]">
      <CardHeader>
        <CardTitle>{t("header")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <AppForm form={form} onSubmit={onSubmit} id={changePasswordFormName}>
          <AppField
            name="currentPassword"
            type="password"
            required
            label={t("currentPassword")}
          />
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
            label={t("confirmPassword")}
          />
        </AppForm>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          size="lg"
          variant="default"
          form={changePasswordFormName}
        >
          {t("submit")}
        </Button>
      </CardFooter>
    </Card>
  )
}

const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .superRefine((pwd, ctx) => {
        if (!/\d/.test(pwd)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { type: "passwordNumber" },
          })
        }
      }),
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

type FormSchemaType = typeof ChangePasswordFormSchema

const changePasswordFormName = "changePasswordForm"
