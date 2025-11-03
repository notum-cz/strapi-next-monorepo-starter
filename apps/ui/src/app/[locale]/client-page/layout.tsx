export default function Layout({
  children,
}: LayoutProps<"/[locale]/client-page">) {
  return <div className="flex items-center py-8">{children}</div>
}
