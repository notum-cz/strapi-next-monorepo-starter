"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { SocialButtons } from "@/app/[locale]/auth/signin/_components/SocialButtons"
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
import { useUserMutations } from "@/hooks/useUserMutations"
import { Link } from "@/lib/navigation"

export function SignInForm({ strapiUrl }: { strapiUrl?: string }) {
  return (
    <UseSearchParamsWrapper>
      <SuspensedSignInForm strapiUrl={strapiUrl} />
    </UseSearchParamsWrapper>
  )
}

function SuspensedSignInForm({ strapiUrl }: { strapiUrl?: string }) {
  const t = useTranslations("auth.signIn")
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"
  const { signInMutation } = useUserMutations()

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(SignInFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<FormSchemaType>) {
    signInMutation.mutate(values, {
      onSuccess: () => {
        // Use full page navigation to ensure session is reloaded
        // This is more reliable than client-side navigation for session updates
        globalThis.location.href = callbackUrl
      },
      onError: (error) => {
        const errorMessage = error?.message

        // Try to match common errors to translated messages
        const errorMap = {
          "identifier or password": t("errors.CredentialsSignin"),
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
    })
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
        <Button
          type="submit"
          size="lg"
          variant="outline"
          form={signInFormName}
          disabled={signInMutation.isPending}
          className="w-full cursor-pointer"
        >
          {signInMutation.isPending ? t("signingIn") : t("submit")}
        </Button>

        {strapiUrl && <SocialButtons strapiUrl={strapiUrl} />}

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
