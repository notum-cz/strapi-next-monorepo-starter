import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { SetPasswordForm } from "@/app/[locale]/auth/activate/_components/SetPasswordForm"

export default function ResetPasswordPage() {
  removeThisWhenYouNeedMe("ResetPasswordPage")

  return <SetPasswordForm />
}
