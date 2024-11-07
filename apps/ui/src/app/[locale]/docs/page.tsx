import { ReactNode } from "react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"
import { ImageWithBlur } from "@/components/elementary/ImageWithBlur"
import { ImageWithFallback } from "@/components/elementary/ImageWithFallback"
import { ImageWithPlaiceholder } from "@/components/elementary/ImageWithPlaiceholder"
import { Alert } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

type SectionProps = {
  children: ReactNode
  title?: string
  subTitle?: string
}

const Section = ({ children, title, subTitle }: SectionProps) => {
  return (
    <Container className="w-full">
      <div>
        <div className="flex items-center space-x-3">
          <h2 className="w-fit rounded-t-xl bg-white px-4 py-2 text-lg font-bold">
            {title}
          </h2>
          {subTitle && <p className="text-sm text-gray-500">{subTitle}</p>}
        </div>
        <div className="flex flex-col space-y-4 rounded-r-xl bg-white p-4">
          {children}
        </div>
      </div>
    </Container>
  )
}

const seoCodeString = `export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const pageUrl = params.rest.join("/")

  const meta = await getMetadataFromStrapi({pageUrl, locale})
  return meta
}`

const loadingComponent = `const DynamicHero = dynamic(() => import("../components/Hero"), {
  loading: () => <p>Loading...</p>, // <Skeleton />
})

const printableComps = {
 ...
  "sections.heading-with-cta-button": HeadingWithCTAButton,
  "sections.hero": Hero,
}`

const tailwindCode = `// safelist inside tailwind.config.js
{
  pattern: /rounded-(sm|md|lg|xl|full)/,
  variants: ["lg", "md", "sm"],
}


// React component
<div className={cn(
  component?.imageRadius &&
    "rounded-{component.imageRadius}",
  }/>`

type CodeProps = {
  children: string
}
const Code = ({ children }: CodeProps) => {
  return (
    <pre className="rounded-lg bg-gray-600 p-4 text-white">
      <code>{children}</code>
    </pre>
  )
}

export default async function DocsPage() {
  removeThisWhenYouNeedMe("DocsPage")

  return (
    <main className="flex flex-col space-y-6 bg-gray-100 py-10">
      <Container>
        <Alert variant="warning" className="bg-orange-50">
          This page is under construction. See <strong>READMEs.md</strong> in
          source for more information.
        </Alert>
      </Container>

      <Section
        title="SEO"
        subTitle="https://nextjs.org/docs/14/app/building-your-application/optimizing/metadata"
      >
        <p>
          An example of how metadata for a page that is available at the address{" "}
          <b>apps/ui/src/app/[locale]/page.tsx</b> is generated.
        </p>

        <p>
          <b>getMetadataFromStrapi</b>: This function prepares complete nextjs
          metadata for a page based on the URL and locale from Strapi.
        </p>

        <Code>{seoCodeString}</Code>
      </Section>

      <Section title="Images" subTitle="">
        <p>
          For working with images, we have created 3 components, folder{" "}
          <b>components/elementary</b>
        </p>
        <div className="pl-2 pt-2">
          <li>
            <b>ImageWithPlaiceholder</b>: A component for next 14+ ssr, which
            processes the image on the server and creates a smaller placeholder
            (alias blur in base64, very small size) for faster loading + SEO,
            after which it lazy loads the image.
          </li>
          <li>
            <b>ImageWithFallback</b>: A component that can be used only on the
            client, which displays a fallback image if the original cannot be
            loaded.
          </li>
          <li>
            <b>ImageWithBlur</b>: A component that displays an image with a blur
            (rgb) placeholder, which loads faster than the original image.
          </li>
        </div>

        <h3>
          Example - for a better demonstration, it&apos;s recommended to set the
          network to slow/fast 3G in devtools
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p>ImageWithPlaiceholder</p>
            <ImageWithPlaiceholder
              src="https://picsum.photos/500/300?random=0"
              alt="notum"
              width={500}
              height={300}
            />
          </div>

          <div>
            <p>ImageWithFallback</p>
            <ImageWithFallback
              src="https://picsuxxxxm.photos/500/300?random=1"
              fallbackSrc="https://picsxxvxum.photos/500/300?random=1.1"
              alt="notum"
              width={500}
              height={300}
            />
          </div>

          <div>
            <p>ImageWithBlur</p>
            <ImageWithBlur
              src="https://picsum.photos/500/300?random=2"
              alt="notum"
              width={500}
              height={300}
              blurRgb={[50, 50, 50]}
            />
          </div>
        </div>
      </Section>

      <Section title="Loading Components" subTitle="apps/ui/src/pageBuilder/**">
        <p>
          All components that are defined in <b>printableComps</b> are
          automatically split by Next.js because they are server-side. In case
          it concerns a component that is needed on the client side or loading
          some larger piece, here is how to use it
        </p>

        <p>
          All components can be used for example with{" "}
          <a
            href="https://ui.shadcn.com/docs/components/skeleton"
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-500 hover:underline"
          >
            https://ui.shadcn.com/docs/components/skeleton
          </a>
        </p>

        <Code>{loadingComponent}</Code>

        <p>Example of Skeleton - More in the code</p>

        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </Section>

      <Section
        title="Tailwind and Dynamic Class"
        subTitle="apps/ui/tailwind.config.js:88"
      >
        <p>
          In case you need a dynamic class that changes based on state or other
          conditions, it&apos;s possible to use{" "}
          <b>tailwind.config.js (safelist)</b>
        </p>

        <Code>{tailwindCode}</Code>
      </Section>
    </main>
  )
}
