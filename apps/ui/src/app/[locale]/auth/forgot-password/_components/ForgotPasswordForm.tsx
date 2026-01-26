"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useRouter } from "@/lib/navigation"
import { useUserMutations } from "@/hooks/useUserMutations"
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

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword")
  const router = useRouter()
  const { toast } = useToast()
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
        toast({ variant: "default", description: t("passwordChangeEmailSent") })
        form.reset()
        router.push("/auth/signin")
      },
      onError: (error) => {
        // This happens only on unexpected errors (e.g. network issues)
        const errorMessage = error?.message
        const displayMessage =
          errorMessage ?? t("errors.failedToSendPasswordResetEmail")

        toast({ variant: "destructive", description: displayMessage })
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
          variant="default"
          form={forgotPasswordFormName}
          disabled={forgotPasswordMutation.isPending}
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

const forgotPasswordFormName = "forgottenPasswordForm"
