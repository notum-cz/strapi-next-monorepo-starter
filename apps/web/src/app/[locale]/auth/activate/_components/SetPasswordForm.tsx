"use client"

import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { PASSWORD_MIN_LENGTH } from "@/lib/constants"
import { useRouter } from "@/lib/navigation"
import { useUserMutations } from "@/hooks/useUser"
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

export function SetPasswordForm({ accountActivation = false }) {
  const t = useTranslations(
    accountActivation ? "auth.accountActivation" : "auth.resetPassword"
  )
  const { toast } = useToast()
  const { resetPasswordMutation } = useUserMutations()

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(SetPasswordFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { password: "", passwordConfirmation: "" },
  })

  const router = useRouter()
  const params = useSearchParams()
  const code = params.get("code") as string

  const onSubmit = (data: z.infer<FormSchemaType>) =>
    resetPasswordMutation.mutate(
      { code, ...data },
      {
        onSuccess: () => {
          toast({
            variant: "default",
            description: t("successfullySet"),
          })
          form.reset()
          router.push("/auth/signin")
        },
      }
    )

  return (
    <Card className="m-auto w-[400px]">
      <CardHeader>
        <CardTitle>{t("header")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <AppForm form={form} onSubmit={onSubmit} id={setPasswordFormName}>
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
          form={setPasswordFormName}
        >
          {t("submit")}
        </Button>
      </CardFooter>
    </Card>
  )
}

const SetPasswordFormSchema = z
  .object({
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

type FormSchemaType = typeof SetPasswordFormSchema

const setPasswordFormName = "setPasswordForm"
