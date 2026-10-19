"use client"

import { useEffect } from "react"

export function useRepeatedAnchorScroll() {
  useEffect(() => {
    const scrollToRepeatedAnchor = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return
      }

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]")
      if (!anchor) return

      const linkTarget = anchor.getAttribute("target")
      if (linkTarget && linkTarget !== "_self") return

      const targetUrl = new URL(anchor.href, location.href)
      const currentUrl = new URL(location.href)

      // Handle only repeat clicks on the current fragment.
      if (
        !targetUrl.hash ||
        targetUrl.hash !== currentUrl.hash ||
        targetUrl.origin !== currentUrl.origin ||
        targetUrl.pathname !== currentUrl.pathname ||
        targetUrl.search !== currentUrl.search
      ) {
        return
      }

      const id = decodeURIComponent(targetUrl.hash.slice(1))
      const element =
        document.getElementById(id) ?? document.getElementsByName(id)[0]
      if (!element) return

      event.preventDefault()
      // Cancel an active smooth scroll so the next one is not dropped.
      scrollTo({ top: scrollY, behavior: "instant" })
      element.scrollIntoView({ behavior: "smooth" })
    }

    document.addEventListener("click", scrollToRepeatedAnchor, {
      capture: true,
    })

    return () =>
      document.removeEventListener("click", scrollToRepeatedAnchor, true)
  }, [])
}
