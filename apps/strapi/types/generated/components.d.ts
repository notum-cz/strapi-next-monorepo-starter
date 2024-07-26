import type { Attribute, Schema } from "@strapi/strapi"

export interface LayoutNavbar extends Schema.Component {
  collectionName: "components_layout_navbars"
  info: {
    displayName: "Navbar"
    description: ""
  }
  attributes: {
    links: Attribute.Component<"shared.link", true>
    logoImage: Attribute.Component<"shared.image-with-link">
  }
}

export interface SectionsAnimatedLogoRow extends Schema.Component {
  collectionName: "components_sections_animated_logo_rows"
  info: {
    displayName: "AnimatedLogoRow"
    description: ""
  }
  attributes: {
    text: Attribute.String & Attribute.Required
    isVisible: Attribute.Boolean & Attribute.DefaultTo<true>
    logos: Attribute.Component<"shared.basic-image", true>
  }
}

export interface SectionsCarousel extends Schema.Component {
  collectionName: "components_sections_carousels"
  info: {
    displayName: "Carousel"
    description: ""
  }
  attributes: {
    images: Attribute.Component<"shared.image-with-link", true>
    radius: Attribute.Enumeration<["sm", "md", "lg", "xl", "full"]>
    isVisible: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>
  }
}

export interface SectionsFaq extends Schema.Component {
  collectionName: "components_sections_faqs"
  info: {
    displayName: "Faq"
    description: ""
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    accordions: Attribute.Component<"shared.accordions", true>
    subTitle: Attribute.String
    isVisible: Attribute.Boolean & Attribute.DefaultTo<true>
  }
}

export interface SectionsFeatureGrid extends Schema.Component {
  collectionName: "components_sections_feature_grids"
  info: {
    displayName: "FeatureGrid"
    description: ""
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    items: Attribute.Component<"shared.feature-grid-item", true>
    imageSize: Attribute.Integer & Attribute.Required
    gridCol: Attribute.Component<"shared.grid-column">
    isVisible: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>
    imageRadius: Attribute.Enumeration<["sm", "md", "lg", "xl", "full"]>
  }
}

export interface SectionsHeadingWithCtaButton extends Schema.Component {
  collectionName: "components_sections_heading_with_cta_buttons"
  info: {
    displayName: "HeadingWithCTAButton"
    description: ""
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    subText: Attribute.String
    cta: Attribute.Component<"shared.link">
    isVisible: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>
  }
}

export interface SectionsHero extends Schema.Component {
  collectionName: "components_sections_heroes"
  info: {
    displayName: "Hero"
    description: ""
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    subTitle: Attribute.String
    links: Attribute.Component<"shared.link", true>
    image: Attribute.Component<"shared.basic-image">
    isVisible: Attribute.Boolean & Attribute.DefaultTo<true>
    bgColor: Attribute.String &
      Attribute.CustomField<"plugin::color-picker.color">
  }
}

export interface SectionsHorizontalImages extends Schema.Component {
  collectionName: "components_sections_horizontal_images"
  info: {
    displayName: "HorizontalImages"
    description: ""
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    isVisible: Attribute.Boolean & Attribute.DefaultTo<true>
    images: Attribute.Component<"shared.image-with-link", true>
    spacing: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0
          max: 20
        },
        number
      >
    imageRadius: Attribute.Enumeration<["sm", "md", "lg", "xl", "full"]>
    fixedImageHeight: Attribute.Integer
    fixedImageWidth: Attribute.Integer
  }
}

export interface SectionsImageWithCtaButton extends Schema.Component {
  collectionName: "components_sections_image_with_cta_buttons"
  info: {
    displayName: "ImageWithCTAButton"
    description: ""
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    subText: Attribute.String
    image: Attribute.Component<"shared.basic-image">
    link: Attribute.Component<"shared.link">
    isVisible: Attribute.Boolean & Attribute.DefaultTo<true>
  }
}

export interface SharedAccordions extends Schema.Component {
  collectionName: "components_shared_accordions"
  info: {
    displayName: "Accordions"
    description: ""
  }
  attributes: {
    question: Attribute.String & Attribute.Required
    answer: Attribute.Text & Attribute.Required
  }
}

export interface SharedBasicImage extends Schema.Component {
  collectionName: "components_shared_basic_images"
  info: {
    displayName: "BasicImage"
    description: ""
  }
  attributes: {
    media: Attribute.Media<"images" | "videos"> & Attribute.Required
    alt: Attribute.String & Attribute.Required
    width: Attribute.Integer
    height: Attribute.Integer
    fallbackSrc: Attribute.String
  }
}

export interface SharedFeatureGridItem extends Schema.Component {
  collectionName: "components_shared_feature_grid_items"
  info: {
    displayName: "FeatureGridItem"
    description: ""
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    subTitle: Attribute.String
    image: Attribute.Component<"shared.basic-image">
  }
}

export interface SharedFooterItem extends Schema.Component {
  collectionName: "components_shared_footer_items"
  info: {
    displayName: "FooterItem"
    description: ""
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    links: Attribute.Component<"shared.link", true>
  }
}

export interface SharedGridColumn extends Schema.Component {
  collectionName: "components_shared_grid_columns"
  info: {
    displayName: "GridColumn"
  }
  attributes: {
    desktop: Attribute.Integer & Attribute.Required
    tablet: Attribute.Integer & Attribute.Required
    mobile: Attribute.Integer & Attribute.Required
  }
}

export interface SharedImageWithLink extends Schema.Component {
  collectionName: "components_shared_image_with_links"
  info: {
    displayName: "ImageWithLink"
    description: ""
  }
  attributes: {
    image: Attribute.Component<"shared.basic-image">
    link: Attribute.Component<"shared.link">
  }
}

export interface SharedLink extends Schema.Component {
  collectionName: "components_shared_links"
  info: {
    displayName: "Link"
    description: ""
  }
  attributes: {
    href: Attribute.String & Attribute.Required
    newTab: Attribute.Boolean & Attribute.DefaultTo<false>
    label: Attribute.String
  }
}

export interface SharedMetaSocial extends Schema.Component {
  collectionName: "components_shared_meta_socials"
  info: {
    displayName: "metaSocial"
    icon: "project-diagram"
  }
  attributes: {
    socialNetwork: Attribute.Enumeration<["Facebook", "Twitter"]> &
      Attribute.Required
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60
      }>
    description: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 65
      }>
    image: Attribute.Media<"images" | "files" | "videos">
  }
}

export interface SharedSeoTwitter extends Schema.Component {
  collectionName: "components_shared_seo_twitters"
  info: {
    displayName: "SeoTwitter"
    icon: "oneToMany"
  }
  attributes: {
    card: Attribute.String
    title: Attribute.String
    description: Attribute.String
    siteId: Attribute.String
    creator: Attribute.String
    creatorId: Attribute.String
    images: Attribute.Media<"images", true>
  }
}

export interface SharedSeo extends Schema.Component {
  collectionName: "components_shared_seos"
  info: {
    displayName: "seo"
    icon: "search"
  }
  attributes: {
    metaTitle: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 60
      }>
    metaDescription: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 160
      }>
    metaImage: Attribute.Media<"images">
    keywords: Attribute.Text
    metaRobots: Attribute.String
    twitter: Attribute.Component<"shared.seo-twitter">
    applicationName: Attribute.String
    siteName: Attribute.String
    email: Attribute.String
  }
}

declare module "@strapi/types" {
  export module Shared {
    export interface Components {
      "layout.navbar": LayoutNavbar
      "sections.animated-logo-row": SectionsAnimatedLogoRow
      "sections.carousel": SectionsCarousel
      "sections.faq": SectionsFaq
      "sections.feature-grid": SectionsFeatureGrid
      "sections.heading-with-cta-button": SectionsHeadingWithCtaButton
      "sections.hero": SectionsHero
      "sections.horizontal-images": SectionsHorizontalImages
      "sections.image-with-cta-button": SectionsImageWithCtaButton
      "shared.accordions": SharedAccordions
      "shared.basic-image": SharedBasicImage
      "shared.feature-grid-item": SharedFeatureGridItem
      "shared.footer-item": SharedFooterItem
      "shared.grid-column": SharedGridColumn
      "shared.image-with-link": SharedImageWithLink
      "shared.link": SharedLink
      "shared.meta-social": SharedMetaSocial
      "shared.seo-twitter": SharedSeoTwitter
      "shared.seo": SharedSeo
    }
  }
}
