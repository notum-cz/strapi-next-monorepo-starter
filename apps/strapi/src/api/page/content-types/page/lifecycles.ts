import { LifecycleEventType } from "../../../../../types/internals"
import { PAGES_HIERARCHY_ENABLED } from "../../../../utils/constants"
import { handleHierarchyBeforeCreate } from "../../../../utils/hierarchy"

export default {
  async beforeCreate(event: LifecycleEventType<"beforeCreate">) {
    if (PAGES_HIERARCHY_ENABLED) {
      await handleHierarchyBeforeCreate(event, "api::page.page")
    }
  },
}
