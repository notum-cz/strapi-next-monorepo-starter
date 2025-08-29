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

export interface SectionsAdaptiveGallery extends Struct.ComponentSchema {
  collectionName: "components_sections_adaptive_gallery"
  info: {
    description: "A responsive image gallery component with customizable layouts, aspect ratios, and load more functionality"
    displayName: "AdaptiveGallery"
  }
  attributes: {
    desktopColumns: Schema.Attribute.Enumeration<
      [
        "1 (single column)",
        "2 (two columns)",
        "3 (three columns)",
        "4 (four columns)",
        "5 (five columns)",
        "6 (six columns)",
      ]
    > &
      Schema.Attribute.DefaultTo<"3">
    desktopLayout: Schema.Attribute.Enumeration<
      ["slider (scrollable columns)", "grid (multiple images in columns)"]
    > &
      Schema.Attribute.DefaultTo<"grid">
    gap: Schema.Attribute.Enumeration<
      [
        "1 (4px - grid only)",
        "2 (8px - grid only)",
        "3 (12px - grid only)",
        "4 (16px - grid only)",
        "6 (24px - grid only)",
        "8 (32px - grid only)",
      ]
    > &
      Schema.Attribute.DefaultTo<"4">
    imageAspectRatio: Schema.Attribute.Enumeration<
      [
        "square (1:1 ratio)",
        "landscape (4:3 ratio)",
        "portrait (3:4 ratio)",
        "auto (natural proportions)",
      ]
    > &
      Schema.Attribute.DefaultTo<"landscape">
    images: Schema.Attribute.Component<"utilities.image-with-link", true>
    lazyLoading: Schema.Attribute.Enumeration<
      ["enabled (load images on demand)", "disabled (load all images)"]
    > &
      Schema.Attribute.DefaultTo<"enabled">
    mobileColumns: Schema.Attribute.Enumeration<
      ["1 (single column)", "2 (two columns)", "3 (three columns)"]
    > &
      Schema.Attribute.DefaultTo<"2">
    mobileLayout: Schema.Attribute.Enumeration<
      ["slider (one image at a time)", "grid (multiple images in columns)"]
    > &
      Schema.Attribute.DefaultTo<"slider">
    sliderLoop: Schema.Attribute.Enumeration<
      ["enabled (continuous loop)", "disabled (stop at ends)"]
    > &
      Schema.Attribute.DefaultTo<"disabled">
    subTitle: Schema.Attribute.Text
    title: Schema.Attribute.Text
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
    text: Schema.Attribute.String
  }
}

export interface SectionsAttachmentDownload extends Struct.ComponentSchema {
  collectionName: "components_sections_attachment_downloads"
  info: {
    description: ""
    displayName: "Attachment Download"
  }
  attributes: {
    buttonLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<"Download Now">
    description: Schema.Attribute.Text & Schema.Attribute.Required
    file: Schema.Attribute.Media<"files"> & Schema.Attribute.Required
    statusText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<"Ready to download">
    title: Schema.Attribute.String & Schema.Attribute.Required
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
    image: Schema.Attribute.Component<"utilities.basic-image", false>
    imageAlignment: Schema.Attribute.Enumeration<["left", "center", "right"]> &
      Schema.Attribute.DefaultTo<"center">
    links: Schema.Attribute.Component<"utilities.link", true>
    steps: Schema.Attribute.Component<"utilities.text", true>
    subTitle: Schema.Attribute.String
    title: Schema.Attribute.String
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

export interface SectionsTimeline extends Struct.ComponentSchema {
  collectionName: "components_sections_timelines"
  info: {
    description: ""
    displayName: "Timeline"
  }
  attributes: {
    milestones: Schema.Attribute.Component<"utilities.timeline-item", true>
    subTitle: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SeoUtilitiesMetaSocial extends Struct.ComponentSchema {
  collectionName: "components_seo_utilities_meta_socials"
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

export interface SeoUtilitiesSeo extends Struct.ComponentSchema {
  collectionName: "components_seo_utilities_seos"
  info: {
    description: ""
    displayName: "seo"
    icon: "search"
  }
  attributes: {
    applicationName: Schema.Attribute.String
    canonicalUrl: Schema.Attribute.String
    email: Schema.Attribute.String
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
    siteName: Schema.Attribute.String
    structuredData: Schema.Attribute.JSON
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

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: "components_shared_open_graphs"
  info: {
    displayName: "openGraph"
    icon: "project-diagram"
  }
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200
      }>
    ogImage: Schema.Attribute.Media<"images">
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70
      }>
    ogType: Schema.Attribute.String
    ogUrl: Schema.Attribute.String
  }
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: "components_shared_seos"
  info: {
    displayName: "seo"
    icon: "search"
  }
  attributes: {
    canonicalURL: Schema.Attribute.String
    keywords: Schema.Attribute.Text
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160
        minLength: 50
      }>
    metaImage: Schema.Attribute.Media<"images">
    metaRobots: Schema.Attribute.String
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60
      }>
    metaViewport: Schema.Attribute.String
    openGraph: Schema.Attribute.Component<"shared.open-graph", false>
    structuredData: Schema.Attribute.JSON
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
    alt: Schema.Attribute.String & Schema.Attribute.Required
    media: Schema.Attribute.Media<"images" | "videos"> &
      Schema.Attribute.Required
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

export interface UtilitiesDesignerTitle extends Struct.ComponentSchema {
  collectionName: "components_utilities_designer_titles"
  info: {
    description: "Animated title that transforms text to show nickname origin"
    displayName: "Designer Title"
    icon: "magic"
  }
  attributes: {
    config: Schema.Attribute.JSON & Schema.Attribute.Required
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
    description: ""
    displayName: "Link"
  }
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required
    label: Schema.Attribute.String & Schema.Attribute.Required
    newTab: Schema.Attribute.Boolean
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

export interface UtilitiesSocialIcon extends Struct.ComponentSchema {
  collectionName: "components_utilities_social_icons"
  info: {
    description: ""
    displayName: "socialIcon"
  }
  attributes: {
    customIcon: Schema.Attribute.String
    platform: Schema.Attribute.Enumeration<
      [
        "github",
        "linkedin",
        "twitter",
        "facebook",
        "instagram",
        "youtube",
        "tiktok",
        "pinterest",
        "reddit",
        "tumblr",
        "snapchat",
        "threads",
        "discord",
        "twitch",
        "telegram",
        "whatsapp",
      ]
    > &
      Schema.Attribute.Required
    url: Schema.Attribute.String & Schema.Attribute.Required
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

export interface UtilitiesTimelineItem extends Struct.ComponentSchema {
  collectionName: "components_utilities_timeline_items"
  info: {
    description: ""
    displayName: "Timeline Item"
  }
  attributes: {
    company: Schema.Attribute.String
    date: Schema.Attribute.String & Schema.Attribute.Required
    description: Schema.Attribute.Text & Schema.Attribute.Required
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ComponentSchemas {
      "elements.footer-item": ElementsFooterItem
      "forms.contact-form": FormsContactForm
      "forms.newsletter-form": FormsNewsletterForm
      "sections.adaptive-gallery": SectionsAdaptiveGallery
      "sections.animated-logo-row": SectionsAnimatedLogoRow
      "sections.attachment-download": SectionsAttachmentDownload
      "sections.faq": SectionsFaq
      "sections.heading-with-cta-button": SectionsHeadingWithCtaButton
      "sections.hero": SectionsHero
      "sections.image-with-cta-button": SectionsImageWithCtaButton
      "sections.timeline": SectionsTimeline
      "seo-utilities.meta-social": SeoUtilitiesMetaSocial
      "seo-utilities.seo": SeoUtilitiesSeo
      "seo-utilities.seo-og": SeoUtilitiesSeoOg
      "seo-utilities.seo-twitter": SeoUtilitiesSeoTwitter
      "seo-utilities.social-icons": SeoUtilitiesSocialIcons
      "shared.open-graph": SharedOpenGraph
      "shared.seo": SharedSeo
      "utilities.accordions": UtilitiesAccordions
      "utilities.basic-image": UtilitiesBasicImage
      "utilities.ck-editor-content": UtilitiesCkEditorContent
      "utilities.designer-title": UtilitiesDesignerTitle
      "utilities.image-with-link": UtilitiesImageWithLink
      "utilities.link": UtilitiesLink
      "utilities.links-with-title": UtilitiesLinksWithTitle
      "utilities.social-icon": UtilitiesSocialIcon
      "utilities.text": UtilitiesText
      "utilities.timeline-item": UtilitiesTimelineItem
    }
  }
}
