"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { MoveRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const createNewsletterFormSchema = (t: (arg: string) => string) =>
  z.object({
    email: z.string().min(1, t("email.required")).email(t("email.invalid")),
  })

type FormSchemaType = z.infer<ReturnType<typeof createNewsletterFormSchema>>

const newsletterForm = "newsletterForm"

export function NewsletterForm() {
  const t = useTranslations("newsletter")
  const NewsletterFormSchema = createNewsletterFormSchema(t)

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(NewsletterFormSchema),
    mode: "onBlur",
    reValidateMode: "onSubmit",
    defaultValues: { email: "" },
  })

  async function onSubmit(values: FormSchemaType) {
    // TODO: Add submit logic
    // eslint-disable-next-line no-console
    console.log("Form submitted", values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id={newsletterForm}
        className="w-full"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem className="mb-8">
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t("email.placeholder")}
                    className={`h-14 rounded-md bg-white pr-16 ${
                      fieldState.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : ""
                    }`}
                    aria-label="email"
                  />
                </FormControl>
                <Button
                  type="submit"
                  className="absolute top-1/2 right-3 aspect-square w-8 -translate-y-1/2 rounded-md bg-gradient-to-r from-red-600 to-red-700 p-0 shadow-md hover:scale-[1.02] hover:from-red-700 hover:to-red-800 hover:shadow-lg"
                  aria-label="Submit form"
                >
                  <MoveRight className="size-4" />
                </Button>
                {fieldState.error && (
                  <div className="animate-in slide-in-from-top-1 absolute -bottom-6 left-0 text-sm font-medium text-red-600 duration-200">
                    {fieldState.error.message}
                  </div>
                )}
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
