import Script from "next/script"

import { getEnvVar } from "@/lib/env-vars"
import { isDevelopment } from "@/lib/general-helpers"

export function TrackingScriptWrapper({
  id,
  scriptContent,
  scriptOptions,
  ignoreInDevelopment = true,
}: {
  scriptContent: string
  id: string
  scriptOptions: Exclude<
    React.ComponentProps<typeof Script>,
    "id" | "dangerouslySetInnerHTML"
  >
  ignoreInDevelopment?: boolean
}) {
  if (ignoreInDevelopment && isDevelopment()) {
    return null
  }

  return (
    <Script
      id={id}
      dangerouslySetInnerHTML={{ __html: scriptContent }}
      {...scriptOptions}
    />
  )
}

/**
 * Google Tag Manager container loader.
 *
 * Renders nothing when `GTM_ID` is unset, so deployments without a container
 * (and local development) stay untouched.
 */
function GoogleTagManager() {
  const gtmId = getEnvVar("GTM_ID")

  if (!gtmId) {
    return null
  }

  return (
    <>
      <TrackingScriptWrapper
        id="gtm-container"
        scriptOptions={{ strategy: "afterInteractive" }}
        scriptContent={`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      />

      {/* Fallback for visitors with JavaScript disabled */}
      {!isDevelopment() && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      )}
    </>
  )
}

function TrackingScripts() {
  return <GoogleTagManager />
}

export default TrackingScripts
