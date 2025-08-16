"use client"

import { Data } from "@repo/strapi"

import { cn } from "@/lib/styles"

export function StrapiAttachment({
  component,
  className,
}: {
  readonly component: Data.Component<"elements.attachment">
  readonly className?: string
}) {
  if (!component.file?.url) return null

  const fileUrl = component.file.url
  const fileName = component.file.name || component.label || "Download"
  const fileSize = component.file.size
    ? `${Math.round(component.file.size / 1024)} KB`
    : null
  const fileExt = component.file.ext?.replace(".", "").toUpperCase()

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50",
        className
      )}
    >
      {/* File Icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
        <svg
          className="h-5 w-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* File Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-gray-900">
            {component.label || fileName}
          </h3>
          {fileExt && (
            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              {fileExt}
            </span>
          )}
        </div>
        {(component.description || fileSize) && (
          <div className="mt-1 flex items-center gap-2">
            {component.description && (
              <p className="truncate text-sm text-gray-500">
                {component.description}
              </p>
            )}
            {fileSize && (
              <span className="text-xs text-gray-400">• {fileSize}</span>
            )}
          </div>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="flex-shrink-0 rounded-md px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
      >
        Download
      </button>
    </div>
  )
}

export default StrapiAttachment
