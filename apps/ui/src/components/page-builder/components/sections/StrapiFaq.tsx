import { Data } from "@repo/strapi"

import { Container } from "@/components/elementary/Container"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function StrapiFaq({
  component,
}: {
  readonly component: Data.Component<"sections.faq">
}) {
  return (
    <section>
      <Container className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-left md:mb-12 md:text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              {component.title}
            </h2>
            {component.subTitle && (
              <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
                {component.subTitle}
              </p>
            )}
          </div>

          {component.accordions && (
            <Accordion type="single" collapsible className="space-y-4">
              {component.accordions.map((x) => (
                <AccordionItem
                  key={x.id}
                  value={x.id.toString()}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
                >
                  <AccordionTrigger className="cursor-pointer px-6 py-4 text-left font-semibold text-gray-900 transition-colors duration-200 hover:text-gray-700">
                    {x.question}
                  </AccordionTrigger>
                  <AccordionContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down leading-relaxed text-gray-600">
                    <div className="px-6 pb-4">{x.answer}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </Container>
    </section>
  )
}

StrapiFaq.displayName = "StrapiFaq"

export default StrapiFaq
