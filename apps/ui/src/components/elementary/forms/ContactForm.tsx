"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import Strapi from "@/lib/strapi"
import AppLink from "@/components/elementary/AppLink"
import { AppField } from "@/components/forms/AppField"
import { AppForm } from "@/components/forms/AppForm"
import { AppTextArea } from "@/components/forms/AppTextArea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function ContactForm({
  gdpr,
}: Readonly<{
  gdpr?: { href?: string; label?: string; newTab?: boolean }
}>) {
  const t = useTranslations("contactForm")
  const { toast } = useToast()

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(ContactFormSchema),
    mode: "onBlur",
    reValidateMode: "onSubmit",
    defaultValues: { name: "", email: "", message: "" },
  })

  const mutation = useMutation({
    mutationFn: (values: z.infer<FormSchemaType>) => {
      const path = Strapi.getStrapiApiPathByUId("api::subscriber.subscriber")
      return Strapi.fetchAPI(path, undefined, {
        method: "POST",
        body: JSON.stringify({ data: values }),
      })
    },
    onSuccess: () => {
      toast({
        variant: "default",
        description: t("success"),
      })
      form.reset()
    },
  })

  const onSubmit = (values: z.infer<FormSchemaType>) => {
    mutation.mutate(values)
  }

  return (
    <div className="flex w-full flex-col">
      <AppForm
        form={form}
        onSubmit={onSubmit}
        id={contactFormName}
        className="w-full"
      >
        <AppField
          name="name"
          type="text"
          required
          label={t("name")}
          placeholder={t("namePlaceholder")}
        />
        <AppField
          name="email"
          type="text"
          autoComplete="email"
          required
          label={t("email")}
          placeholder={t("emailPlaceholder")}
        />
        <AppTextArea
          name="message"
          type="text"
          required
          label={t("message")}
          aria-label="contact-message"
        />
      </AppForm>
      <div className="flex w-full flex-col gap-4">
        {gdpr?.href && (
          <div className="mt-5 flex flex-col items-center sm:flex-row">
            <p>{t("gdpr")}</p>
            <AppLink
              openExternalInNewTab={gdpr.newTab}
              className="p-0 pl-1 font-medium"
              href={gdpr?.href}
            >
              {gdpr.label || t("gdprLink")}
            </AppLink>
          </div>
        )}

        <Button
          type="submit"
          className="mt-4 w-full"
          size="lg"
          form={contactFormName}
        >
          {t("submit")}
        </Button>
      </div>

      {mutation.error && (
        <div className="text-center text-red-500">
          <p>{mutation.error.message || t("error")}</p>
        </div>
      )}
    </div>
  )
}

const ContactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().min(1),
  message: z.string().min(10),
})

type FormSchemaType = typeof ContactFormSchema

export const contactFormName = "contactForm"
