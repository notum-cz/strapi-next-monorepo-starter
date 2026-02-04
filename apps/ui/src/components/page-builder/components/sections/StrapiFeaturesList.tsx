import { Data } from "@repo/strapi-types"

import { cn } from "@/lib/styles"
import CkEditorRenderer from "@/components/elementary/ck-editor"
import { Container } from "@/components/elementary/Container"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"

export function StrapiFeaturesList({
  component,
}: {
  readonly component: Data.Component<"sections.features-list">
}) {
  const { title, description, features, listStyle, image } = component
  const listContainerClassNames = getListContainerClassNames(listStyle)
  const isBoxGrid = listStyle === "boxGrid"
  const isLastChildCentered =
    isBoxGrid && features && (features.length - 1) % 3 === 0

  return (
    <section>
      <Container className="flex flex-col gap-6 md:gap-10 lg:flex-row">
        {image && image.position === "left" ? (
          <div className="min-size-[500px] relative flex w-full flex-1 shrink-0 overflow-clip rounded-3xl">
            <StrapiBasicImage
              component={image.image}
              fill
              className="object-cover object-top-left"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-6">
          <CkEditorRenderer htmlContent={title} />
          <CkEditorRenderer htmlContent={description} />
          <div
            className={cn(
              "mt-16",
              isLastChildCentered && "lg:[&>*:last-child]:col-start-2",
              listContainerClassNames,
              !isBoxGrid && !image && "mx-auto max-w-[720px]"
            )}
          >
            {features?.map((feature) => (
              <FeatureItem
                key={feature.id}
                item={feature}
                listStyle={listStyle}
              />
            ))}
          </div>
        </div>
        {image && image.position === "right" ? (
          <div className="min-size-[500px] relative flex w-full flex-1 shrink-0 overflow-clip rounded-3xl">
            <StrapiBasicImage
              component={image.image}
              fill
              className="object-cover object-top-left"
            />
          </div>
        ) : null}
      </Container>
    </section>
  )
}

const getListContainerClassNames = (
  listStyle: Data.Component<"sections.features-list">["listStyle"]
) => {
  switch (listStyle) {
    case "boxGrid":
      return "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 "
    case "grid":
      return "grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16"
    default:
      return " flex flex-col gap-y-9"
  }
}

function FeatureItem({
  item,
  listStyle,
}: {
  item: Data.Component<"shared.image-with-title-and-description">
  listStyle: Data.Component<"sections.features-list">["listStyle"]
}) {
  const { title, description, image } = item
  const isBoxGrid = listStyle === "boxGrid"
  return (
    <div
      className={cn(
        "flex gap-4",
        isBoxGrid &&
          "cursor-default rounded-[2rem] border bg-white p-8 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md"
      )}
    >
      {image && !isBoxGrid ? (
        <StrapiBasicImage
          component={image}
          height={image.height ?? 40}
          width={image.width ?? 40}
          className="object-contain"
        />
      ) : null}
      <div className="flex flex-col gap-4">
        {image && isBoxGrid ? (
          <StrapiBasicImage
            component={image}
            height={28}
            width={28}
            className="object-contain"
          />
        ) : null}
        <CkEditorRenderer htmlContent={title} />
        <CkEditorRenderer htmlContent={description} />
      </div>
    </div>
  )
}
