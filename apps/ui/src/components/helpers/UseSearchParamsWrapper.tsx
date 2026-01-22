"use client"

import { Suspense } from "react"

import type { ReactNode, SuspenseProps } from "react"

type UseSearchParamsWrapperProps = {
  children: ReactNode
  suspenseProps?: Omit<SuspenseProps, "children">
}

/**
 * Wraps a component with `<Suspense>`. Hooks which rely on dynamic values (such as search params) cannot be pre-rendered, but it will work without Suspense
 * in `development` mode. This may cause issues once deployed (or within pipelines if it's being statically rendered).
 *
 * This is necessary for components that use `useSearchParams()` when using static exports (`output: "export"`) or static rendering using the dynamic mode.
 * During a static build, there are no search parameters available, so Next.js would be unable to render the component.
 * By wrapping it in `<Suspense>`, we tell React to defer rendering of the component until it's on the client-side,a
 * where search parameters are available.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/use-search-params#static-rendering
 *
 * **SEO Considerations:**
 * The content rendered inside this wrapper will not be visible to crawlers during the initial server-side render.
 * To ensure content is indexed, provide a meaningful `fallback` prop via `suspenseProps`.
 * The fallback content will be rendered on the server and visible to crawlers.
 *
 * @param {UseSearchParamsWrapperProps} props - The props for the component.
 * @param {ReactNode} props.children - The component to wrap. This component can use `useSearchParams`.
 * @param {Omit<SuspenseProps, "children">} [props.suspenseProps] - Props to pass to the underlying `<Suspense>` component, like `fallback`.
 */
export const UseSearchParamsWrapper = ({
  children,
  suspenseProps,
}: UseSearchParamsWrapperProps) => {
  return <Suspense {...suspenseProps}>{children}</Suspense>
}
