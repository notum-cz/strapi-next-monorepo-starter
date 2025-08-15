"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useContactForm } from "@/hooks/useAppForm"
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
  const contactFormMutation = useContactForm()

  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(ContactFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { name: "", email: "", message: "" },
  })

  const onSubmit = (values: z.infer<FormSchemaType>) => {
    contactFormMutation.mutate(values, {
      onSuccess: () => {
        toast({
          variant: "default",
          description: t("success"),
        })
        form.reset()
      },
    })
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
      <AppForm
        form={form}
        onSubmit={onSubmit}
        id={contactFormName}
        className="w-full space-y-6"
      >
        <AppField
          name="name"
          type="text"
          required
          label={t("name")}
          placeholder={t("namePlaceholder")}
          containerClassName="space-y-2"
          fieldClassName="h-12 px-4 bg-white border-gray-300 rounded-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
        />
        <AppField
          name="email"
          type="email"
          autoComplete="email"
          required
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          containerClassName="space-y-2"
          fieldClassName="h-12 px-4 bg-white border-gray-300 rounded-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
        />
        <AppTextArea
          name="message"
          type="text"
          required
          label={t("message")}
          aria-label="contact-message"
          containerClassName="space-y-2"
          fieldClassName="min-h-32 p-4 bg-white border-gray-300 rounded-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 resize-none"
        />
      </AppForm>

      <div className="mt-8 space-y-4">
        {gdpr?.href && (
          <div className="flex flex-col items-start gap-1 text-sm text-gray-600 sm:flex-row sm:items-center">
            <span>{t("gdpr")}</span>
            <AppLink
              openExternalInNewTab={gdpr.newTab}
              className="font-medium text-blue-600 underline-offset-2 transition-colors duration-200 hover:text-blue-700 hover:underline"
              href={gdpr?.href}
            >
              {gdpr.label || t("gdprLink")}
            </AppLink>
          </div>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-lg bg-blue-600 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          form={contactFormName}
          isLoading={contactFormMutation.isPending}
        >
          {contactFormMutation.isPending
            ? t("sending") || "Sending..."
            : t("submit")}
        </Button>
      </div>

      {contactFormMutation.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {contactFormMutation.error.message === "Internal Server Error"
              ? "Sorry, there was a problem sending your message. Please try again later."
              : contactFormMutation.error.message ||
                "Something went wrong. Please try again."}
          </p>
        </div>
      )}
    </div>
  )
}

const ContactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  message: z
    .string()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters"),
})

type FormSchemaType = typeof ContactFormSchema

export const contactFormName = "contactForm"
