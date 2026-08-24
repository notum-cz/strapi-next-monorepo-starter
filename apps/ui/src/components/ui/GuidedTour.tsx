"use client"

import { driver } from "driver.js"
import { useEffect } from "react"
import "driver.js/dist/driver.css"

export function GuidedTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenGuidedTour")
    if (hasSeenTour) return

    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "body",
          popover: {
            title: "Welcome to the Live Demo!",
            description:
              "This is a guided tour of the Strapi + Next.js Monorepo Starter. Let's see what's included.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "nav",
          popover: {
            title: "Dynamic Navbar",
            description:
              "This navbar is entirely driven by a Strapi Single Type. You can change links, dropdowns, and buttons directly in the CMS.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "main",
          popover: {
            title: "Page Builder Sections",
            description:
              "The content on this page is composed using Strapi's dynamic zones. Each section maps directly to a React component in the UI.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "footer",
          popover: {
            title: "Strapi Footer",
            description:
              "Like the navbar, the footer is a Single Type managed in Strapi.",
            side: "top",
            align: "start",
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem("hasSeenGuidedTour", "true")
      },
    })

    // slight delay to let elements render
    setTimeout(() => {
      driverObj.drive()
    }, 1000)
  }, [])

  return null
}
