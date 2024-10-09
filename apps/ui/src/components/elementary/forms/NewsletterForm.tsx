"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { MoveRight } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AppField } from "@/components/forms/AppField"
import { AppForm } from "@/components/forms/AppForm"
import { Button } from "@/components/ui/button"

export function NewsletterForm() {
  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(NewsletterFormSchema),
    mode: "onBlur",
    reValidateMode: "onSubmit",
    defaultValues: { email: "" },
  })

  async function onSubmit(values: z.infer<FormSchemaType>) {
    // TODO - Add your own logic here
  }

  return (
    <div className="flex w-full flex-col">
      <AppForm
        form={form}
        onSubmit={onSubmit}
        id={newsletterForm}
        className="w-full"
      >
        <div className="relative">
          <AppField
            name="email"
            type="text"
            autoComplete="email"
            required
            fieldClassName="h-14 bg-white"
            aria-label="email"
          />
          <Button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 md:w-fit"
            form={newsletterForm}
            aria-label="Submit form"
          >
            <MoveRight className="size-4" />
          </Button>
        </div>
      </AppForm>
    </div>
  )
}

const NewsletterFormSchema = z.object({
  email: z.string().email(),
})

type FormSchemaType = typeof NewsletterFormSchema

export const newsletterForm = "newsletterForm"