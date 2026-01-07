import { use } from "react"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

import { ForgotPasswordForm } from "./_components/ForgotPasswordForm"

export default function ForgotPasswordPage({
  params,
}: PageProps<"/[locale]/auth/forgot-password">) {
  removeThisWhenYouNeedMe("ForgotPasswordPage")

  const { locale } = use(params) as { locale: Locale }

  setRequestLocale(locale)

  return <ForgotPasswordForm />
}
