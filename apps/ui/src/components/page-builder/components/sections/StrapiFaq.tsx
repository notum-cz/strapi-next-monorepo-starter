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
      <Container className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 lg:text-5xl">
              {component.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {component.subTitle}
            </p>
          </div>

          {component.accordions && (
            <Accordion type="single" collapsible className="space-y-4">
              {component.accordions.map((x) => (
                <AccordionItem 
                  key={x.id} 
                  value={x.id.toString()}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 text-left font-semibold text-gray-900 hover:text-gray-700 cursor-pointer transition-colors duration-200">
                    {x.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="px-6 pb-4">
                      {x.answer}
                    </div>
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
