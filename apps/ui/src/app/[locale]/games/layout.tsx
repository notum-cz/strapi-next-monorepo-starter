import { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s / Games - Notum Technologies",
    default: "Games - Notum Technologies",
  },
}

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
