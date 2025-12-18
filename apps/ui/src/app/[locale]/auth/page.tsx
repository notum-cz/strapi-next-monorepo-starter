import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { getAuth } from "@/lib/auth"
import { Link } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AuthPage({
  params,
}: PageProps<"/[locale]/auth">) {
  const { locale } = (await params) as { locale: Locale }

  setRequestLocale(locale)

  const session = await getAuth()

  return (
    <div className="space-y-10">
      {session && (
        <Card className="m-auto w-[800px]">
          <CardHeader>
            <CardTitle>Authenticated content</CardTitle>
            <CardDescription>
              This is available only for authenticated users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <strong>Session: </strong> {JSON.stringify(session.user)}
          </CardContent>
          <CardFooter className="flex w-full items-center justify-end gap-3">
            <Button asChild>
              <Link href="/auth/change-password">Change password</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signout">Logout</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
