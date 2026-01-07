import { use } from "react"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

import { ChangePasswordForm } from "./_components/ChangePasswordForm"

export default function ChangePasswordPage({
  params,
}: PageProps<"/[locale]/auth/change-password">) {
  removeThisWhenYouNeedMe("ChangePasswordPage")

  const { locale } = use(params) as { locale: Locale }

  setRequestLocale(locale)

  return <ChangePasswordForm />
}
