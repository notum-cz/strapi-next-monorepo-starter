import "server-only"

import type { Data } from "@repo/strapi-types"

import { Container } from "@/components/elementary/Container"
import { ContactForm } from "@/components/elementary/forms/ContactForm"
import { Typography } from "@/components/typography"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import type { PageBuilderComponentProps } from "@/types/general"

export function StrapiContactForm({
  component,
}: PageBuilderComponentProps & {
  component: Data.Component<"forms.contact-form">
}) {
  removeThisWhenYouNeedMe("StrapiContactForm")

  return (
    <div id="form-section">
      <Container className="flex flex-col gap-10 lg:gap-20">
        <div className="flex flex-1">
          <div className="mx-auto flex max-w-100 flex-col gap-10 text-center">
            {component.title && (
              <Typography tag="h3">{component.title}</Typography>
            )}
            {component.description && (
              <Typography>{component.description}</Typography>
            )}
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-180 flex-1">
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
