"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import { SetPasswordForm } from "./_components/SetPasswordForm"

export default function ActivateAccountPage() {
  removeThisWhenYouNeedMe("ActivateAccountPage")

  const t = useTranslations("auth.accountActivation")
  const [formToggled, setFormToggled] = useState(false)
  const params = useSearchParams()

  const code = params.get("code") as string
  const name = params.get("name") as string
  const email = params.get("email") as string

  const title = [t("welcome"), name].join(", ")

  if (formToggled) {
    return <SetPasswordForm accountActivation />
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-12">
      {code != null ? (
        <div>
          <h4 className="text-2xl">{title}!</h4>
          <p className="mb-4 text-base">{t("activateAccount", { email })}</p>
          <Button variant="default" onClick={() => setFormToggled(true)}>
            {t("activate")}
          </Button>
        </div>
      ) : (
        <div>
          <Alert variant="destructive">{t("invalidLink")}</Alert>
        </div>
      )}
    </div>
  )
}
