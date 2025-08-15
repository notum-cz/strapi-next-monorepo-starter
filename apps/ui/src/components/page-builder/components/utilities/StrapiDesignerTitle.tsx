"use client"

import { useEffect, useState } from "react"
import { Data } from "@repo/strapi"

interface DesignerTitleConfig {
  originalName: string
  transformations?: string[]
  finalName: string
  animationSpeed: number
  pauseDuration: number
  textColor?: string
  highlightColor?: string
  animationType: "sequence" | "typewriter" | "typewriter-edit"
  comment?: string
  editSteps?: Array<{
    action: "type" | "delete" | "add"
    text?: string
    position?: "start" | "end"
    count?: number
    comment?: string
  }>
}

export function StrapiDesignerTitle({
  component,
}: {
  readonly component: Data.Component<"utilities.designer-title">
}) {
  const config = component.config as DesignerTitleConfig

  if (config.animationType === "typewriter") {
    return <TypewriterAnimation config={config} />
  }

  if (config.animationType === "typewriter-edit") {
    return <TypewriterEditAnimation config={config} />
  }

  return <SequenceAnimation config={config} />
}

function SequenceAnimation({ config }: { config: DesignerTitleConfig }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const sequence = [
    config.originalName,
    ...(config.transformations || []),
    config.finalName,
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sequence.length)
        setIsAnimating(false)
      }, config.animationSpeed || 300)
    }, config.pauseDuration || 2000)

    return () => clearInterval(interval)
  }, [sequence.length, config.animationSpeed, config.pauseDuration])

  const currentText = sequence[currentIndex]
  const isHighlighted = currentIndex === sequence.length - 1
  const sanitizedText = currentText?.replace(/[<>"'&]/g, (match) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "&": "&amp;",
    }
    return entities[match] || match
  })

  return (
    <div className="ml-4 flex items-center">
      <span
        className={`text-lg font-semibold transition-all duration-300 ${
          isAnimating ? "scale-105 opacity-80" : "scale-100 opacity-100"
        }`}
        style={{
          color: isHighlighted
            ? config.highlightColor || "#e67e22"
            : config.textColor || "#2c3e50",
        }}
      >
        {sanitizedText}
      </span>
    </div>
  )
}

function TypewriterAnimation({ config }: { config: DesignerTitleConfig }) {
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [currentTarget, setCurrentTarget] = useState(config.originalName)

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentTarget.length) {
            setDisplayText(currentTarget.slice(0, displayText.length + 1))
          } else {
            setTimeout(() => setIsDeleting(true), config.pauseDuration)
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentTarget((prev) =>
              prev === config.originalName
                ? config.finalName
                : config.originalName
            )
          }
        }
      },
      isDeleting ? config.animationSpeed / 2 : config.animationSpeed
    )

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentTarget, config])

  const isHighlighted =
    currentTarget === config.finalName && displayText === config.finalName
  const sanitizedDisplayText = displayText?.replace(/[<>"'&]/g, (match) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "&": "&amp;",
    }
    return entities[match] || match
  })

  return (
    <div className="ml-4 flex items-center">
      <span
        className="text-lg font-semibold"
        style={{
          color: isHighlighted
            ? config.highlightColor || "#e67e22"
            : config.textColor || "#2c3e50",
        }}
      >
        {sanitizedDisplayText}
        <span
          className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity`}
        >
          |
        </span>
      </span>
    </div>
  )
}

function TypewriterEditAnimation({ config }: { config: DesignerTitleConfig }) {
  const [displayText, setDisplayText] = useState("")
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [cursorPosition, setCursorPosition] = useState(0)

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    if (!config.editSteps || isProcessing) return

    const executeStep = async (stepIndex: number) => {
      if (stepIndex >= config.editSteps.length) {
        // Pause at final result, then restart
        await new Promise<void>((resolve) =>
          setTimeout(resolve, config.pauseDuration * 2)
        )
        setDisplayText("")
        setCurrentStepIndex(0)
        return
      }

      setIsProcessing(true)
      const step = config.editSteps[stepIndex]

      if (step.action === "add" && step.text) {
        // Add characters one by one
        const currentText = displayText
        if (step.position === "start") {
          setCursorPosition(0)
          for (let i = 0; i < step.text.length; i++) {
            await new Promise<void>((resolve) =>
              setTimeout(resolve, config.animationSpeed)
            )
            setDisplayText(step.text.slice(0, i + 1) + currentText)
            setCursorPosition(i + 1)
          }
        } else {
          setCursorPosition(currentText.length)
          for (let i = 0; i < step.text.length; i++) {
            await new Promise<void>((resolve) =>
              setTimeout(resolve, config.animationSpeed)
            )
            setDisplayText(currentText + step.text.slice(0, i + 1))
            setCursorPosition(currentText.length + i + 1)
          }
        }
      } else if (step.action === "delete" && step.count) {
        // Delete characters one by one
        if (step.position === "start") {
          setCursorPosition(step.count)
          for (let i = 0; i < step.count; i++) {
            await new Promise<void>((resolve) =>
              setTimeout(resolve, config.animationSpeed)
            )
            setDisplayText((prev) => {
              const newPos = step.count - i - 1
              setCursorPosition(newPos)
              return prev.slice(0, newPos) + prev.slice(newPos + 1)
            })
          }
        } else {
          setCursorPosition(displayText.length)
          for (let i = 0; i < step.count; i++) {
            await new Promise<void>((resolve) =>
              setTimeout(resolve, config.animationSpeed)
            )
            setDisplayText((prev) => {
              setCursorPosition(prev.length - 1)
              return prev.slice(0, -1)
            })
          }
        }
      }

      // Pause between steps
      await new Promise<void>((resolve) =>
        setTimeout(resolve, config.pauseDuration)
      )
      setIsProcessing(false)
      setCurrentStepIndex(stepIndex + 1)
    }

    executeStep(currentStepIndex)
  }, [
    currentStepIndex,
    config.editSteps,
    config.animationSpeed,
    config.pauseDuration,
    displayText,
    isProcessing,
  ])

  const sanitizedDisplayText = displayText?.replace(/[<>"'&]/g, (match) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "&": "&amp;",
    }
    return entities[match] || match
  })

  const textBeforeCursor = sanitizedDisplayText.slice(0, cursorPosition)
  const textAfterCursor = sanitizedDisplayText.slice(cursorPosition)

  return (
    <div className="ml-4 flex items-center">
      <span
        className="text-lg font-semibold"
        style={{
          color: config.textColor || "#2c3e50",
        }}
      >
        {textBeforeCursor}
        <span
          className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity`}
        >
          |
        </span>
        {textAfterCursor}
      </span>
    </div>
  )
}

StrapiDesignerTitle.displayName = "StrapiDesignerTitle"

export default StrapiDesignerTitle
