"use client"

import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Link, useRouter } from "@/lib/navigation"
import { useErrorMessage } from "@/hooks/useErrorMessage"
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

export function SignInForm() {
  const t = useTranslations("auth.signIn")
  const { toast } = useToast()
  const { getErrorMessage } = useErrorMessage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/profile"

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(SignInFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<FormSchemaType>) {
    const res = await signIn("credentials", {
      ...values,
      callbackUrl,
      redirect: false,
    })

    if (!res?.error) {
      router.refresh()
      setTimeout(() => router.push(callbackUrl), 300)
    } else {
      toast({
        variant: "destructive",
        description: getErrorMessage("auth.signIn.errors", res.error),
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
            placeholder="dev@notum.cz"
          />
          <AppField
            name="password"
            type="password"
            // https://www.chromium.org/developers/design-documents/create-amazing-password-forms/
            autoComplete="current-password"
            required
            label={t("password")}
            placeholder="Password1"
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
