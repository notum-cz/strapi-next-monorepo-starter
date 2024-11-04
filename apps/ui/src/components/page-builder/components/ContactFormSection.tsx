import { Schema } from "@repo/strapi"

import { Container } from "@/components/elementary/Container"
import { ContactForm } from "@/components/elementary/forms/ContactForm"

export function ContactFormSection({
  component,
}: {
  readonly component: Schema.Attribute.ComponentValue<
    "sections.contact-form",
    false
  >
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
          <ContactForm
            gdpr={{
              href: component.gdpr?.href ?? undefined,
              label: component.gdpr?.label ?? undefined,
              newTab: component.gdpr?.newTab ?? false,
            }}
          />
        </div>
      </Container>
    </div>
  )
}
