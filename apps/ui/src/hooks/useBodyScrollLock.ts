"use client"

import { useEffect } from "react"

// Detect iOS devices using modern APIs
const isIosDevice =
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1))

export const useBodyScrollLock = (
  lock: boolean,
  targetElement?: HTMLElement
) => {
  useEffect(() => {
    if (typeof document === "undefined") return

    if (!lock || !targetElement) return

    if (isIosDevice) {
      // iOS: Use position fixed approach
      const { scrollY, scrollX } = window
      const originalPosition = document.body.style.position
      const originalTop = document.body.style.top
      const originalLeft = document.body.style.left

      document.body.style.position = "fixed"
      document.body.style.top = `${-scrollY}px`
      document.body.style.left = `${-scrollX}px`

      // Cleanup
      return () => {
        const y = -Number.parseInt(document.body.style.top, 10)
        const x = -Number.parseInt(document.body.style.left, 10)

        document.body.style.position = originalPosition
        document.body.style.top = originalTop
        document.body.style.left = originalLeft

        typeof window !== "undefined" ? window?.scrollTo(x, y) : null
      }
    }

    // Non-iOS: Use overflow hidden
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // Cleanup
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [lock, targetElement])
}
