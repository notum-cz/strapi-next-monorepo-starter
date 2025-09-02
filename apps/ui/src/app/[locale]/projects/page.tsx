import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"

import type { PageProps } from "@/types/next"

import { fetchAllProjects } from "@/lib/strapi-api/content/server"
import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"
import { cn } from "@/lib/styles"
import { Breadcrumbs } from "@/components/elementary/Breadcrumbs"
import { Container } from "@/components/elementary/Container"

type Props = PageProps

export default async function ProjectsPage(props: Props) {
  const params = await props.params

  setRequestLocale(params.locale)

  const response = await fetchAllProjects(params.locale)

  if (!response?.data?.length) {
    notFound()
  }

  const projects = response.data

  return (
    <main className={cn("flex w-full flex-col overflow-hidden")}>
      <Container>
        <Breadcrumbs
          breadcrumbs={[{ label: "Projects", href: "/projects" }]}
          className="mt-6 mb-6"
        />
      </Container>

      <div className={cn("mb-3 md:mb-8 lg:mb-10")}>
        <Container>
          <div className="py-12">
            <h1 className="mb-12 text-center text-4xl font-bold">Projects</h1>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.documentId}
                  href={`/${params.locale}/projects/${project.documentId}`}
                  className="overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl"
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

                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold">{project.title}</h3>
                    <p className="mb-4 line-clamp-3 text-gray-600">
                      {project.description}
                    </p>

                    {project.tags?.length && (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-700"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </main>
  )
}
