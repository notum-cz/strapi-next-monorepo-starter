"use client"

import { driver } from "driver.js"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import "driver.js/dist/driver.css"

export function GuidedTour() {
  const t = useTranslations("guidedTour")

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenGuidedTour")
    if (hasSeenTour) return

    let isUnmounting = false

    const driverObj = driver({
      showProgress: true,
      nextBtnText: t("nextBtn"),
      prevBtnText: t("prevBtn"),
      doneBtnText: t("doneBtn"),
      progressText: t("progressText"),
      steps: [
        {
          element: "body",
          popover: {
            title: t("welcomeTitle"),
            description: t("welcomeDescription"),
            side: "top",
            align: "start",
          },
        },
        {
          element: "nav",
          popover: {
            title: t("navTitle"),
            description: t("navDescription"),
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "main",
          popover: {
            title: t("mainTitle"),
            description: t("mainDescription"),
            side: "top",
            align: "start",
          },
        },
        {
          element: "footer",
          popover: {
            title: t("footerTitle"),
            description: t("footerDescription"),
            side: "top",
            align: "start",
          },
        },
      ],
      onDestroyed: () => {
        if (!isUnmounting) {
          localStorage.setItem("hasSeenGuidedTour", "true")
        }
      },
    })

    // slight delay to let elements render
    const timeout = setTimeout(() => {
      if (!isUnmounting) {
        driverObj.drive()
      }
    }, 1000)

    return () => {
      isUnmounting = true
      clearTimeout(timeout)
      driverObj.destroy()
    }
  }, [t])

  return null
}
