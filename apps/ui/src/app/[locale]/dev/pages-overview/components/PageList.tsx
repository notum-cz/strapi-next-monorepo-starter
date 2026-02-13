"use client"

import { useState } from "react"

import AppLink from "@/components/elementary/AppLink"
import Typography from "@/components/typography"
import { Button } from "@/components/ui/button"

export default function PageList({
  pages,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pages: any[]
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
          {show ? "Hide components" : "Show components"}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {pages?.map((page) => (
          <div key={page.id}>
            <Typography variant="large">{page.title}</Typography>
            <AppLink
              href={page.fullPath ?? ""}
              openInNewTab
              className="mb-2 p-0"
            >
              {page.fullPath}
            </AppLink>
            {show && (
              <div className="pl-4">
                {page?.content?.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (block: any, i: number) => (
                    <Typography
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${block.id ?? block.__component}-${i}`}
                    >
                      {block.__component}
                    </Typography>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
