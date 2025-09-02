import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { setRequestLocale, getTranslations } from "next-intl/server"

import type { PageProps } from "@/types/next"

import { fetchProject } from "@/lib/strapi-api/content/server"
import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"
import { cn } from "@/lib/styles"
import { Breadcrumbs } from "@/components/elementary/Breadcrumbs"
import { Container } from "@/components/elementary/Container"

type Props = PageProps<{
  id: string
}>

export default async function ProjectDetailPage(props: Props) {
  const params = await props.params

  setRequestLocale(params.locale)

  const response = await fetchProject(params.id, params.locale)

  if (!response?.data) {
    notFound()
  }

  const project = response.data
  const t = await getTranslations('projects')

  return (
    <main className={cn("flex w-full flex-col overflow-hidden")}>
      <Container>
        <nav className={cn("mx-auto w-full py-4", "mt-6 mb-6")}>
          <Link
            href={`/${params.locale}/projects`}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-600 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900 hover:no-underline md:text-base"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t('backToProjects')}
          </Link>
        </nav>
      </Container>

      <div className={cn("mb-3 md:mb-8 lg:mb-10")}>
        <Container>
          <div className="py-12">
            <div className="mx-auto max-w-4xl">
              {project.image?.url && (
                <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={formatStrapiMediaUrl(project.image.url)}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <h1 className="mb-6 text-4xl font-bold">{project.title}</h1>

              <div className="prose mb-8 max-w-none">
                <p className="text-lg text-gray-700">{project.description}</p>
              </div>

              {project.tags?.length && (
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-semibold">{t('technologies')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.links?.length && (
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-semibold">{t('links')}</h3>
                  <div className="flex flex-wrap gap-4">
                    {project.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                      >
                        {link.type}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </main>
  )
}
