import type { Core } from "@strapi/strapi"

// Must stay first so configured telemetry exporters initialize before the rest
// of the server is loaded.
import "./instrumentation"
import { registerAutoRevalidateMiddleware } from "./documentMiddlewares/revalidate"
import { registerAdminUserSubscriber } from "./lifeCycles/adminUser"
import { registerUserSubscriber } from "./lifeCycles/user"
import { logger } from "./utils/logging"

export default {
  /**
   * An asynchronous register function that runs before
   * your app is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register() {},

  /**
   * An asynchronous bootstrap function that runs before
   * your app gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    logger.info("Strapi bootstrap started")

    registerAdminUserSubscriber({ strapi })
    registerUserSubscriber({ strapi })

    // Register automatic frontend revalidation middleware for content changes
    registerAutoRevalidateMiddleware({ strapi })

    logger.info("Strapi bootstrap completed")
  },
}
