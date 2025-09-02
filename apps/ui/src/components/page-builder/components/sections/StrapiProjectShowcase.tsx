import { Data } from "@repo/strapi"

import { Container } from "@/components/elementary/Container"
import { ProjectTile } from "@/components/elementary/ProjectTile"

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
            <ProjectTile
              key={`${project.documentId}-${i}`}
              project={project}
              locale="en"
            />
          ))}
        </div>
      </Container>
    </section>
  )
}

export default StrapiProjectShowcase
