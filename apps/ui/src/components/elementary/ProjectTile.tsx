"use client"

import Image from "next/image"
import Link from "next/link"
import { Data } from "@repo/strapi"

import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"

interface ProjectTileProps {
  project: Data.Project
  locale: string
}

export function ProjectTile({ project, locale }: ProjectTileProps) {
  return (
    <Link
      href={`/${locale}/projects/${project.documentId}`}
      className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl"
    >
      {project.image?.url && (
        <div className="relative aspect-video">
          <Image
            src={formatStrapiMediaUrl(project.image.url)}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-grow flex-col p-6">
        <div className="flex-grow">
          <h3 className="mb-2 text-xl font-bold">{project.title}</h3>
          <p className="mb-4 line-clamp-3 text-gray-600">
            {project.description}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          {project.tags?.length && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {project.links?.length && (
            <div className="flex flex-wrap gap-2">
              {project.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
                >
                  {link.type}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
