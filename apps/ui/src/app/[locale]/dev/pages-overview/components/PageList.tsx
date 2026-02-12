"use client"

import { useState } from "react"

import AppLink from "@/components/elementary/AppLink"
import Typography from "@/components/typography"
import { Button } from "@/components/ui/button"

export default function PageList({ pages }: { pages: any[] }) {
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
                {page?.content?.map((block: any, index: number) => (
                  <Typography key={block.id || index}>
                    {block.__component}
                  </Typography>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
