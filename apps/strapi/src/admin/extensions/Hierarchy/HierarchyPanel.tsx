import { Button, Divider, Flex, Modal, Typography } from "@strapi/design-system"
import { useFetchClient, useNotification } from "@strapi/strapi/admin"
import { useCallback, useEffect, useState } from "react"

type FullPathChange = {
  documentId: string
  locale: string
  slug: string
  oldFullPath: string | null
  newFullPath: string
  redirect: null | { source: string; destination: string }
}

function WarningAlert({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      direction="row"
      alignItems="center"
      gap={3}
      paddingLeft={4}
      paddingRight={4}
      paddingTop={3}
      paddingBottom={3}
      background="warning100"
      style={{ border: "1px solid #C67C2C" }}
      hasRadius
    >
      <div style={{ color: "#C67C2C", fontSize: "18px" }}>⚠</div>
      <Typography variant="pi">{children}</Typography>
    </Flex>
  )
}

// Locale is conveyed by the selected locale chip, so the row itself omits it.
function ChangeRow({ change }: { change: FullPathChange }) {
  return (
    <Flex direction="column" alignItems="flex-start" gap={1} width="100%">
      <Typography variant="omega" fontWeight="bold">
        {change.slug}
      </Typography>
      <Typography variant="pi" textColor="neutral800">
        <>
          Fullpath:{" "}
          <span style={{ color: "#D32F2F" }}>
            {change.oldFullPath ?? "(new page)"}
          </span>
          <span style={{ margin: "0 8px" }}>→</span>
          <span style={{ color: "#388E3C", fontWeight: "bold" }}>
            {change.newFullPath}
          </span>
        </>
      </Typography>
      <Typography variant="pi" textColor="neutral800">
        {change.redirect ? (
          <>
            Redirect: {change.redirect.source}
            <span style={{ margin: "0 8px" }}>→</span>
            {change.redirect.destination}
          </>
        ) : (
          "No redirect (newly published page)"
        )}
      </Typography>
      <Divider width="100%" />
    </Flex>
  )
}

function HierarchyPanel() {
  const [changes, setChanges] = useState<FullPathChange[] | null>(null) // null = loading
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  // Locale chips act as toggles filtering which changes the modal lists; all
  // locales are shown by default.
  const [selectedLocales, setSelectedLocales] = useState<Set<string>>(new Set())
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
    const updateChanges = async () => {
      const result = await fetchChanges()

      if (!cancelled) {
        setChanges(result)
      }
    }

    void updateChanges()

    return () => {
      cancelled = true
    }
  }, [fetchChanges])

  if (changes === null) {
    return null
  }

  // Group changes by locale so the confirmation modal can render one chip per
  // locale with its change count.
  const groupedChanges = new Map<string, FullPathChange[]>()
  for (const change of changes) {
    const localeChanges = groupedChanges.get(change.locale) ?? []
    localeChanges.push(change)
    groupedChanges.set(change.locale, localeChanges)
  }
  const changesByLocale = Array.from(groupedChanges)

  const openModal = () => {
    // Reset the locale filter to "all selected" each time the modal opens.
    setSelectedLocales(new Set(changes.map((change) => change.locale)))
    setIsModalOpen(true)
  }

  const toggleLocale = (locale: string) => {
    setSelectedLocales((prev) => {
      const next = new Set(prev)
      if (next.has(locale)) {
        next.delete(locale)
      } else {
        next.add(locale)
      }

      return next
    })
  }

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

  return (
    <Flex direction="column" alignItems="stretch" gap={2} width="100%">
      {/* Separates this custom section from the default Strapi sidebar above */}
      <Divider width="100%" />

      <Typography variant="sigma" textColor="neutral600">
        Page hierarchy
      </Typography>

      <Typography variant="pi" textColor="neutral600">
        {changes.length === 0
          ? "All full paths are up to date."
          : `Pending ${changes.length} full path ${
              changes.length === 1 ? "change" : "changes"
            }`}
      </Typography>

      <Button
        variant="secondary"
        fullWidth
        disabled={changes.length === 0}
        onClick={openModal}
      >
        Update hierarchy
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
            <Modal.Title>Hierarchy recalculation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Flex direction="column" alignItems="stretch" gap={4}>
              <Typography>
                The following changes will be applied. Each page gets a new
                fullPath and a redirect from the old path is created and
                published.
              </Typography>

              <WarningAlert>
                This may take some time and affect Strapi performance.
              </WarningAlert>

              <Flex gap={1} wrap="wrap">
                {changesByLocale.map(([locale, localeChanges]) => (
                  <Button
                    key={locale}
                    size="S"
                    variant={
                      selectedLocales.has(locale) ? "secondary" : "tertiary"
                    }
                    onClick={() => toggleLocale(locale)}
                  >
                    {`${locale.toUpperCase()} (${localeChanges.length})`}
                  </Button>
                ))}
              </Flex>

              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {changes
                  .filter((change) => selectedLocales.has(change.locale))
                  .map((change) => (
                    <ChangeRow
                      key={`modal-${change.documentId}-${change.locale}`}
                      change={change}
                    />
                  ))}
              </div>
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close>
              <Button variant="tertiary" disabled={isRunning}>
                Cancel
              </Button>
            </Modal.Close>
            <Button onClick={runRecalculation} loading={isRunning}>
              Apply all changes
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </Flex>
  )
}

export default HierarchyPanel
