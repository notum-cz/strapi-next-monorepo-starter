import { Data } from "@repo/strapi-types"

import CkEditorRenderer from "@/components/elementary/ck-editor"
import { Container } from "@/components/elementary/Container"
import Heading from "@/components/typography/Heading"

export function StrapiStatistics({
  component,
}: {
  readonly component: Data.Component<"sections.statistics">
}) {
  return (
    <section>
      <Container className="flex flex-col justify-between gap-6 lg:flex-row">
        {component.figures?.map((figure) => (
          <StrapiFigure key={figure.id} component={figure} />
        ))}
      </Container>
    </section>
  )
}

function StrapiFigure({
  component,
}: {
  readonly component: Data.Component<"shared.figure">
}) {
  const { number, prefix, suffix, description } = component
  return (
    <div className="flex flex-col items-center">
      <Heading className="text-center">
        {prefix}
        {number}
        {suffix}
      </Heading>
      <CkEditorRenderer htmlContent={description} />
    </div>
  )
}
