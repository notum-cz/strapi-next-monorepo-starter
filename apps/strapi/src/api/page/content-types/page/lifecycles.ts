import { LifecycleEventType } from "../../../../../types/internals"
import { handleDocumentBeforeCreate } from "../../../../utils/hierarchy"

export default {
  async beforeCreate(event: LifecycleEventType<"beforeCreate">) {
    await handleDocumentBeforeCreate(event, "api::page.page")
  },
}
