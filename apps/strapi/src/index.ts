import type { Core } from "@strapi/strapi"

// Must stay first so configured telemetry exporters initialize before the rest
// of the server is loaded.
import "./instrumentation"
import { registerPopulatePageMiddleware } from "./documentMiddlewares/page"
import { registerAutoRevalidateMiddleware } from "./documentMiddlewares/revalidate"
import { registerAdminUserSubscriber } from "./lifeCycles/adminUser"
import { registerUserSubscriber } from "./lifeCycles/user"
import { getPopulateDynamicZoneConfig } from "./populateDynamicZone"
import { logger } from "./utils/logging"

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register() {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    logger.info("Strapi bootstrap started")

    registerAdminUserSubscriber({ strapi })
    registerUserSubscriber({ strapi })

    // Generate dynamic zone populate configuration at startup to avoid doing it on the fly during requests.
    getPopulateDynamicZoneConfig()

    // Register Documents API middleware for dynamic zone population
    registerPopulatePageMiddleware({ strapi })
    // Register automatic frontend revalidation middleware for content changes
    registerAutoRevalidateMiddleware({ strapi })

    logger.info("Strapi bootstrap completed")
  },
}
