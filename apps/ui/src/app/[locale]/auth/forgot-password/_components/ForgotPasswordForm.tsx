"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

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
import { useUserMutations } from "@/hooks/useUserMutations"
import { useRouter } from "@/lib/navigation"

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword")
  const router = useRouter()
  const { forgotPasswordMutation } = useUserMutations()

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: z.infer<FormSchemaType>) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        // This flow happens even if the email does not exist in the system
        toast.success(t("passwordChangeEmailSent"))
        form.reset()
        router.push("/auth/signin")
      },
      onError: (error) => {
        // This happens only on unexpected errors (e.g. network issues)
        const errorMessage = error?.message
        const displayMessage =
          errorMessage ?? t("errors.failedToSendPasswordResetEmail")

        toast.error(displayMessage)
      },
    })
  }

  return (
    <Card className="m-auto w-[400px]">
      <CardHeader>
        <CardTitle>{t("header")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <AppForm form={form} onSubmit={onSubmit} id={forgotPasswordFormName}>
          <AppField name="email" type="email" required label={t("email")} />
        </AppForm>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          size="lg"
          variant="outline"
          form={forgotPasswordFormName}
          disabled={forgotPasswordMutation.isPending}
          className="w-full cursor-pointer"
        >
          {t("submit")}
        </Button>
      </CardFooter>
    </Card>
  )
}

const ForgotPasswordFormSchema = z.object({
  email: z.string().min(1).email(),
})

type FormSchemaType = typeof ForgotPasswordFormSchema

// eslint-disable-next-line sonarjs/no-hardcoded-passwords
const forgotPasswordFormName = "forgottenPasswordForm"
