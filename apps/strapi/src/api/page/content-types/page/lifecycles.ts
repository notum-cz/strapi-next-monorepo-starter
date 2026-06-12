import type { LifecycleEventType } from "../../../../../types/internals"
import { handleHierarchyBeforeCreate } from "../../../hierarchy/utils"

export default {
  async beforeCreate(event: LifecycleEventType<"beforeCreate">) {
    await handleHierarchyBeforeCreate(event, "api::page.page")
  },
}
