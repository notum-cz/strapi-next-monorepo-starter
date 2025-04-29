"use client"

import { useEffect } from "react"

import { useRouter } from "@/lib/navigation"

/**
 * This component reloads the application when an update from Strapi is reported. This is useful for the sidebar preview
 * in case of Growth or EE plans.
 *
 * I did not have access to either of these at the time of writing, so I am unable to validate if this works correctly.
 *
 * It does not impact the static preview in Community version of Strapi, as user has to leave the preview in order to change content.
 */
function StrapiPreviewListener() {
  const router = useRouter()
  useEffect(() => {
    const handleMessage = async (message: MessageEvent<any>) => {
      if (
        /**
         * Filters events emitted through the postMessage() API
         *
         * We should also check that the origin is from Strapi, but we do not want the URL in the client-side bundle.
         * We do not support embedding of other sites at the moment, so I think we should be good with the message type
         * for the time being.
         *  */
        // message.origin === env.STRAPI_URL &&
        message.data.type === "strapiUpdate"
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
export default StrapiPreviewListener
