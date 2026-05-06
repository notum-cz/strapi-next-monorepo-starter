import { emailConfig } from "./plugins/email"
import { tipTapEditorConfig } from "./plugins/tiptap"
import { uploadConfig } from "./plugins/upload"

export default ({ env }) => {
  return {
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

    upload: uploadConfig(env),

    email: emailConfig(env),

    "tiptap-editor": tipTapEditorConfig(),
  }
}
