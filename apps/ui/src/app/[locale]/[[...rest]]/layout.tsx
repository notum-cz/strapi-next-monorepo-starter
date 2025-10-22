export default function Layout({
  children,
}: LayoutProps<"/[locale]/[[...rest]]">) {
  return <div className="flex items-center pb-8">{children}</div>
}
