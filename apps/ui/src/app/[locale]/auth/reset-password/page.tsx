import type { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { use } from "react"

import { SetPasswordForm } from "@/app/[locale]/auth/activate/_components/SetPasswordForm"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

export default function ResetPasswordPage({
  params,
  searchParams,
}: PageProps<"/[locale]/auth/reset-password">) {
  removeThisWhenYouNeedMe("ResetPasswordPage")

  const { locale } = use(params) as { locale: Locale }
  const { code } = use(searchParams) as { code?: string }

  setRequestLocale(locale)

  return <SetPasswordForm code={code} />
}
