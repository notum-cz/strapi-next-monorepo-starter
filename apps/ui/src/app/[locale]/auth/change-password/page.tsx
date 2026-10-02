import { setRequestLocale } from "next-intl/server"
import { use } from "react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import type { ExtendedPageProps } from "@/types/next"

import { ChangePasswordForm } from "./_components/ChangePasswordForm"

export default function ChangePasswordPage({
  params,
}: ExtendedPageProps<"/[locale]/auth/change-password">) {
  removeThisWhenYouNeedMe("ChangePasswordPage")

  const { locale } = use(params)

  setRequestLocale(locale)

  return <ChangePasswordForm />
}
