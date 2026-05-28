---
sidebar_position: 7
---

# Email Providers

Email provider configuration lives in [`config/plugins/email.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/plugins/email.ts).

Mailgun has priority. Mailtrap is the development fallback. Selection is based on which environment variables are present.

## Mailgun

Provider: `@strapi/provider-email-mailgun`.

Production default:

```bash
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_EMAIL=
MAILGUN_HOST=https://api.eu.mailgun.net
```

`MAILGUN_EMAIL` is used as both from and reply-to.

## Mailtrap

Provider: `@strapi/provider-email-nodemailer`.

Development/testing provider. It captures emails in a Mailtrap inbox without sending them to real recipients:

```bash
MAILTRAP_USER=
MAILTRAP_PASS=
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_EMAIL=
```

`MAILTRAP_EMAIL` is used as both from and reply-to.

Restart Strapi after changing email provider environment variables.

## Account Activation

The `afterCreate` lifecycle in [`src/lifeCycles/user.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/src/lifeCycles/user.ts) sends an account activation email only when `CLIENT_ACCOUNT_ACTIVATION_URL` is set.

If email delivery fails, the error is logged and registration continues.
