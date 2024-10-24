import { setRequestLocale } from "next-intl/server"

import { PageProps } from "@/types/next"

import { getAuth } from "@/lib/auth"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Link } from "@/lib/navigation"
import { Button } from "@/components/ui/button"

export default async function ProfilePage({ params }: PageProps) {
  removeThisWhenYouNeedMe("ProfilePage")
  setRequestLocale(params.locale)

  const session = await getAuth()

  return (
    <section>
      <h1 className="text-xl">
        Hello, <strong>{session?.user.name} ❤️</strong>
      </h1>
      <br />
      <Button asChild variant="outline">
        <Link href="/">Go home</Link>
      </Button>
    </section>
  )
}
