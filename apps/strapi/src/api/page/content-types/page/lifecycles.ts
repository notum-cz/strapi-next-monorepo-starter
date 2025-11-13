import { LifecycleEventType } from "../../../../../types/internals"
import { handleHierarchyBeforeCreate } from "../../../../utils/hierarchy"

export default {
  async beforeCreate(event: LifecycleEventType<"beforeCreate">) {
    await handleHierarchyBeforeCreate(event, "api::page.page")
  },
}
