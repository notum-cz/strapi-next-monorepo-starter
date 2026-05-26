import AccordionSection from "@/app/[locale]/dev/showcase/components/sections/AccordionSection"
import BodyVariantsSection from "@/app/[locale]/dev/showcase/components/sections/BodyVariantsSection"
import ButtonsSection from "@/app/[locale]/dev/showcase/components/sections/ButtonsSection"
import CardSection from "@/app/[locale]/dev/showcase/components/sections/CardSection"
import CheckboxSection from "@/app/[locale]/dev/showcase/components/sections/CheckboxSection"
import ColorsSection from "@/app/[locale]/dev/showcase/components/sections/ColorsSection"
import DialogSection from "@/app/[locale]/dev/showcase/components/sections/DialogSection"
import FontFamiliesSection from "@/app/[locale]/dev/showcase/components/sections/FontFamiliesSection"
import HeadingsVariantsSection from "@/app/[locale]/dev/showcase/components/sections/HeadingsVariantsSection"
import InputSection from "@/app/[locale]/dev/showcase/components/sections/InputSection"
import RadioGroupSection from "@/app/[locale]/dev/showcase/components/sections/RadioGroupSection"
import SelectSection from "@/app/[locale]/dev/showcase/components/sections/SelectSection"
import TableSection from "@/app/[locale]/dev/showcase/components/sections/TableSection"
import TabsSection from "@/app/[locale]/dev/showcase/components/sections/TabsSection"
import TextareaSection from "@/app/[locale]/dev/showcase/components/sections/TextareaSection"
import TooltipSection from "@/app/[locale]/dev/showcase/components/sections/TooltipSection"
import MockedStrapiAnimatedLogoRow from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiAnimatedLogoRow"
import MockedStrapiCarousel from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiCarousel"
import MockedStrapiCTABanner from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiCTABanner"
import MockedStrapiFaq from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiFaq"
import MockedStrapiFeaturesList from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiFeaturesList"
import MockedStrapiFigures from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiFigures"
import MockedStrapiHeadingWithCTAButton from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiHeadingWithCTAButton"
import MockedStrapiHero from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiHero"
import MockedStrapiImageWithCTAButton from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiImageWithCTAButton"

export const showcaseItems = [
  // Atomic items
  {
    id: "colors",
    label: "Colors",
    kind: "atomic",
    component: ColorsSection,
    description: "Theme color palette showcase",
  },
  {
    id: "font-families",
    label: "Font Families",
    kind: "atomic",
    component: FontFamiliesSection,
    description: "Different font families used across the site",
  },
  {
    id: "headings",
    label: "Headings Variants",
    kind: "atomic",
    component: HeadingsVariantsSection,
    description: "Different heading styles and weights",
  },
  {
    id: "body-variants",
    label: "Body Variants",
    kind: "atomic",
    component: BodyVariantsSection,
    description: "Body text variants used across the site",
  },
  {
    id: "buttons",
    label: "Buttons",
    kind: "atomic",
    component: ButtonsSection,
    description: "Button variants, sizes and states",
  },
  {
    id: "input",
    label: "Input",
    kind: "atomic",
    component: InputSection,
    description: "Input field showcase",
  },
  {
    id: "textarea",
    label: "Textarea",
    kind: "atomic",
    component: TextareaSection,
    description: "Textarea field showcase",
  },
  {
    id: "select",
    label: "Select",
    kind: "atomic",
    component: SelectSection,
    description: "Select dropdown showcase",
  },
  {
    id: "checkbox",
    label: "Checkbox",
    kind: "atomic",
    component: CheckboxSection,
    description: "Checkbox states showcase",
  },
  {
    id: "radio-group",
    label: "Radio Group",
    kind: "atomic",
    component: RadioGroupSection,
    description: "Radio group showcase",
  },
  {
    id: "table",
    label: "Table",
    kind: "atomic",
    component: TableSection,
    description: "Table and data display showcase",
  },
  {
    id: "dialog",
    label: "Dialog",
    kind: "atomic",
    component: DialogSection,
    description: "Dialog/modal showcase",
  },
  {
    id: "tooltip",
    label: "Tooltip",
    kind: "atomic",
    component: TooltipSection,
    description: "Tooltip usage showcase",
  },
  {
    id: "accordion",
    label: "Accordion",
    kind: "atomic",
    component: AccordionSection,
    description: "Accordion showcase",
  },
  {
    id: "tabs",
    label: "Tabs",
    kind: "atomic",
    component: TabsSection,
    description: "Tabs showcase",
  },
  {
    id: "card",
    label: "Card",
    kind: "atomic",
    component: CardSection,
    description: "Card component showcase",
  },

  // Components (Strapi mocks)
  {
    id: "hero",
    label: "Hero",
    kind: "component",
    component: MockedStrapiHero,
    description:
      "Hero component with title, description and call-to-action, tag and bottom note demonstrating the Strapi hero block",
  },
  {
    id: "faq",
    label: "FAQ",
    kind: "component",
    component: MockedStrapiFaq,
    description: "Commonly asked questions about the starter and how to use it",
  },
  {
    id: "animated-logo-row",
    label: "Animated Logo Row",
    kind: "component",
    component: MockedStrapiAnimatedLogoRow,
    description:
      "A horizontal list of partner or client logos with subtle animation",
  },
  {
    id: "carousel",
    label: "Carousel",
    kind: "component",
    component: MockedStrapiCarousel,
    description:
      "A simple image carousel demonstrating the Strapi carousel block",
  },
  {
    id: "cta-banner",
    label: "CTA Banner",
    kind: "component",
    component: MockedStrapiCTABanner,
    description: "Short banner with a call-to-action and link",
  },
  {
    id: "features-list",
    label: "Features List",
    kind: "component",
    component: MockedStrapiFeaturesList,
    description: "A list of product features with optional layouts",
  },
  {
    id: "statistics",
    label: "Statistics",
    kind: "component",
    component: MockedStrapiFigures,
    description: "Numeric highlights and figures shown in a visual layout",
  },
  {
    id: "heading-with-cta",
    label: "Heading with CTA",
    kind: "component",
    component: MockedStrapiHeadingWithCTAButton,
    description: "A heading block with a supporting call-to-action button",
  },
  {
    id: "image-with-cta",
    label: "Image with CTA",
    kind: "component",
    component: MockedStrapiImageWithCTAButton,
    description: "An image block paired with a call-to-action",
  },
] as const

export default showcaseItems
