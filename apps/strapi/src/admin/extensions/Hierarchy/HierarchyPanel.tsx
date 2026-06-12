import {
  Badge,
  Button,
  Divider,
  Flex,
  Modal,
  Typography,
} from "@strapi/design-system"
import { useFetchClient, useNotification } from "@strapi/strapi/admin"
import { useCallback, useEffect, useState } from "react"

type FullPathChange = {
  documentId: string
  locale: string
  slug: string
  oldFullPath: string | null
  newFullPath: string
  redirect: { source: string; destination: string } | null
}

function ChangeRow({ change }: { change: FullPathChange }) {
  return (
    <Flex direction="column" alignItems="flex-start" gap={1} width="100%">
      <Flex gap={2}>
        <Badge>{change.locale}</Badge>
        <Typography variant="pi" fontWeight="bold">
          {change.slug}
        </Typography>
      </Flex>
      <Typography variant="pi" textColor="neutral800">
        {(change.oldFullPath ?? "(new page)") + " → " + change.newFullPath}
      </Typography>
      <Typography variant="pi" textColor="neutral600">
        {change.redirect
          ? `Redirect: ${change.redirect.source} → ${change.redirect.destination}`
          : "No redirect (newly published page)"}
      </Typography>
      <Divider width="100%" />
    </Flex>
  )
}

function HierarchyPanel() {
  const [changes, setChanges] = useState<FullPathChange[] | null>(null) // null = loading
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const { toggleNotification } = useNotification()
  // `useFetchClient` (unlike `getFetchClient`) memoizes the client, so `get`
  // is referentially stable and the mount effect below runs only once.
  const { get, post } = useFetchClient()

  const fetchChanges = useCallback(async () => {
    try {
      const res = await get("/api/hierarchy/pending-changes")

      return (res?.data?.changes ?? []) as FullPathChange[]
    } catch (error) {
      console.error("Failed to fetch pending hierarchy changes:", error)
      toggleNotification({
        type: "danger",
        message: "Failed to load pending fullPath changes.",
      })

      return [] as FullPathChange[]
    }
  }, [get, toggleNotification])

  useEffect(() => {
    let cancelled = false
    fetchChanges().then((result) => {
      if (!cancelled) {
        setChanges(result)
      }
    })

    return () => {
      cancelled = true
    }
  }, [fetchChanges])

  const runRecalculation = async () => {
    if (isRunning) {
      return
    }

    setIsRunning(true)

    try {
      const res = await post("/api/hierarchy/recalculate")
      const failedCount = res?.data?.failed?.length ?? 0

      if (failedCount > 0) {
        toggleNotification({
          type: "warning",
          message: `Recalculation finished with ${failedCount} failed change(s). Check the Strapi logs.`,
        })
      } else {
        toggleNotification({
          type: "success",
          message: "All fullPaths were recalculated and redirects created.",
        })
      }

      setIsModalOpen(false)
      const updated = await fetchChanges()
      setChanges(updated)
    } catch (error) {
      console.error("Hierarchy recalculation failed:", error)
      toggleNotification({
        type: "danger",
        message: "Something went wrong while recalculating fullPaths.",
      })
    } finally {
      setIsRunning(false)
    }
  }

  if (changes === null) {
    return null
  }

  return (
    <Flex direction="column" alignItems="stretch" gap={2} width="100%">
      <Typography variant="sigma" textColor="neutral600">
        Pending fullPath changes ({changes.length})
      </Typography>

      {changes.length === 0 ? (
        <Typography variant="pi" textColor="neutral600">
          All fullPaths are up to date.
        </Typography>
      ) : (
        changes.map((change) => (
          <ChangeRow
            key={`${change.documentId}-${change.locale}`}
            change={change}
          />
        ))
      )}

      <Button
        variant="secondary"
        fullWidth
        disabled={changes.length === 0}
        onClick={() => setIsModalOpen(true)}
      >
        Recalculate fullPaths &amp; create redirects
      </Button>

      <Modal.Root
        open={isModalOpen}
        onOpenChange={(open: boolean) => {
          // Prevent dismissing (Escape / overlay click) mid-recalculation
          if (!isRunning) {
            setIsModalOpen(open)
          }
        }}
      >
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Confirm fullPath recalculation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Flex direction="column" alignItems="stretch" gap={4}>
              <Typography>
                The following {changes.length} change(s) will be applied. Each
                page gets a new fullPath and a redirect from the old path is
                created and published. This may take some time and affect Strapi
                performance.
              </Typography>
              <Flex direction="column" alignItems="stretch" gap={2}>
                {changes.map((change) => (
                  <ChangeRow
                    key={`modal-${change.documentId}-${change.locale}`}
                    change={change}
                  />
                ))}
              </Flex>
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close>
              <Button variant="tertiary" disabled={isRunning}>
                Cancel
              </Button>
            </Modal.Close>
            <Button onClick={runRecalculation} loading={isRunning}>
              Apply changes
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </Flex>
  )
}

export default HierarchyPanel
