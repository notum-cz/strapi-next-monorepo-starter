import Link from "@docusaurus/Link"
import useBaseUrl from "@docusaurus/useBaseUrl"
import Layout from "@theme/Layout"
import IconExternalLink from "@theme/Icon/ExternalLink"

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

const valueItems = [
  {
    label: "Editable pages",
    title: "Content teams compose pages in Strapi",
    description:
      "Dynamic-zone sections map to typed React components, and AI skills help find, copy, or create page-builder sections.",
  },
  {
    label: "Typed delivery",
    title: "Generated types connect Strapi and the UI",
    description:
      "Schemas, shared packages, API clients, and AI-assisted workflows are documented as one flow, so frontend changes stay predictable.",
  },
  {
    label: "Project baseline",
    title: "Common production setup is already wired",
    description:
      "Cache revalidation, auth, localization, preview, SEO, media, testing, AI skills, deployment notes, and docs live in one monorepo from the start.",
  },
]

export default function Home(): JSX.Element {
  const pageBuilderImage = useBaseUrl("/img/page-builder-flow.webp")

  return (
    <Layout
      title="Strapi Next Monorepo Starter"
      description="Enterprise-ready Strapi v5 and Next.js starter template with a visual page builder, Better Auth, structured logging, and Playwright test coverage."
    >
      <main className="home">
        <section className="homeHero">
          <div className="homeHeroGrid">
            <div className="homeHeroCopy">
              <p className="homeEyebrow">Strapi + Next.js monorepo</p>
              <h1>Build editable UI pages without rebuilding the foundation.</h1>
              <div style={{ marginTop: '2.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex' }}>
                  <Link
                    className="button button--primary button--lg"
                    to="/docs/category/getting-started"
                  >
                    Read Documentation
                  </Link>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Note: The Live DEMO URL is about to change to https://demo.strapinextjs.notum.tech/ */}
                  <Link className="button button--secondary button--lg" to="https://strapinextjs.notum.tech/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    View Live Demo <IconExternalLink width="13" height="13" />
                  </Link>
                  <Link className="button button--secondary button--lg" to="https://github.com/notum-cz/strapi-next-monorepo-starter" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    GitHub Repository <IconExternalLink width="13" height="13" />
                  </Link>
                </div>

                <div style={{ marginTop: '0.5rem', display: 'flex' }}>
                  <Link
                    className="button button--link"
                    to="#user-journey"
                    style={{ padding: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                    More Information
                  </Link>
                </div>
              </div>
            </div>

            <div className="homePreview" aria-label="Page builder flow preview">
              <img
                src={pageBuilderImage}
                alt="Page builder flow from Strapi dynamic zone data through component UID mapping to rendered UI components"
                fetchPriority="high"
              />
            </div>
          </div>
        </section>

        <section className="homeSection homeSection--statement">
          <div className="container homeWhy">
            <div className="homeWhyIntro">
              <p className="homeSectionLabel">Why this starter</p>
              <h2>Start from a working content platform, not a blank repo.</h2>
              <p>
                This starter brings Strapi, Next.js, shadcn/ui, Turborepo, and
                documentation into one practical foundation for content-driven
                projects.
              </p>
              <div className="homeWhyActions">
                <Link
                  className="button button--secondary"
                  to="/docs/getting-started/features"
                >
                  View features
                </Link>
                <Link
                  className="button button--primary homeButtonDark"
                  to="/docs/reference/AI/skills"
                >
                  AI Skills
                </Link>
              </div>
            </div>

            <div className="homeValueGrid" aria-label="Starter value summary">
              {valueItems.map((item) => (
                <article className="homeValueItem" key={item.title}>
                  <p>{item.label}</p>
                  <h3>{item.title}</h3>
                  <span>{item.description}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="homeSection homeDocsSection">
          <div className="container">
            <div className="homeDocsHeader">
              <p className="homeSectionLabel">Documentation</p>
              <h2>Start with the docs</h2>
            </div>
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
