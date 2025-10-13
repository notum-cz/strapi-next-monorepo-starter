import { Data } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"
import { ContactForm } from "@/components/elementary/forms/ContactForm"
import Heading from "@/components/typography/Heading"
import Paragraph from "@/components/typography/Paragraph"

export function StrapiContactForm({
  component,
}: {
  readonly component: Data.Component<"forms.contact-form">
}) {
  removeThisWhenYouNeedMe("StrapiContactForm")

  return (
    <div className="bg-white" id="form-section">
      <Container className="flex flex-col gap-10 lg:flex-row lg:gap-40">
        <div className="flex flex-1">
          <div className="flex max-w-[400px] flex-col gap-10">
            {component.title && (
              <Heading variant="heading3" tag="h3">
                {component.title}
              </Heading>
            )}
            {component.description && (
              <Paragraph>{component.description}</Paragraph>
            )}
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

StrapiContactForm.displayName = "StrapiContactForm"

export default StrapiContactForm
