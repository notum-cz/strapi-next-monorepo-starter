import type { ReactNode } from "react"
import Link from "@docusaurus/Link"
import useBaseUrl from "@docusaurus/useBaseUrl"
import Layout from "@theme/Layout"
import IconExternalLink from "@theme/Icon/ExternalLink"

const docLinks = [
  {
    href: "/docs/getting-started/installation",
    title: "Installation",
    description:
      "Install prerequisites, clone the template, and prepare the workspace.",
  },
  {
    href: "/docs/getting-started/quick-start",
    title: "Quick Start",
    description:
      "Run Strapi and the UI locally with seeded content and API tokens.",
  },
  {
    href: "/docs/getting-started/features",
    title: "Features",
    description:
      "See what's included across UI, Strapi, auth, workflow, and QA.",
  },
]

const valueItems = [
  {
    label: "Editable Pages",
    title: "Content Teams Compose Pages in Strapi",
    description:
      "Dynamic-zone sections map to typed React components. Our AI skills help you find, copy, or create page-builder sections.",
  },
  {
    label: "Typed Delivery",
    title: "Generated Types Connect Strapi and the UI",
    description:
      "We document schemas, shared packages, API clients, and AI-assisted workflows as one unified flow, so your frontend changes stay predictable.",
  },
  {
    label: "Project Baseline",
    title: "Your Production Setup Comes Pre-Wired",
    description:
      "Cache revalidation, auth, localization, preview, SEO, media, testing, AI skills, deployment notes, and docs live in one monorepo from the start.",
  },
]

export default function Home(): ReactNode {
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
              <p className="homeEyebrow">Strapi + Next.js Monorepo</p>
              <h1>Build Editable UI Pages Without Rebuilding the Foundation.</h1>
              <div style={{ marginTop: '2.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex' }}>
                  <Link
                    className="button button--primary button--lg"
                    to="/docs/category/getting-started"
                  >
                    Read the docs
                  </Link>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Note: The Live DEMO URL is about to change to https://demo.strapinextjs.notum.tech/ */}
                  <Link className="button button--secondary button--lg" to="https://strapinextjs.notum.tech/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    View the live demo <IconExternalLink width="13" height="13" />
                  </Link>
                  <Link className="button button--secondary button--lg" to="https://github.com/notum-cz/strapi-next-monorepo-starter" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    GitHub repo <IconExternalLink width="13" height="13" />
                  </Link>
                </div>

                <div style={{ marginTop: '0.5rem', display: 'flex' }}>
                  <Link
                    className="button button--link"
                    to="#user-journey"
                    style={{ padding: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
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

        <section id="user-journey" className="homeSection" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)' }}>
          <div className="container">
            <div className="homeDocsHeader">
              <p className="homeSectionLabel">User Journey</p>
              <h2>How to Use This Starter</h2>
              <p style={{ maxWidth: '560px', color: 'var(--ifm-color-emphasis-700)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                Whether you're exploring on your own or presenting to a client, we split this project into distinct environments to keep things clear.
              </p>
            </div>
            <div className="row">
              <div className="col col--6 margin-bottom--lg">
                <div className="card shadow--md" style={{ height: '100%', padding: '2rem' }}>
                  <h3>Devs: Run Locally</h3>
                  <p>Explore the code, test customizations, and experience the page builder firsthand.</p>
                  <ul>
                    <li>
                      <strong>Landing Page:</strong> You're here! A high-level overview.
                    </li>
                    <li>
                      <strong><Link to="/docs/category/getting-started">Documentation</Link>:</strong> Detailed architecture and setup guides.
                    </li>
                  </ul>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 'auto' }}>
                    <Link className="button button--primary" to="https://github.com/notum-cz/strapi-next-monorepo-starter" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>Open the GitHub repo <IconExternalLink width="13" height="13" /></Link>
                    <Link className="button button--secondary" to="/docs/category/getting-started">Read the docs</Link>
                  </div>
                </div>
              </div>
              <div className="col col--6 margin-bottom--lg">
                <div className="card shadow--md" style={{ height: '100%', padding: '2rem' }}>
                  <h3>Explore: Check the Live Demo</h3>
                  <p>Present to clients, content editors, and non-technical stakeholders.</p>
                  <ul>
                    <li><strong>Live Demo:</strong> See exactly what the Strapi Next.js starter produces.</li>
                    <li><strong>Tailored demo:</strong> When you need a tailored demo, contact us and we'll set it up for you.</li>
                  </ul>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 'auto' }}>
                    <Link className="button button--primary" to="https://strapinextjs.notum.tech/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>Try the live demo <IconExternalLink width="13" height="13" /></Link>
                    <Link className="button button--secondary" to="https://www.notum.tech/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>Contact us <IconExternalLink width="13" height="13" /></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="homeSection homeSection--statement">
          <div className="homeWhy container">
            <div className="homeWhyIntro">
              <p className="homeSectionLabel">Why This Starter</p>
              <h2>Start From a Working Content Platform, Not a Blank Repo.</h2>
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
              <h2>Start With the Docs</h2>
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
