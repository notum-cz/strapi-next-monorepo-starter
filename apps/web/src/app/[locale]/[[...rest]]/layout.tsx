import { LayoutProps } from "@/types/next"

export default async function Layout({ children }: LayoutProps) {
  return <div className="flex items-center pb-8">{children}</div>
}
