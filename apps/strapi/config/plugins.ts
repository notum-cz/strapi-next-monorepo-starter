import { readFileSync } from "node:fs"

// @ts-expect-error - Import from monorepo
import colorConfig from "@repo/design-system/tiptap-color-config.json"

export default ({ env }) => {
  const awsS3Config = prepareAwsS3Config(env)
  if (!awsS3Config) {
    console.warn(
      "AWS S3 upload configuration is not complete. Local file storage will be used."
    )
  }

  return {
    upload: {
      config: awsS3Config ?? localUploadConfig,
    },

    "config-sync": {
      enabled: true,
    },

    "users-permissions": {
      config: {
        jwt: {
          expiresIn: "30d", // this value is synced with Better Auth session maxAge
        },
      },
    },

    sentry: {
      enabled: true,
      config: {
        // Only set `dsn` property in production
        dsn: env("NODE_ENV") === "production" ? env("SENTRY_DSN") : null,
        sendMetadata: true,
      },
    },

    email: {
      config: prepareEmailConfig(env),
    },

    "tiptap-editor": {
      enabled: true,
      config: {
        presets: {
          everything: {
            bold: true,
            italic: true,
            strike: true,
            mediaLibrary: true,
            textColor: true,
            highlightColor: true,
            underline: true,
            code: true,
            codeBlock: true,
            blockquote: true,
            bulletList: true,
            orderedList: true,
            history: true,
            heading: { levels: [1, 2, 3, 4, 5, 6] },
            link: true,
            table: { resizable: true },
            textAlign: {
              types: ["heading", "paragraph"],
              alignments: ["left", "center", "right", "justify"],
            },
            superscript: true,
            subscript: true,
          },
          minimal: {
            bold: true,
            italic: true,
            link: true,
          },
          blog: {
            bold: true,
            italic: true,
            heading: { levels: [2, 3, 4] },
            link: true,
            bulletList: true,
            orderedList: true,
            blockquote: true,
            history: true,
          },
        },
        theme: {
          colors: colorConfig,

          css: readFileSync(
            require.resolve("@repo/design-system/tiptap-theme.css"),
            "utf8"
          ),
        },
      },
    },
  }
}

const localUploadConfig: Record<string, unknown> = {
  // Local provider setup
  // https://docs.strapi.io/dev-docs/plugins/upload
  sizeLimit: 250 * 1024 * 1024, // 256mb in bytes,
}

const prepareAwsS3Config = (env) => {
  const awsAccessKeyId = env("AWS_ACCESS_KEY_ID")
  const awsAccessSecret = env("AWS_ACCESS_SECRET")
  const awsRegion = env("AWS_REGION")
  const awsBucket = env("AWS_BUCKET")
  const awsRequirements = [
    awsAccessKeyId,
    awsAccessSecret,
    awsRegion,
    awsBucket,
  ]
  const awsRequirementsOk = awsRequirements.every(
    (req) => req != null && req !== ""
  )

  if (awsRequirementsOk) {
    return {
      provider: "aws-s3",
      providerOptions: {
        baseUrl: env("CDN_URL"),
        rootPath: env("CDN_ROOT_PATH"),
        s3Options: {
          credentials: {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsAccessSecret,
          },
          region: awsRegion,
          params: {
            ACL: env("AWS_ACL", "public-read"),
            signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
            Bucket: awsBucket,
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    }
  }
}

const prepareEmailConfig = (env) => {
  const hasMailgunCreds = env("MAILGUN_API_KEY") && env("MAILGUN_DOMAIN")
  const hasMailtrapCreds = env("MAILTRAP_USER") && env("MAILTRAP_PASS")

  // Mailgun has bigger priority
  // Mailtrap is only for development/testing purposes

  if (hasMailgunCreds) {
    return {
      provider: "mailgun",
      providerOptions: {
        key: env("MAILGUN_API_KEY"),
        domain: env("MAILGUN_DOMAIN"),
        url: env("MAILGUN_HOST", "https://api.eu.mailgun.net"),
      },
      settings: {
        defaultFrom: env("MAILGUN_EMAIL") || "noreply@example.com",
        defaultReplyTo: env("MAILGUN_EMAIL") || "noreply@example.com",
      },
    }
  }

  if (hasMailtrapCreds) {
    return {
      provider: "nodemailer",
      providerOptions: {
        host: env("MAILTRAP_HOST", "sandbox.smtp.mailtrap.io"),
        port: Number.parseInt(env("MAILTRAP_PORT", "2525"), 10),
        auth: {
          user: env("MAILTRAP_USER"),
          pass: env("MAILTRAP_PASS"),
        },
      },
      settings: {
        defaultFrom: env("MAILTRAP_EMAIL") || "noreply@example.com",
        defaultReplyTo: env("MAILTRAP_EMAIL") || "noreply@example.com",
      },
    }
  }

  console.warn(
    "⚠️  No email provider is configured. Email functionality will not work."
  )

  return null
}
