"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setScrollProgress(0)
    setShowProgressBar(false)
  }, [pathname])

  useEffect(() => {
    let ticking = false
    const MIN_SCROLL_HEIGHT = 400 // Only show progress bar if there's more than 400px to scroll

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight

      // Only show progress bar if there's meaningful content to scroll
      setShowProgressBar(docHeight > MIN_SCROLL_HEIGHT)

      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(Math.min(100, Math.max(0, scrollPercent)))
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollProgress)
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    // Initial calculation with multiple attempts for better accuracy
    updateScrollProgress()
    setTimeout(updateScrollProgress, 0)
    setTimeout(updateScrollProgress, 50)
    setTimeout(updateScrollProgress, 200)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!showProgressBar) {
    return null
  }

  return (
    <div className="bg-white/90" style={{ height: "3px" }}>
      <div
        className="h-full bg-[var(--color-brand-red)]/90 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}
