"use client"

/**
 * Debug component for testing ISR
 * Add to your page temporarily to see ISR information
 */

import { useState } from "react"

export function ISRDebugInfo() {
  const [isOpen, setIsOpen] = useState(false)

  const revalidateTest = async () => {
    try {
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "x-strapi-webhook-secret": process.env.NEXT_PUBLIC_STRAPI_API_URL
            ? "test-secret"
            : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "games.update",
          data: {
            id: 1,
            slug: "test-game",
            title: "Test Game",
          },
        }),
      })

      const data = await response.json()
      alert(`Revalidation response:\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700"
      >
        {isOpen ? "Close Debug" : "Debug ISR"}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white shadow-xl rounded-lg p-4 min-w-64 text-sm">
          <div className="space-y-3">
            <div>
              <p className="font-bold text-gray-900">Build Time</p>
              <p className="text-gray-600">
                {new Date().toLocaleString()}
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-900">Environment</p>
              <p className="text-gray-600">
                {process.env.NODE_ENV}
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-900">ISR Status</p>
              <p className="text-gray-600">
                Revalidation: 3600s (1 hour)
              </p>
              <p className="text-gray-600">
                Dynamic Params: Enabled
              </p>
            </div>

            <button
              onClick={revalidateTest}
              className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-xs font-medium"
            >
              Test Revalidation
            </button>

            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              <p>💡 Tip: Modify a game in Strapi to test ISR in action</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
