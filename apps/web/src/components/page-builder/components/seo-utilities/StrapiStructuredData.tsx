import type { Data } from "@repo/strapi"

export const StrapiStructuredData = ({
  structuredData,
}: {
  structuredData: Data.Component<"seo-utilities.seo">["structuredData"]
}) => {
  if (structuredData) {
    // we need to use a plain `script` tag instead of the `Script` component
    // `Script` component is optimized by Next, which works against us in this case
    // - if id is specified, the content will not be updated on client navigation
    // - if no id is specified, a new script tag will be added with the new content, which schema validators are not able to parse.
    // `script` tag is properly re-rendered and replaced with the new content
    return (
      <script id="articleStructuredData" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    )
  }

  return null
}

StrapiStructuredData.displayName = "StructuredData"

export default StrapiStructuredData
