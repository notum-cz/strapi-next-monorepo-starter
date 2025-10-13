"use client"

import { useEffect } from "react"

import { hashStringSHA256 } from "@/lib/crypto"
import { useRouter } from "@/lib/navigation"

/**
 * This component reloads the application when an update from Strapi is reported. This is useful for the sidebar preview
 * in case of Growth or EE plans.
 */
function StrapiPreviewWindowChangeListener({
  hashedAllowedReloadOrigin, // to avoid bundling strapi URL, we pass this as a hash from SSR parent
}: {
  hashedAllowedReloadOrigin: string
}) {
  const router = useRouter()

  useEffect(() => {
    const handleMessage = async (message: MessageEvent<any>) => {
      if (
        /**
         * Filters events emitted through the postMessage() API
         *
         * The origin is checked based on a hashed value to avoid sharing the strapi URL to client-side bundle.
         *  */
        message.data.type === "strapiUpdate" && // The order is important -> keep the cheap operations at the beginning of this statement
        (await hashStringSHA256(message.origin)) === hashedAllowedReloadOrigin
      ) {
        router.refresh()
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  return null
}

export default StrapiPreviewWindowChangeListener
