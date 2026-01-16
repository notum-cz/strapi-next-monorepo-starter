export default ({ env }) => {
  const awsS3Config = prepareAwsS3Config(env)
  if (!awsS3Config) {
    console.info(
      "AWS S3 upload configuration is not complete. Local file storage will be used."
    )
  }

  return {
    upload: {
      config: awsS3Config ?? localUploadConfig,
    },

    seo: {
      enabled: true,
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
      config: (() => {
        // For development: Use Mailtrap (free email testing service)
        // For production: Use Mailgun
        const isProduction = env("NODE_ENV") === "production"
        const hasMailgunCreds = env("MAILGUN_API_KEY") && env("MAILGUN_DOMAIN")
        const hasMailtrapCreds = env("MAILTRAP_USER") && env("MAILTRAP_PASS")

        if (isProduction) {
          // Production: Mailgun (required)
          if (!hasMailgunCreds) {
            console.warn(
              "⚠️  Mailgun credentials not found. Email functionality will not work in production."
            )
          }
          return {
            provider: "mailgun",
            providerOptions: {
              key: env("MAILGUN_API_KEY"),
              domain: env("MAILGUN_DOMAIN"),
              url: env("MAILGUN_HOST", "https://api.eu.mailgun.net"),
            },
            settings: {
              defaultFrom: env("MAILGUN_EMAIL"),
              defaultReplyTo: env("MAILGUN_EMAIL"),
            },
          }
        }

        // Development: Use Mailtrap
        if (hasMailtrapCreds) {
          return {
            provider: "nodemailer",
            providerOptions: {
              host: env("MAILTRAP_HOST", "sandbox.smtp.mailtrap.io"),
              port: parseInt(env("MAILTRAP_PORT", "2525"), 10),
              auth: {
                user: env("MAILTRAP_USER"),
                pass: env("MAILTRAP_PASS"),
              },
            },
            settings: {
              defaultFrom: env("MAILGUN_EMAIL") || "noreply@example.com",
              defaultReplyTo: env("MAILGUN_EMAIL") || "noreply@example.com",
            },
          }
        }

        // Fallback to Mailgun in development if Mailtrap not configured
        if (hasMailgunCreds) {
          return {
            provider: "mailgun",
            providerOptions: {
              key: env("MAILGUN_API_KEY"),
              domain: env("MAILGUN_DOMAIN"),
              url: env("MAILGUN_HOST", "https://api.eu.mailgun.net"),
            },
            settings: {
              defaultFrom: env("MAILGUN_EMAIL"),
              defaultReplyTo: env("MAILGUN_EMAIL"),
            },
          }
        }

        return {
          provider: "mailgun",
          providerOptions: {
            key: "",
            domain: "",
            url: "https://api.eu.mailgun.net",
          },
          settings: {
            defaultFrom: "noreply@example.com",
            defaultReplyTo: "noreply@example.com",
          },
        }
      })(),
    },
  }
}

const localUploadConfig: any = {
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

  return undefined
}
