import { useEffect, useState } from "react"
import { Button, Flex } from "@strapi/design-system"
import {
  getFetchClient,
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

const InternalJobsActions = () => {
  const [runningJob, setRunningJob] = useState<string | null>(null)
  const [hasAnyRows, setHasAnyRows] = useState<boolean | null>(null) // null = loading
  const { toggleNotification } = useNotification()
  const { post, get } = getFetchClient()
  const ctx = unstable_useContentManagerContext()
  const { model: uid } = ctx || {}

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await get(
          `/content-manager/collection-types/${uid}?fields=id&page=1&pageSize=1`
        )
        const total =
          res?.data?.meta?.pagination?.total ??
          res?.data?.pagination?.total ??
          res?.data?.results?.length ??
          0

        setHasAnyRows(total > 0)
      } catch (e) {
        setHasAnyRows(false)
        console.error("Failed to fetch InternalJob count:", e)
      }
    }
    fetchCount()
  }, [])

  const runJob = async (jobType: string) => {
    if (runningJob) return

    const ok = confirm(
      "Are you sure you want to run this job? This may take some time and during that it will affect the performance of Strapi."
    )
    if (!ok) return

    const job = JOBS.find((j) => j.jobType === jobType)!
    setRunningJob(jobType)

    try {
      await post(job.endpoint)
      toggleNotification({ message: job.successMessage, type: "success" })
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      toggleNotification({ message: job.errorMessage, type: "danger" })
      console.error("An error occurred during job execution: ", job, error)
    } finally {
      setRunningJob(null)
    }
  }

  if (hasAnyRows === null) return null

  return (
    <Flex gap={3}>
      {JOBS.map((job) => {
        const isThisLoading = runningJob === job.jobType
        const isAnyRunning = runningJob !== null

        return (
          <Button
            key={job.jobType}
            onClick={() => runJob(job.jobType)}
            loading={isThisLoading}
            disabled={!hasAnyRows || (isAnyRunning && !isThisLoading)}
            variant="secondary"
          >
            {job.label}
          </Button>
        )
      })}
    </Flex>
  )
}

export default InternalJobsActions
