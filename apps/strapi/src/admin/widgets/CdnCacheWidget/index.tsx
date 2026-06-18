import {
  Box,
  Button,
  Field,
  Flex,
  Radio,
  Textarea,
  Typography,
} from "@strapi/design-system"
import { Cloud } from "@strapi/icons"
import { getFetchClient, useNotification } from "@strapi/strapi/admin"
import { useState } from "react"

type PurgeMode = "all" | "specific"

const WILDCARD_PATH = "/*"

const DEFAULT_ERROR_MESSAGE =
  "Failed to submit purge. Check Strapi logs for details and try again."

/**
 * `getFetchClient` throws a `FetchError` whose `message` is set from the upstream
 * response's `error.message` field. The Strapi controller emits the standard
 * envelope (`{ error: { message } }`) on purge failure, so the widget can show
 * the actual upstream reason instead of a generic message.
 */
function extractPurgeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    if (
      error.message === "Server Error" ||
      error.message === "Unknown Server Error"
    ) {
      return DEFAULT_ERROR_MESSAGE
    }

    return error.message
  }

  return DEFAULT_ERROR_MESSAGE
}

function CdnCacheWidget() {
  const [mode, setMode] = useState<PurgeMode>("specific")
  const [pathsInput, setPathsInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { post } = getFetchClient()
  const { toggleNotification } = useNotification()

  const submit = async () => {
    if (isLoading) {
      return
    }

    const paths =
      mode === "all"
        ? [WILDCARD_PATH]
        : pathsInput
            .split("\n")
            .map((path) => path.trim())
            .filter((path) => path.length > 0)

    if (paths.length === 0) {
      toggleNotification({
        type: "warning",
        message: "Enter at least one path before submitting.",
      })

      return
    }

    if (mode === "all") {
      const confirmed = window.confirm(
        "Purge the entire site from the CDN? This forces every cached page to refetch from origin and should only be used for incidents."
      )

      if (!confirmed) {
        return
      }
    }

    setIsLoading(true)

    try {
      await post("/api/revalidate/cdn-purge", { paths })
      toggleNotification({
        type: "success",
        message:
          "Purge submitted. CDN propagation can take several minutes globally.",
      })

      if (mode === "specific") {
        setPathsInput("")
      }
    } catch (error) {
      console.error("CDN purge failed:", error)
      toggleNotification({
        type: "danger",
        message: extractPurgeErrorMessage(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box padding={4}>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Typography variant="omega">
          Submit specific paths or the entire site to the configured CDN for
          cache eviction. Use this for hot fixes, takedowns, or any change that
          must be live before the page&apos;s normal cache window refreshes.
        </Typography>

        <Typography variant="pi" textColor="neutral600">
          Requires a configured CDN provider. CDN purges can take several
          minutes to propagate globally.
        </Typography>

        <Field.Root>
          <Field.Label>Scope</Field.Label>
          <Radio.Group
            value={mode}
            onValueChange={(value: string) => setMode(value as PurgeMode)}
          >
            <Flex direction="column" alignItems="flex-start" gap={2}>
              <Flex tag="label" gap={2} alignItems="center">
                <Radio.Item value="specific" />
                <Typography>Specific paths</Typography>
              </Flex>
              <Flex tag="label" gap={2} alignItems="center">
                <Radio.Item value="all" />
                <Typography>Entire site ({WILDCARD_PATH})</Typography>
              </Flex>
            </Flex>
          </Radio.Group>
        </Field.Root>

        {mode === "specific" && (
          <Field.Root>
            <Field.Label>Paths to purge</Field.Label>
            <Field.Hint>
              One path per line. Use a leading slash. Wildcards are allowed:{" "}
              <code>/blog/*</code>.
            </Field.Hint>
            <Textarea
              value={pathsInput}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setPathsInput(event.target.value)
              }
              placeholder={"/about\n/blog/*\n/contact"}
              rows={5}
              aria-label="Paths to purge"
            />
          </Field.Root>
        )}

        <Flex justifyContent="flex-end">
          <Button
            variant="danger-light"
            onClick={submit}
            loading={isLoading}
            disabled={isLoading}
            startIcon={<Cloud />}
          >
            Purge CDN cache
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default CdnCacheWidget
