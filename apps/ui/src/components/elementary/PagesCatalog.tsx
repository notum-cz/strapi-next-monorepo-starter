"use client"

import { useAllPages } from "@/hooks/usePages"
import { Button } from "@/components/ui/button"

/**
 * An example of a client-side component that fetches and displays a catalog of pages
 * fetched from Strapi.
 */
export default function PagesCatalog() {
  const query = useAllPages()

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">
        Pages Catalog (client-side){" "}
        <Button onClick={() => query.refetch()} variant="ghost">
          {query.isFetching ? "Loading..." : "Refetch"}
        </Button>
      </h1>

      {query.isError && (
        <p className="text-red-500">
          Error fetching pages:{" "}
          {query.error instanceof Error ? query.error.message : "Unknown error"}
        </p>
      )}
      {query.data && (
        <ul className="list-disc pl-5">
          {query.data.data.map((page: any) => (
            <li key={page.id}>
              <strong>{page.title}</strong> - {page.fullPath}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
