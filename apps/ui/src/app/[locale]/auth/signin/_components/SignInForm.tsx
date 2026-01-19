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

        <div className="relative my-4 w-full">
          <div className="relative flex justify-center border-b text-xs uppercase">
            Or continue with
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => {
            const connectUrl = new URL(
              "/api/connect/github",
              process.env.STRAPI_URL
            )
            window.location.href = connectUrl.toString()
          }}
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          Sign in with GitHub
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
