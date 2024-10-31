import { setRequestLocale } from "next-intl/server"

import { PageProps } from "@/types/next"

import { getAuth } from "@/lib/auth"
import { Link } from "@/lib/navigation"
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ConfigurationExample } from "./_components/Configuration"

// export async function generateMetadata({ params }: PageProps) {
//   return getMetadataFromStrapi({ pageUrl, locale: params.locale })
// }

export default async function RootPage({ params }: PageProps) {
  const session = await getAuth()

  // Enable static rendering
  setRequestLocale(params.locale)

  return (
    <div className="space-y-10">
      <ErrorBoundary
        customErrorTitle="Configuration wasn't fetched from Strapi."
        showErrorMessage
      >
        <ConfigurationExample />
      </ErrorBoundary>

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
              <Link href="/profile">Profile page</Link>
            </Button>
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
