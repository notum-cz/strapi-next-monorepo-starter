import { use } from "react"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { SetPasswordForm } from "@/app/[locale]/auth/activate/_components/SetPasswordForm"

export default function ResetPasswordPage({
  params,
}: PageProps<"/[locale]/auth/reset-password">) {
  removeThisWhenYouNeedMe("ResetPasswordPage")

  const { locale } = use(params) as { locale: Locale }

  setRequestLocale(locale)

  return <SetPasswordForm />
}
