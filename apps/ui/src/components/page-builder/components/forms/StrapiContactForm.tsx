import { Data } from "@repo/strapi-types"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"
import { ContactForm } from "@/components/elementary/forms/ContactForm"
import { Typography } from "@/components/typography"

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
              <Typography tag="h3">{component.title}</Typography>
            )}
            {component.description && (
              <Typography>{component.description}</Typography>
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
