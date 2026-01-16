"use client"

import { useSearchParams } from "next/navigation"
import { authClient } from "@/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { getAuthErrorMessage } from "@/lib/general-helpers"
import { Link } from "@/lib/navigation"
import { AppField } from "@/components/forms/AppField"
import { AppForm } from "@/components/forms/AppForm"
import { UseSearchParamsWrapper } from "@/components/helpers/UseSearchParamsWrapper"
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

export function SignInForm() {
  return (
    <UseSearchParamsWrapper>
      <SuspensedSignInForm />
    </UseSearchParamsWrapper>
  )
}

function SuspensedSignInForm() {
  const t = useTranslations("auth.signIn")
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(SignInFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<FormSchemaType>) {
    try {
      // Call Better Auth custom endpoint
      // The path /sign-in-strapi becomes signInStrapi (kebab-case to camelCase)
      const result = await authClient.signInStrapi({
        email: values.email,
        password: values.password,
      })

      if (result.data) {
        // Use full page navigation to ensure session is reloaded
        // This is more reliable than client-side navigation for session updates
        window.location.href = callbackUrl
      } else if (result.error) {
        const message = getAuthErrorMessage(
          result.error.message,
          t("errors.CredentialsSignin")
        )

        toast({
          variant: "destructive",
          description: message,
        })
      }
    } catch (error: any) {
      const rawMessage =
        typeof error === "string" ? error : (error as Error)?.message
      const message = getAuthErrorMessage(
        rawMessage,
        t("errors.CredentialsSignin")
      )

      toast({
        variant: "destructive",
        description: message,
      })
    }
  }

  return (
    <Card className="m-auto w-[400px]">
      <CardHeader>
        <CardTitle>{t("header")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <AppForm form={form} onSubmit={onSubmit} id={signInFormName}>
          <AppField
            name="email"
            type="text"
            autoComplete="email"
            required
            label={t("email")}
          />
          <AppField
            name="password"
            type="password"
            // https://www.chromium.org/developers/design-documents/create-amazing-password-forms/
            autoComplete="current-password"
            required
            label={t("password")}
          />
        </AppForm>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        <Button type="submit" size="lg" variant="default" form={signInFormName}>
          {t("submit")}
        </Button>

        <div className="mt-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/forgot-password">{t("forgotPassword")}?</Link>
          </Button>

          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/register">{t("createAccount")}</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

const SignInFormSchema = z.object({
  email: z.string().min(1).email().or(z.string().min(1)),
  password: z.string().min(1),
})

type FormSchemaType = typeof SignInFormSchema

const signInFormName = "signInForm"
