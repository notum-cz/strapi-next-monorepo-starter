import Script from "next/script"

import type { Data } from "@repo/strapi"

const StructuredData = ({
  structuredData,
}: {
  structuredData: Data.Component<"seo-utilities.seo">["structuredData"]
}) => {
  if (structuredData) {
    return (
      <Script
        id="articleStructuredData"
        strategy="afterInteractive"
        type="application/ld+json"
        // this content is limited to Strapi and cannot be sourced from users
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    )
  }

  return null
}

export default StructuredData
