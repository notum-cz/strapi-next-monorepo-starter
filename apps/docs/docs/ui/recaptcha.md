# reCAPTCHA v3

reCAPTCHA helpers are pre-configured in:

```txt
apps/ui/src/lib/recaptcha.ts
```

Required env vars:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
```

Wrap forms in `ReCaptchaProvider`, execute with `useReCaptcha`, and validate server-side with `verifyRecaptcha`.

```tsx
import { verifyRecaptcha } from "@/lib/recaptcha"

export const submitContactUsForm = async (payload: FormData) => {
  const token = payload.get("recaptchaToken")
  if (!(await verifyRecaptcha(token))) throw new Error("Invalid reCAPTCHA")
}
```

```tsx
import { ReCaptchaProvider } from "next-recaptcha-v3"
import { getEnvVar } from "@/lib/env-vars"
;<ReCaptchaProvider reCaptchaKey={getEnvVar("NEXT_PUBLIC_RECAPTCHA_SITE_KEY")}>
  <ContactUsForm />
</ReCaptchaProvider>
```
