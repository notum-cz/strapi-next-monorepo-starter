import { unstable_useContentManagerContext } from "@strapi/strapi/admin"

import HierarchyPanel from "./HierarchyPanel"

function Hierarchy() {
  const ctx = unstable_useContentManagerContext()
  const { model: uid } = ctx || {}

  // Only render for the Hierarchy single type
  if (uid !== "api::hierarchy.hierarchy") {
    return null
  }

  return <HierarchyPanel />
}

export default Hierarchy
