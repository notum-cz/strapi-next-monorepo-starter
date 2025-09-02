import Image from "next/image"
import { Data } from "@repo/strapi"

import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"
import { Container } from "@/components/elementary/Container"

interface StrapiProjectShowcaseProps {
  readonly component: Data.Component<"sections.project-showcase">
}

export function StrapiProjectShowcase({
  component,
}: StrapiProjectShowcaseProps) {
  if (!component.projects?.length) return null

  return (
    <section className="py-12">
      <Container>
        {component.title && (
          <h2 className="mb-12 text-center text-3xl font-bold">
            {component.title}
          </h2>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {component.projects.map((project, i) => (
            <div
              key={`${project.id}-${i}`}
              className="overflow-hidden rounded-lg bg-white shadow-lg"
            >
              {/* Project Image */}
              {(project.featuredImage?.url || project.image?.url) && (
                <div className="relative aspect-video">
                  <Image
                    src={formatStrapiMediaUrl(
                      project.featuredImage?.url || project.image?.url
                    )}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                  {project.featured && (
                    <div className="absolute top-2 right-2 rounded bg-yellow-500 px-2 py-1 text-xs text-white">
                      Featured
                    </div>
                  )}
                </div>
              )}

              {/* Project Content */}
              <div className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  {project.category && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                      {project.category}
                    </span>
                  )}
                </div>

                <p className="mb-4 line-clamp-3 text-gray-600">
                  {project.shortDescription || project.description}
                </p>

                {/* Technologies */}
                {(project.technologies?.length || project.tags?.length) && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {(project.technologies || project.tags)?.map(
                      (tag, tagIndex) => (
                        <span
                          key={`${tag.id}-${tagIndex}`}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-700"
                        >
                          {tag.name}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* Status & Timeline */}
                <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                  {project.status && (
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        project.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : project.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  )}
                  {project.client && <span>Client: {project.client}</span>}
                </div>

                {/* Links */}
                {project.links?.length && (
                  <div className="flex flex-wrap gap-2">
                    {project.links.map((link, linkIndex) => {
                      const buttonStyle =
                        {
                          "Source Code": "bg-gray-600 hover:bg-gray-700",
                          "Live Demo": "bg-blue-600 hover:bg-blue-700",
                          "Live Site": "bg-green-600 hover:bg-green-700",
                          "Case Study": "bg-purple-600 hover:bg-purple-700",
                        }[link.type] || "bg-blue-600 hover:bg-blue-700"

                      return (
                        <a
                          key={`${link.id}-${linkIndex}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2 ${buttonStyle} rounded text-sm text-white transition-colors`}
                        >
                          {link.type}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default StrapiProjectShowcase
