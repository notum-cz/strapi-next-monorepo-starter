import { useState } from "react"
import { Button, Flex } from "@strapi/design-system"
import {
  unstable_useContentManagerContext,
  useNotification,
} from "@strapi/strapi/admin"

const JOBS = [
  {
    endpoint: "/api/internal-job/fullpaths/recalculate/all",
    label: "Recalculate all fullpaths",
    jobType: "RECALCULATE_FULLPATH",
    successMessage: "All fullPaths have been successfully recalculated.",
    errorMessage: "Something went wrong while recalculating fullPaths.",
  },
  {
    endpoint: "/api/internal-job/redirects/create/all",
    label: "Create all redirects",
    jobType: "CREATE_REDIRECT",
    successMessage: "All redirects have been successfully created.",
    errorMessage: "Something went wrong while creating redirects.",
  },
]

const InternalJobsRunActions = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const { slug } = unstable_useContentManagerContext()
  const { toggleNotification } = useNotification()

  if (slug !== "api::internal-job.internal-job") {
    return null
  }

  const runJob = async (jobType: string) => {
    const ok = confirm(
      "Are you sure you want to run this job? This may take some time and during that it will affect the performance of Strapi."
    )

    if (!ok) {
      return
    }

    setLoading(true)

    const job = JOBS.find((j) => j.jobType === jobType)!

    const response = await fetch(job.endpoint, { method: "POST" })
    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      toggleNotification({ message: job.errorMessage, type: "danger" })
      console.error("An error occured during job execution: ", job, data)
      return
    }

    toggleNotification({ message: job.successMessage, type: "success" })

    setTimeout(() => window.location.reload(), 1500)
  }

  return (
    <Flex gap={3}>
      {JOBS.map((job) => (
        <Button
          key={job.jobType}
          onClick={() => runJob(job.jobType)}
          loading={loading}
          variant="secondary"
        >
          {job.label}
        </Button>
      ))}
    </Flex>
  )
}

export default InternalJobsRunActions
