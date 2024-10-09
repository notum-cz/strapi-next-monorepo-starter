import Link from "next/link"
import { Attribute } from "@repo/strapi"

import { Container } from "@/components/elementary/Container"
import { NewsletterForm } from "@/components/elementary/forms/NewsletterForm"

export function Newsletter({
  component,
}: {
  readonly component: Attribute.GetDynamicZoneValue<
    Attribute.DynamicZone<["sections.newsletter"]>
  >[number]
}) {
  return (
    <div className="bg-blue-light pb-10">
      <Container className="flex flex-col justify-between gap-y-10 lg:flex-row">
        <div className="flex w-full max-w-[510px] flex-1 flex-col gap-10">
          <h1 className="text-3xl font-bold">{component.title}</h1>
          <p>{component.description}</p>
        </div>
        <div className="flex w-full max-w-[560px] flex-1 items-end align-bottom">
          <div className="w-fll mt-1 flex w-full flex-col gap-1">
            <NewsletterForm />
            <div className="mt-2 flex items-center">
              {component.gdpr && component.gdpr.href && (
                <Link
                  className="text-blue-700 underline"
                  href={component.gdpr.href}
                >
                  {component.gdpr.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
