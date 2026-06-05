---
sidebar_position: 2
---

# reCAPTCHA

reCAPTCHA v3 is a spam and abuse protection service that scores form submissions without showing a user challenge.

reCAPTCHA helpers are pre-configured in:

```txt
apps/ui/src/lib/recaptcha.ts
```

Required env vars:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
```

Wrap forms in `ReCaptchaProvider`, execute with `useReCaptcha`, and validate the returned reCAPTCHA token on the server with `verifyRecaptcha`. The browser only collects the token; the final decision happens in server code before accepting the form action.

## UI Usage

```tsx
import { ReCaptchaProvider } from "next-recaptcha-v3"
import { getEnvVar } from "@/lib/env-vars"

return (
  <ReCaptchaProvider reCaptchaKey={getEnvVar("NEXT_PUBLIC_RECAPTCHA_SITE_KEY")}>
    <ContactUsForm />
  </ReCaptchaProvider>
)
```

```tsx
"use client"

import { useReCaptcha } from "next-recaptcha-v3"
import { submitContactUsForm } from "./actions"

export const ContactUsForm = () => {
  const { executeRecaptcha } = useReCaptcha()

  const submit = async (formData: FormData) => {
    const token = await executeRecaptcha("contact_form")
    formData.set("recaptchaToken", token)

    await submitContactUsForm(formData)
  }

  return <form action={submit}>{/* fields */}</form>
}
```

## Server Validation

```tsx
import { verifyRecaptcha } from "@/lib/recaptcha"

export const submitContactUsForm = async (payload: FormData) => {
  const token = payload.get("recaptchaToken")
  if (!(await verifyRecaptcha(token))) {
    throw new Error("Invalid reCAPTCHA")
  }

  return { success: true }
}
```
