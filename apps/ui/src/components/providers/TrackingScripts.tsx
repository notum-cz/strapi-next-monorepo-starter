import Script from "next/script"

import { isDevelopment } from "@/lib/general-helpers"

// eslint-disable-next-line no-unused-vars
const TrackingScriptWrapper = ({
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
}) => {
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

const TrackingScripts = () => {
  return <>{/* Tracking Scrips here */}</>
}

export default TrackingScripts
