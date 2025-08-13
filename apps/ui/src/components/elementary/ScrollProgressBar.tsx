"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    setScrollProgress(0)
  }, [pathname])

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

    window.addEventListener("scroll", updateScrollProgress)
    updateScrollProgress()

    // Recalculate after page fully loads
    setTimeout(updateScrollProgress, 100)

    return () => window.removeEventListener("scroll", updateScrollProgress)
  }, [])

  return (
    <div className="bg-white/90" style={{ height: "3px" }}>
      <div
        className="h-full bg-[var(--color-brand-red)]/90 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}
