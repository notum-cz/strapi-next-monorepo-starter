"use client"

import { useState } from "react"

import AppLink from "@/components/elementary/AppLink"
import Typography from "@/components/typography"
import { Button } from "@/components/ui/button"

export default function ComponentsList({
  components,
  pages,
}: {
  components: string[]
  pages: {
    documentId: string
    fullPath: string
    content?: { __component: string }[]
  }[]
}) {
  const [show, setShow] = useState(true)

  return (
    <div className="flex flex-col gap-6">
      <div className="my-6">
        <Button
          type="button"
          variant={show ? "default" : "outline"}
          onClick={() => setShow((prev) => !prev)}
        >
          {show ? "Hide pages" : "Show pages"}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {components?.map((component) => (
          <div key={component}>
            <Typography variant="large">{component}</Typography>

            {show && (
              <div className="pl-4">
                {pages
                  .filter((page) =>
                    page.content?.some(
                      (block) => block.__component === component
                    )
                  )
                  .map((page) => (
                    <div key={page.documentId}>
                      <AppLink
                        href={page.fullPath}
                        openInNewTab
                        className="mb-2 p-0"
                      >
                        {page.fullPath}
                      </AppLink>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
