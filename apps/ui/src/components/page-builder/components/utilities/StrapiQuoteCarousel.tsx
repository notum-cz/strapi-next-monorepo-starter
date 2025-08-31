"use client"

import { useEffect, useState } from "react"
import { Data } from "@repo/strapi"

interface StrapiQuoteCarouselProps {
  readonly component:
    | Data.Component<"utilities.quote-carousel">
    | Data.Component<"sections.quote-carousel">
  readonly className?: string
  readonly title?: string
}

export function StrapiQuoteCarousel({
  component,
  className,
  title,
}: StrapiQuoteCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const currentQuote = component.quotes?.[currentIndex] || null

  useEffect(() => {
    if (!component.quotes?.length) return

    const calculateReadingTime = (text: string) => {
      const words = text.split(" ").length
      const readingSpeed = 300 // words per minute
      const baseTime = (words / readingSpeed) * 60 * 1000 // convert to ms
      const minTime = 4000 // minimum 4 seconds
      const maxTime = 20000 // maximum 20 seconds
      return Math.max(minTime, Math.min(maxTime, baseTime * 1.5)) // 1.5x reading time for contemplation
    }

    let timeoutId: NodeJS.Timeout

    const scheduleNext = () => {
      if (component.quotes.length <= 1) return

      const nextInterval = calculateReadingTime(
        component.quotes[currentIndex]?.text || ""
      )
      timeoutId = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % component.quotes.length)
          setIsVisible(true)
          scheduleNext()
        }, 500)
      }, nextInterval)
    }

    scheduleNext()

    return () => clearTimeout(timeoutId)
  }, [component.quotes, currentIndex])

  if (!currentQuote?.text) return null

  return (
    <div className={className}>
      {title && (
        <h2 className="mb-8 text-center text-2xl font-bold">{title}</h2>
      )}
      <div
        className="flex min-h-[120px] flex-col justify-between rounded-lg p-6"
        style={{ backgroundColor: "var(--color-gray-100)" }}
      >
        <div
          className={`transition-all duration-500 ease-in-out ${isVisible ? "translate-y-0 transform opacity-100" : "-translate-y-2 transform opacity-0"}`}
        >
          <p className="italic">&ldquo;{currentQuote.text}&rdquo;</p>
        </div>
        {currentQuote.author && (
          <div
            className={`transition-all delay-100 duration-500 ease-in-out ${isVisible ? "translate-y-0 transform opacity-100" : "translate-y-2 transform opacity-0"}`}
          >
            <p className="text-right font-medium">— {currentQuote.author}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StrapiQuoteCarousel
