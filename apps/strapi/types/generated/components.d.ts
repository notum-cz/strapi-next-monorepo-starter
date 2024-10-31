import type { Schema, Struct } from "@strapi/strapi"

export interface ExampleExample extends Struct.ComponentSchema {
  collectionName: "components_example_examples"
  info: {
    displayName: "example"
    icon: "emotionUnhappy"
  }
  attributes: {
    author: Schema.Attribute.String
  }
}

export interface LayoutNavbar extends Struct.ComponentSchema {
  collectionName: "components_layout_navbars"
  info: {
    description: ""
    displayName: "Navbar"
  }
  attributes: {
    links: Schema.Attribute.Component<"shared.link", true>
    logoImage: Schema.Attribute.Component<"shared.image-with-link", false>
  }
}

export interface SectionsAnimatedLogoRow extends Struct.ComponentSchema {
  collectionName: "components_sections_animated_logo_rows"
  info: {
    description: ""
    displayName: "AnimatedLogoRow"
  }
  attributes: {
    isVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>
    logos: Schema.Attribute.Component<"shared.basic-image", true>
    text: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SectionsCarousel extends Struct.ComponentSchema {
  collectionName: "components_sections_carousels"
  info: {
    description: ""
    displayName: "Carousel"
  }
  attributes: {
    images: Schema.Attribute.Component<"shared.image-with-link", true>
    isVisible: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>
    radius: Schema.Attribute.Enumeration<["sm", "md", "lg", "xl", "full"]>
  }
}

export interface SectionsContactForm extends Struct.ComponentSchema {
  collectionName: "components_sections_contact_forms"
  info: {
    displayName: "ContactForm"
  }
  attributes: {
    description: Schema.Attribute.Text
    gdpr: Schema.Attribute.Component<"shared.link", false>
    title: Schema.Attribute.String
  }
}

export interface SectionsFaq extends Struct.ComponentSchema {
  collectionName: "components_sections_faqs"
  info: {
    description: ""
    displayName: "Faq"
  }
  attributes: {
    accordions: Schema.Attribute.Component<"shared.accordions", true>
    isVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>
    subTitle: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SectionsFeatureGrid extends Struct.ComponentSchema {
  collectionName: "components_sections_feature_grids"
  info: {
    description: ""
    displayName: "FeatureGrid"
  }
  attributes: {
    gridCol: Schema.Attribute.Component<"shared.grid-column", false>
    imageRadius: Schema.Attribute.Enumeration<["sm", "md", "lg", "xl", "full"]>
    imageSize: Schema.Attribute.Integer & Schema.Attribute.Required
    isVisible: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>
    items: Schema.Attribute.Component<"shared.feature-grid-item", true>
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SectionsHeadingWithCtaButton extends Struct.ComponentSchema {
  collectionName: "components_sections_heading_with_cta_buttons"
  info: {
    description: ""
    displayName: "HeadingWithCTAButton"
  }
  attributes: {
    cta: Schema.Attribute.Component<"shared.link", false>
    isVisible: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>
    subText: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: "components_sections_heroes"
  info: {
    description: ""
    displayName: "Hero"
  }
  attributes: {
    bgColor: Schema.Attribute.String &
      Schema.Attribute.CustomField<"plugin::color-picker.color">
    image: Schema.Attribute.Component<"shared.basic-image", false>
    isVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>
    links: Schema.Attribute.Component<"shared.link", true>
    subTitle: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SectionsHorizontalImages extends Struct.ComponentSchema {
  collectionName: "components_sections_horizontal_images"
  info: {
    description: ""
    displayName: "HorizontalImages"
  }
  attributes: {
    fixedImageHeight: Schema.Attribute.Integer
    fixedImageWidth: Schema.Attribute.Integer
    imageRadius: Schema.Attribute.Enumeration<["sm", "md", "lg", "xl", "full"]>
    images: Schema.Attribute.Component<"shared.image-with-link", true>
    isVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>
    spacing: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20
          min: 0
        },
        number
      >
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SectionsImageWithCtaButton extends Struct.ComponentSchema {
  collectionName: "components_sections_image_with_cta_buttons"
  info: {
    description: ""
    displayName: "ImageWithCTAButton"
  }
  attributes: {
    image: Schema.Attribute.Component<"shared.basic-image", false>
    isVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>
    link: Schema.Attribute.Component<"shared.link", false>
    subText: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SectionsNewsletter extends Struct.ComponentSchema {
  collectionName: "components_sections_newsletters"
  info: {
    displayName: "Newsletter"
  }
  attributes: {
    description: Schema.Attribute.String
    gdpr: Schema.Attribute.Component<"shared.link", false>
    title: Schema.Attribute.String
  }
}

export interface SharedAccordions extends Struct.ComponentSchema {
  collectionName: "components_shared_accordions"
  info: {
    description: ""
    displayName: "Accordions"
  }
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required
    question: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SharedBasicImage extends Struct.ComponentSchema {
  collectionName: "components_shared_basic_images"
  info: {
    description: ""
    displayName: "BasicImage"
  }
  attributes: {
    alt: Schema.Attribute.String & Schema.Attribute.Required
    fallbackSrc: Schema.Attribute.String
    height: Schema.Attribute.Integer
    media: Schema.Attribute.Media<"images" | "videos"> &
      Schema.Attribute.Required
    width: Schema.Attribute.Integer
  }
}

export interface SharedFeatureGridItem extends Struct.ComponentSchema {
  collectionName: "components_shared_feature_grid_items"
  info: {
    description: ""
    displayName: "FeatureGridItem"
  }
  attributes: {
    image: Schema.Attribute.Component<"shared.basic-image", false>
    subTitle: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SharedFooterItem extends Struct.ComponentSchema {
  collectionName: "components_shared_footer_items"
  info: {
    description: ""
    displayName: "FooterItem"
  }
  attributes: {
    links: Schema.Attribute.Component<"shared.link", true>
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SharedGridColumn extends Struct.ComponentSchema {
  collectionName: "components_shared_grid_columns"
  info: {
    displayName: "GridColumn"
  }
  attributes: {
    desktop: Schema.Attribute.Integer & Schema.Attribute.Required
    mobile: Schema.Attribute.Integer & Schema.Attribute.Required
    tablet: Schema.Attribute.Integer & Schema.Attribute.Required
  }
}

export interface SharedImageWithLink extends Struct.ComponentSchema {
  collectionName: "components_shared_image_with_links"
  info: {
    description: ""
    displayName: "ImageWithLink"
  }
  attributes: {
    image: Schema.Attribute.Component<"shared.basic-image", false>
    link: Schema.Attribute.Component<"shared.link", false>
  }
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: "components_shared_links"
  info: {
    description: ""
    displayName: "Link"
  }
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required
    label: Schema.Attribute.String
    newTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>
  }
}

export interface SharedMetaSocial extends Struct.ComponentSchema {
  collectionName: "components_shared_meta_socials"
  info: {
    displayName: "metaSocial"
    icon: "project-diagram"
  }
  attributes: {
    description: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 65
      }>
    image: Schema.Attribute.Media<"images" | "files" | "videos">
    socialNetwork: Schema.Attribute.Enumeration<["Facebook", "Twitter"]> &
      Schema.Attribute.Required
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60
      }>
  }
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: "components_shared_seos"
  info: {
    displayName: "seo"
    icon: "search"
  }
  attributes: {
    applicationName: Schema.Attribute.String
    email: Schema.Attribute.String
    keywords: Schema.Attribute.Text
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160
      }>
    metaImage: Schema.Attribute.Media<"images">
    metaRobots: Schema.Attribute.String
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60
      }>
    siteName: Schema.Attribute.String
    twitter: Schema.Attribute.Component<"shared.seo-twitter", false>
  }
}

export interface SharedSeoTwitter extends Struct.ComponentSchema {
  collectionName: "components_shared_seo_twitters"
  info: {
    displayName: "SeoTwitter"
    icon: "oneToMany"
  }
  attributes: {
    card: Schema.Attribute.String
    creator: Schema.Attribute.String
    creatorId: Schema.Attribute.String
    description: Schema.Attribute.String
    images: Schema.Attribute.Media<"images", true>
    siteId: Schema.Attribute.String
    title: Schema.Attribute.String
  }
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ComponentSchemas {
      "example.example": ExampleExample
      "layout.navbar": LayoutNavbar
      "sections.animated-logo-row": SectionsAnimatedLogoRow
      "sections.carousel": SectionsCarousel
      "sections.contact-form": SectionsContactForm
      "sections.faq": SectionsFaq
      "sections.feature-grid": SectionsFeatureGrid
      "sections.heading-with-cta-button": SectionsHeadingWithCtaButton
      "sections.hero": SectionsHero
      "sections.horizontal-images": SectionsHorizontalImages
      "sections.image-with-cta-button": SectionsImageWithCtaButton
      "sections.newsletter": SectionsNewsletter
      "shared.accordions": SharedAccordions
      "shared.basic-image": SharedBasicImage
      "shared.feature-grid-item": SharedFeatureGridItem
      "shared.footer-item": SharedFooterItem
      "shared.grid-column": SharedGridColumn
      "shared.image-with-link": SharedImageWithLink
      "shared.link": SharedLink
      "shared.meta-social": SharedMetaSocial
      "shared.seo": SharedSeo
      "shared.seo-twitter": SharedSeoTwitter
    }
  }
}
