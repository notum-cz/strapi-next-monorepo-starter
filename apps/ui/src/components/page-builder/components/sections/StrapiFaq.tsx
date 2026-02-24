"server only"

import type { Data } from "@repo/strapi-types"

import { Container } from "@/components/elementary/Container"
import Typography from "@/components/typography"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import type { PageBuilderComponentProps } from "@/types/general"

export function StrapiFaq({
  component,
}: PageBuilderComponentProps & { component: Data.Component<"sections.faq"> }) {
  removeThisWhenYouNeedMe("StrapiFaq")

  return (
    <section>
      <Container className="py-8">
        <div className="flex flex-col items-center gap-6">
          <Typography tag="h2" variant="heading3">
            {component.title}
          </Typography>
          <Typography>{component.subTitle}</Typography>

          {component.accordions && (
            <div className="w-full">
              <Accordion
                type="single"
                collapsible
                className="mx-auto w-full max-w-180"
              >
                {component.accordions.map((x) => (
                  <AccordionItem key={x.id} value={x.id.toString()}>
                    <AccordionTrigger>{x.question}</AccordionTrigger>
                    <AccordionContent>{x.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

StrapiFaq.displayName = "StrapiFaq"

export default StrapiFaq
