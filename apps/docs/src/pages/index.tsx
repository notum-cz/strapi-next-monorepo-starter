import Link from "@docusaurus/Link"
import useBaseUrl from "@docusaurus/useBaseUrl"
import Layout from "@theme/Layout"

const docLinks = [
  {
    href: "/docs/getting-started/installation",
    title: "Installation",
    description: "Install prerequisites, clone the template, and prepare the workspace.",
  },
  {
    href: "/docs/getting-started/quick-start",
    title: "Quick Start",
    description: "Run Strapi and the UI locally with seeded content and API tokens.",
  },
  {
    href: "/docs/getting-started/features",
    title: "Features",
    description: "See what is included across UI, Strapi, auth, workflow, and QA.",
  },
]

export default function Home(): JSX.Element {
  const pageBuilderImage = useBaseUrl("/img/page-builder-flow.png")

  return (
    <Layout
      title="Strapi Next Monorepo Starter"
      description="Enterprise-ready Strapi v5 and Next.js starter template"
    >
      <main className="home">
        <section className="homeHero">
          <div className="container homeHeroGrid">
            <div className="homeHeroCopy">
              <p className="homeEyebrow">Strapi + Next.js monorepo</p>
              <h1>Build editable UI pages without rebuilding the foundation.</h1>
              <div className="homeActions">
                <Link
                  className="button button--primary button--lg"
                  to="/docs/getting-started/installation"
                >
                  Get started
                </Link>
                <a className="button button--secondary button--lg" href="https://www.notum-dev.cz/">
                  Live demo
                </a>
              </div>
            </div>

            <div className="homePreview" aria-label="Page builder flow preview">
              <img
                src={pageBuilderImage}
                alt="Page builder flow from Strapi dynamic zone data through component UID mapping to rendered UI components"
              />
            </div>
          </div>
        </section>

        <section className="homeSection">
          <div className="container homeWhy">
            <h2>Why</h2>
            <p>
              This is a ready-to-go starter template for Strapi projects. It
              combines Strapi, Next.js, shadcn/ui, and Turborepo into one
              monorepo so teams can start from a working foundation.
            </p>
            <p>
              The main idea is a page builder for enterprise applications:
              editors compose pages in Strapi, while the UI renders those
              content blocks as typed React components.
            </p>
            <p>
              It gives the team a practical starting point for real project
              work, with the common setup already in place instead of waiting
              for the basic infrastructure to be assembled first.
            </p>
            <Link className="button button--secondary" to="/docs/getting-started/features">
              View features
            </Link>
          </div>
        </section>

        <section className="homeSection">
          <div className="container">
            <h2>Start with the docs</h2>
            <div className="homeCards">
              {docLinks.map((item) => (
                <Link className="homeCard" key={item.href} to={item.href}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
