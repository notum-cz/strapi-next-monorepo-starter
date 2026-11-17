import { setRequestLocale } from "next-intl/server"
import { use } from "react"

import { SetPasswordForm } from "@/app/[locale]/auth/activate/_components/SetPasswordForm"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import type { ExtendedPageProps } from "@/types/next"

export default function ResetPasswordPage({
  params,
  searchParams,
}: ExtendedPageProps<
  "/[locale]/auth/reset-password",
  { code?: string | string[] }
>) {
  removeThisWhenYouNeedMe("ResetPasswordPage")

  const { locale } = use(params)
  const { code } = use(searchParams)

  setRequestLocale(locale)

  return <SetPasswordForm code={typeof code === "string" ? code : undefined} />
}
