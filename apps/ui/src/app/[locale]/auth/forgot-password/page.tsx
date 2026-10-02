import { setRequestLocale } from "next-intl/server"
import { use } from "react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import type { ExtendedPageProps } from "@/types/next"

import { ForgotPasswordForm } from "./_components/ForgotPasswordForm"

export default function ForgotPasswordPage({
  params,
}: ExtendedPageProps<"/[locale]/auth/forgot-password">) {
  removeThisWhenYouNeedMe("ForgotPasswordPage")

  const { locale } = use(params)

  setRequestLocale(locale)

  return <ForgotPasswordForm />
}
