import type { EnvGetter } from "../../types/internals"

const prepareMailgunEmailConfig = (env: EnvGetter) => {
  const mailgunApiKey = env("MAILGUN_API_KEY")
  const mailgunDomain = env("MAILGUN_DOMAIN")
  const mailgunRequirementsOk = [mailgunApiKey, mailgunDomain].every(
    (req) => req != null && req !== ""
  )

  if (mailgunRequirementsOk) {
    const email = env("MAILGUN_EMAIL") || "noreply@example.com"

    return {
      provider: "mailgun",
      providerOptions: {
        key: mailgunApiKey,
        domain: mailgunDomain,
        url: env("MAILGUN_HOST", "https://api.eu.mailgun.net"),
      },
      settings: {
        defaultFrom: email,
        defaultReplyTo: email,
      },
    }
  }
}

const prepareMailtrapEmailConfig = (env: EnvGetter) => {
  const mailtrapUser = env("MAILTRAP_USER")
  const mailtrapPass = env("MAILTRAP_PASS")
  const mailtrapRequirementsOk = [mailtrapUser, mailtrapPass].every(
    (req) => req != null && req !== ""
  )

  if (mailtrapRequirementsOk) {
    const email = env("MAILTRAP_EMAIL") || "noreply@example.com"

    return {
      provider: "nodemailer",
      providerOptions: {
        host: env("MAILTRAP_HOST", "sandbox.smtp.mailtrap.io"),
        port: Number.parseInt(env("MAILTRAP_PORT", "2525"), 10),
        auth: {
          user: mailtrapUser,
          pass: mailtrapPass,
        },
      },
      settings: {
        defaultFrom: email,
        defaultReplyTo: email,
      },
    }
  }
}

export function emailConfig(env: EnvGetter) {
  const configs = {
    mailgun: prepareMailgunEmailConfig(env),
    mailtrap: prepareMailtrapEmailConfig(env),
  }

  if (configs.mailgun) {
    console.warn("Using Mailgun for emails.")
  }

  if (configs.mailtrap) {
    console.warn("Using Mailtrap for emails.")
  }

  if (!configs.mailgun && !configs.mailtrap) {
    console.warn(
      "No email provider is configured. Email functionality will not work."
    )
  }

  return {
    config: configs.mailgun ?? configs.mailtrap ?? null,
  }
}
