import { notFound } from "next/navigation"
import { setRequestLocale, getTranslations } from "next-intl/server"

import type { PageProps } from "@/types/next"

import { fetchAllProjects, fetchPage } from "@/lib/strapi-api/content/server"
import { cn } from "@/lib/styles"
import { Breadcrumbs } from "@/components/elementary/Breadcrumbs"
import { Container } from "@/components/elementary/Container"
import { ProjectTile } from "@/components/elementary/ProjectTile"

type Props = PageProps

export default async function ProjectsPage(props: Props) {
  const params = await props.params

  setRequestLocale(params.locale)

  const [projectsResponse, homePageResponse] = await Promise.all([
    fetchAllProjects(params.locale),
    fetchPage("/", params.locale)
  ])

  if (!projectsResponse?.data?.length) {
    notFound()
  }

  const projects = projectsResponse.data
  const homeTitle = homePageResponse?.data?.breadcrumbTitle || homePageResponse?.data?.title || "Home"
  const t = await getTranslations('projects')

  return (
    <main className={cn("flex w-full flex-col overflow-hidden")}>
      <Container>
        <Breadcrumbs
          breadcrumbs={[
            { title: homeTitle, fullPath: "/" },
            { title: t('title'), fullPath: "/projects" }
          ]}
          className="mt-6 mb-6"
        />
      </Container>

      <div className={cn("mb-3 md:mb-8 lg:mb-10")}>
        <Container>
          <div className="py-12">
            <h1 className="mb-12 text-center text-4xl font-bold">{t('title')}</h1>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectTile
                  key={project.documentId}
                  project={project}
                  locale={params.locale}
                />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </main>
  )
}
