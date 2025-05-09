import { env } from "@/env.mjs"

const verificationUrl = "https://www.google.com/recaptcha/api/siteverify"

export const verifyRecaptcha = async (token?: string): Promise<boolean> => {
  "use server"

  if (!token || !env.RECAPTCHA_SECRET_KEY) {
    return false
  }

  try {
    const response = await fetch(verificationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.RECAPTCHA_SECRET_KEY,
        response: token,
      }).toString(),
      cache: "no-store",
    })

    const data = await response.json()

    // reCAPTCHA v3 returns a score (0.0 - 1.0), usually accept > 0.5
    return data.success && data.score >= 0.5
  } catch (error) {
    return false
  }
}
