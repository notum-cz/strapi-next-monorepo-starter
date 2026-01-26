import { UID } from "@repo/strapi-types"

import StrapiContactForm from "@/components/page-builder/components/forms/StrapiContactForm"
import StrapiNewsletterForm from "@/components/page-builder/components/forms/StrapiNewsletterForm"
import StrapiAnimatedLogoRow from "@/components/page-builder/components/sections/StrapiAnimatedLogoRow"
import StrapiCarousel from "@/components/page-builder/components/sections/StrapiCarousel"
import StrapiFaq from "@/components/page-builder/components/sections/StrapiFaq"
import StrapiHeadingWithCTAButton from "@/components/page-builder/components/sections/StrapiHeadingWithCTAButton"
import StrapiHero from "@/components/page-builder/components/sections/StrapiHero"
import StrapiHorizontalImages from "@/components/page-builder/components/sections/StrapiHorizontalImages"
import StrapiImageWithCTAButton from "@/components/page-builder/components/sections/StrapiImageWithCTAButton"
import StrapiCkEditorContent from "@/components/page-builder/components/utilities/StrapiCkEditorContent"

/**
 * Mapping of Strapi Component UID to React Component
 * TODO: Improve dynamic/lazy loading of these components to reduce bundle size
 */
export const PageContentComponents: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in UID.Component]?: React.ComponentType<any>
} = {
  // elements, seo-utilities, utilities
  // They are usually rendered or used deep inside other components or handlers
  // Add them here if they can be used on Page content level
  "utilities.ck-editor-content": StrapiCkEditorContent,

  // Sections
  "sections.animated-logo-row": StrapiAnimatedLogoRow,
  "sections.faq": StrapiFaq,
  "sections.carousel": StrapiCarousel,
  "sections.heading-with-cta-button": StrapiHeadingWithCTAButton,
  "sections.hero": StrapiHero,
  "sections.horizontal-images": StrapiHorizontalImages,
  "sections.image-with-cta-button": StrapiImageWithCTAButton,

  // Forms
  "forms.contact-form": StrapiContactForm,
  "forms.newsletter-form": StrapiNewsletterForm,

  // Add more components here
}
