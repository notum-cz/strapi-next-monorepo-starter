import { Attribute } from "@repo/strapi"

import { Container } from "@/components/elementary/Container"
import { ContactForm } from "@/components/elementary/forms/ContactForm"

export function ContactFormSection({
  component,
}: {
  readonly component: Attribute.GetDynamicZoneValue<
    Attribute.DynamicZone<["sections.contact-form"]>
  >[number]
}) {
  return (
    <div className="bg-white" id="form-section">
      <Container className="flex flex-col gap-10 lg:flex-row lg:gap-40">
        <div className="flex flex-1">
          <div className="flex max-w-[400px] flex-col gap-10">
            {component.title && <p>{component.title}</p>}
            {component.description && <p>{component.description}</p>}
          </div>
        </div>
        <div className="flex flex-1">
          <ContactForm {...component} />
        </div>
      </Container>
    </div>
  )
}
