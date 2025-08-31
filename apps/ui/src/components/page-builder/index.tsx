import { UID } from "@repo/strapi"

import StrapiContactForm from "@/components/page-builder/components/forms/StrapiContactForm"
import StrapiNewsletterForm from "@/components/page-builder/components/forms/StrapiNewsletterForm"
import StrapiAdaptiveGallery from "@/components/page-builder/components/sections/StrapiAdaptiveGallery"
import StrapiAnimatedLogoRow from "@/components/page-builder/components/sections/StrapiAnimatedLogoRow"
import StrapiAttachmentDownload from "@/components/page-builder/components/sections/StrapiAttachmentDownload"
import StrapiFaq from "@/components/page-builder/components/sections/StrapiFaq"
import StrapiHeadingWithCTAButton from "@/components/page-builder/components/sections/StrapiHeadingWithCTAButton"
import StrapiHero from "@/components/page-builder/components/sections/StrapiHero"
import StrapiImageWithCTAButton from "@/components/page-builder/components/sections/StrapiImageWithCTAButton"
import StrapiQuoteCarouselSection from "@/components/page-builder/components/sections/StrapiQuoteCarousel"
import StrapiTimeline from "@/components/page-builder/components/sections/StrapiTimeline"
import StrapiCkEditorContent from "@/components/page-builder/components/utilities/StrapiCkEditorContent"

/**
 * Mapping of Strapi Component UID to React Component
 * TODO: This should map Strapi component uid -> component path to reduce bundle size, however this became an issue with nextjs 15 update
 */

export const PageContentComponents: {
  // [K in UID.Component]?: string // TODO: Next.js 15 has issues with dynamic imports inside pages
  // eslint-disable-next-line no-unused-vars
  [K in UID.Component]?: React.ComponentType<any>
} = {
  // elements, seo-utilities, utilities
  // They are usually rendered or used deep inside other components or handlers
  // Add them here if they can be used on Page content level

  "utilities.ck-editor-content": StrapiCkEditorContent,

  // Sections
  "sections.animated-logo-row": StrapiAnimatedLogoRow,
  "sections.attachment-download": StrapiAttachmentDownload,
  "sections.faq": StrapiFaq,
  "sections.heading-with-cta-button": StrapiHeadingWithCTAButton,
  "sections.hero": StrapiHero,
  "sections.image-with-cta-button": StrapiImageWithCTAButton,
  "sections.timeline": StrapiTimeline,
  "sections.adaptive-gallery": StrapiAdaptiveGallery,
  "sections.quote-carousel": StrapiQuoteCarouselSection,

  // Forms
  "forms.contact-form": StrapiContactForm,
  "forms.newsletter-form": StrapiNewsletterForm,

  // Add more components here
}
