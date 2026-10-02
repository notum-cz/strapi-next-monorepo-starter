import { setRequestLocale } from "next-intl/server"
import { use } from "react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import type { ExtendedPageProps } from "@/types/next"

import { RegisterForm } from "./_components/RegisterForm"

export default function RegisterPage({
  params,
}: ExtendedPageProps<"/[locale]/auth/register">) {
  removeThisWhenYouNeedMe("RegisterPage")

  const { locale } = use(params)

  setRequestLocale(locale)

  return <RegisterForm />
}
