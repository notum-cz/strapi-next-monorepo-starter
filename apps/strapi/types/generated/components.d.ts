import type { Schema, Struct } from "@strapi/strapi"

export interface ElementsFooterItem extends Struct.ComponentSchema {
  collectionName: "components_elements_footer_items"
  info: {
    description: ""
    displayName: "FooterItem"
  }
  attributes: {
    links: Schema.Attribute.Component<"utilities.link", true>
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface EnumsPosition extends Struct.ComponentSchema {
  collectionName: "components_enums_positions"
  info: {
    displayName: "Position"
  }
  attributes: {}
}

export interface FormsContactForm extends Struct.ComponentSchema {
  collectionName: "components_forms_contact_forms"
  info: {
    displayName: "ContactForm"
  }
  attributes: {
    description: Schema.Attribute.Text
    gdpr: Schema.Attribute.Component<"utilities.link", false>
    title: Schema.Attribute.String
  }
}

export interface FormsNewsletterForm extends Struct.ComponentSchema {
  collectionName: "components_forms_newsletter_forms"
  info: {
    displayName: "Newsletter"
  }
  attributes: {
    description: Schema.Attribute.Text
    gdpr: Schema.Attribute.Component<"utilities.link", false>
    title: Schema.Attribute.String
  }
}

export interface LayoutNavbarItem extends Struct.ComponentSchema {
  collectionName: "components_layout_navbar_items"
  info: {
    displayName: "NavbarItem"
  }
  attributes: {
    categoryItems: Schema.Attribute.Component<"utilities.link", true>
    isCategoryLink: Schema.Attribute.Boolean
    label: Schema.Attribute.String
    link: Schema.Attribute.Component<"utilities.link", false>
  }
}

export interface SectionsAnimatedLogoRow extends Struct.ComponentSchema {
  collectionName: "components_sections_animated_logo_rows"
  info: {
    description: ""
    displayName: "AnimatedLogoRow"
  }
  attributes: {
    logos: Schema.Attribute.Component<"utilities.basic-image", true>
    title: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
  }
}

export interface SectionsCarousel extends Struct.ComponentSchema {
  collectionName: "components_sections_carousels"
  info: {
    description: ""
    displayName: "Carousel"
  }
  attributes: {
    images: Schema.Attribute.Component<"utilities.image-with-link", true>
    radius: Schema.Attribute.Enumeration<["sm", "md", "lg", "xl", "full"]>
  }
}

export interface SectionsCtaBanner extends Struct.ComponentSchema {
  collectionName: "components_sections_cta_banners"
  info: {
    displayName: "CTABanner"
  }
  attributes: {
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
    features: Schema.Attribute.Component<
      "shared.image-with-title-and-description",
      true
    >
    links: Schema.Attribute.Component<"utilities.link", true>
    title: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
  }
}

export interface SectionsFaq extends Struct.ComponentSchema {
  collectionName: "components_sections_faqs"
  info: {
    description: ""
    displayName: "Faq"
  }
  attributes: {
    accordions: Schema.Attribute.Component<"utilities.accordions", true>
    subTitle: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SectionsFeaturesList extends Struct.ComponentSchema {
  collectionName: "components_sections_features_lists"
  info: {
    displayName: "FeaturesList"
  }
  attributes: {
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
    features: Schema.Attribute.Component<
      "shared.image-with-title-and-description",
      true
    >
    image: Schema.Attribute.Component<"shared.image-with-config", false>
    listStyle: Schema.Attribute.Enumeration<["boxGrid", "grid", "list"]> &
      Schema.Attribute.DefaultTo<"list">
    title: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
  }
}

export interface SectionsHeadingWithCtaButton extends Struct.ComponentSchema {
  collectionName: "components_sections_heading_with_cta_buttons"
  info: {
    description: ""
    displayName: "HeadingWithCTAButton"
  }
  attributes: {
    cta: Schema.Attribute.Component<"utilities.link", false>
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
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
    links: Schema.Attribute.Component<"utilities.link", true>
    note: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
    tag: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
    title: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
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
    images: Schema.Attribute.Component<"utilities.image-with-link", true>
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
    image: Schema.Attribute.Component<"utilities.basic-image", false>
    link: Schema.Attribute.Component<"utilities.link", false>
    subText: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SectionsStatistics extends Struct.ComponentSchema {
  collectionName: "components_sections_statistics"
  info: {
    displayName: "Statistics"
  }
  attributes: {
    figures: Schema.Attribute.Component<"shared.figure", true>
  }
}

export interface SeoUtilitiesSeo extends Struct.ComponentSchema {
  collectionName: "components_seo_utilities_seos"
  info: {
    description: ""
    displayName: "Seo"
    icon: "search"
  }
  attributes: {
    applicationName: Schema.Attribute.String
    canonicalUrl: Schema.Attribute.String
    keywords: Schema.Attribute.Text
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160
      }>
    metaImage: Schema.Attribute.Media<"images">
    metaRobots: Schema.Attribute.Enumeration<
      [
        "all",
        "index",
        "index,follow",
        "noindex",
        "noindex,follow",
        "noindex,nofollow",
        "none",
        "noarchive",
        "nosnippet",
        "max-snippet",
      ]
    > &
      Schema.Attribute.DefaultTo<"all">
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60
      }>
    og: Schema.Attribute.Component<"seo-utilities.seo-og", false>
    structuredData: Schema.Attribute.JSON
    twitter: Schema.Attribute.Component<"seo-utilities.seo-twitter", false>
  }
}

export interface SeoUtilitiesSeoOg extends Struct.ComponentSchema {
  collectionName: "components_seo_utilities_seo_ogs"
  info: {
    displayName: "SeoOg"
    icon: "oneToMany"
  }
  attributes: {
    description: Schema.Attribute.String
    image: Schema.Attribute.Media<"images">
    siteName: Schema.Attribute.String
    title: Schema.Attribute.String
    type: Schema.Attribute.Enumeration<["website", "article"]> &
      Schema.Attribute.DefaultTo<"website">
    url: Schema.Attribute.String
  }
}

export interface SeoUtilitiesSeoTwitter extends Struct.ComponentSchema {
  collectionName: "components_seo_utilities_seo_twitters"
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

export interface SeoUtilitiesSocialIcons extends Struct.ComponentSchema {
  collectionName: "components_seo_utilities_social_icons"
  info: {
    displayName: "SocialIcons"
  }
  attributes: {
    socials: Schema.Attribute.Component<"utilities.image-with-link", true>
    title: Schema.Attribute.String
  }
}

export interface SharedFigure extends Struct.ComponentSchema {
  collectionName: "components_shared_figures"
  info: {
    displayName: "Figure"
  }
  attributes: {
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
    number: Schema.Attribute.BigInteger
    prefix: Schema.Attribute.String
    suffix: Schema.Attribute.String
  }
}

export interface SharedImageWithConfig extends Struct.ComponentSchema {
  collectionName: "components_shared_image_with_configs"
  info: {
    displayName: "ImageWithConfig"
  }
  attributes: {
    image: Schema.Attribute.Component<"utilities.basic-image", false>
    position: Schema.Attribute.Enumeration<["left", "right"]>
  }
}

export interface SharedImageWithTitleAndDescription
  extends Struct.ComponentSchema {
  collectionName: "components_shared_image_with_title_and_descriptions"
  info: {
    displayName: "ImageWithTitleAndDescription"
  }
  attributes: {
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
    image: Schema.Attribute.Component<"utilities.basic-image", false>
    title: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
  }
}

export interface UtilitiesAccordions extends Struct.ComponentSchema {
  collectionName: "components_utilities_accordions"
  info: {
    description: ""
    displayName: "Accordions"
  }
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required
    question: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface UtilitiesBasicImage extends Struct.ComponentSchema {
  collectionName: "components_utilities_basic_images"
  info: {
    displayName: "BasicImage"
  }
  attributes: {
    alt: Schema.Attribute.String
    fallbackSrc: Schema.Attribute.String
    height: Schema.Attribute.Integer
    media: Schema.Attribute.Media<"images" | "videos"> &
      Schema.Attribute.Required
    width: Schema.Attribute.Integer
  }
}

export interface UtilitiesCkEditorContent extends Struct.ComponentSchema {
  collectionName: "components_utilities_ck_editor_contents"
  info: {
    displayName: "CkEditorContent"
  }
  attributes: {
    content: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "defaultCkEditor"
        }
      >
  }
}

export interface UtilitiesCkEditorText extends Struct.ComponentSchema {
  collectionName: "components_utilities_ck_editor_texts"
  info: {
    displayName: "CkEditorText"
  }
  attributes: {
    content: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        "plugin::ckeditor5.CKEditor",
        {
          preset: "simpleCkEditor"
        }
      >
  }
}

export interface UtilitiesImageWithLink extends Struct.ComponentSchema {
  collectionName: "components_utilities_image_with_links"
  info: {
    description: ""
    displayName: "ImageWithLink"
  }
  attributes: {
    image: Schema.Attribute.Component<"utilities.basic-image", false>
    link: Schema.Attribute.Component<"utilities.link", false>
  }
}

export interface UtilitiesLink extends Struct.ComponentSchema {
  collectionName: "components_utilities_links"
  info: {
    displayName: "Link"
  }
  attributes: {
    decorations: Schema.Attribute.Component<"utilities.link-decorations", false>
    href: Schema.Attribute.String & Schema.Attribute.Required
    label: Schema.Attribute.String & Schema.Attribute.Required
    newTab: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>
    page: Schema.Attribute.Relation<"oneToOne", "api::page.page">
    type: Schema.Attribute.Enumeration<["external", "page"]> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"page">
  }
}

export interface UtilitiesLinkDecorations extends Struct.ComponentSchema {
  collectionName: "components_utilities_link_decorations"
  info: {
    displayName: "LinkDecorations"
  }
  attributes: {
    disableAnimations: Schema.Attribute.Boolean
    hasIcons: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>
    leftIcon: Schema.Attribute.Component<"utilities.basic-image", false>
    rightIcon: Schema.Attribute.Component<"utilities.basic-image", false>
    size: Schema.Attribute.Enumeration<
      ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"default">
    variant: Schema.Attribute.Enumeration<
      ["default", "destructive", "outline", "secondary", "ghost", "link"]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"link">
  }
}

export interface UtilitiesLinksWithTitle extends Struct.ComponentSchema {
  collectionName: "components_utilities_links_with_titles"
  info: {
    displayName: "LinksWithTitle"
  }
  attributes: {
    links: Schema.Attribute.Component<"utilities.link", true>
    title: Schema.Attribute.String
  }
}

export interface UtilitiesText extends Struct.ComponentSchema {
  collectionName: "components_utilities_texts"
  info: {
    displayName: "Text"
  }
  attributes: {
    text: Schema.Attribute.String
  }
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ComponentSchemas {
      "elements.footer-item": ElementsFooterItem
      "enums.position": EnumsPosition
      "forms.contact-form": FormsContactForm
      "forms.newsletter-form": FormsNewsletterForm
      "layout.navbar-item": LayoutNavbarItem
      "sections.animated-logo-row": SectionsAnimatedLogoRow
      "sections.carousel": SectionsCarousel
      "sections.cta-banner": SectionsCtaBanner
      "sections.faq": SectionsFaq
      "sections.features-list": SectionsFeaturesList
      "sections.heading-with-cta-button": SectionsHeadingWithCtaButton
      "sections.hero": SectionsHero
      "sections.horizontal-images": SectionsHorizontalImages
      "sections.image-with-cta-button": SectionsImageWithCtaButton
      "sections.statistics": SectionsStatistics
      "seo-utilities.seo": SeoUtilitiesSeo
      "seo-utilities.seo-og": SeoUtilitiesSeoOg
      "seo-utilities.seo-twitter": SeoUtilitiesSeoTwitter
      "seo-utilities.social-icons": SeoUtilitiesSocialIcons
      "shared.figure": SharedFigure
      "shared.image-with-config": SharedImageWithConfig
      "shared.image-with-title-and-description": SharedImageWithTitleAndDescription
      "utilities.accordions": UtilitiesAccordions
      "utilities.basic-image": UtilitiesBasicImage
      "utilities.ck-editor-content": UtilitiesCkEditorContent
      "utilities.ck-editor-text": UtilitiesCkEditorText
      "utilities.image-with-link": UtilitiesImageWithLink
      "utilities.link": UtilitiesLink
      "utilities.link-decorations": UtilitiesLinkDecorations
      "utilities.links-with-title": UtilitiesLinksWithTitle
      "utilities.text": UtilitiesText
    }
  }
}
