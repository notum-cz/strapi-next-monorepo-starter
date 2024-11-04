import { Schema } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Faq({
  component,
}: {
  readonly component: Schema.Attribute.ComponentValue<"sections.faq", false>
}) {
  removeThisWhenYouNeedMe("Faq")

  return (
    <section>
      <Container className="py-8">
        <div className="flex flex-col items-center">
          <h2 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
            {component.title}
          </h2>

          <p className="mb-6 text-center tracking-tight text-gray-900">
            {component.subTitle}
          </p>

          {component.accordions && (
            <div className="w-full max-w-2xl">
              <Accordion type="single" collapsible className="w-full">
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
