import { unstable_useContentManagerContext } from "@strapi/strapi/admin"

import InternalJobsActions from "./InternalJobActions"

function InternalJobs() {
  const ctx = unstable_useContentManagerContext()
  const { model: uid } = ctx || {}

  // Only render for the InternalJob collection type
  if (uid !== "api::internal-job.internal-job") {
    return null
  }

  return <InternalJobsActions />
}

export default InternalJobs
