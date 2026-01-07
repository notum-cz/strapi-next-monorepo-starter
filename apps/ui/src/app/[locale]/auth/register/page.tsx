import { use } from "react"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

import { RegisterForm } from "./_components/RegisterForm"

export default function RegisterPage({
  params,
}: PageProps<"/[locale]/auth/register">) {
  removeThisWhenYouNeedMe("RegisterPage")

  const { locale } = use(params) as { locale: Locale }

  setRequestLocale(locale)

  return <RegisterForm />
}
