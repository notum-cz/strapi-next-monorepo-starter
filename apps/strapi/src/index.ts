import type { Core } from "@strapi/strapi"

import { registerPopulatePageMiddleware } from "./documentMiddlewares/page"
import { registerAdminUserSubscriber } from "./lifeCycles/adminUser"
import { registerUserSubscriber } from "./lifeCycles/user"
import { generateDynamicZoneConfig } from "./populateDynamicZone"

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
    registerAdminUserSubscriber({ strapi })
    registerUserSubscriber({ strapi })

    // Generate dynamic zone populate configuration at startup to avoid doing it on the fly during requests. The result is cached in memory and can be accessed via getPopulateDynamicZoneConfig function.
    generateDynamicZoneConfig()

    // Register Documents API middleware for dynamic zone population
    registerPopulatePageMiddleware({ strapi })
  },
}
