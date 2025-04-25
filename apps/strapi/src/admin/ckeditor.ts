import { defaultHtmlPreset } from "@_sh/strapi-plugin-ckeditor"

import type { PluginConfig, Preset } from "@_sh/strapi-plugin-ckeditor"

const materialColors = [
  { label: "red-50", color: "hsl(var(--red-50))" },
  { label: "red-100", color: "hsl(var(--red-100))" },
  { label: "red-200", color: "hsl(var(--red-200))" },
  { label: "red-300", color: "hsl(var(--red-300))" },
  { label: "red-400", color: "hsl(var(--red-400))" },
  { label: "red-500", color: "hsl(var(--red-500))" },
  { label: "red-600", color: "hsl(var(--red-600))" },
  { label: "red-700", color: "hsl(var(--red-700))" },
  { label: "red-800", color: "hsl(var(--red-800))" },
  { label: "red-900", color: "hsl(var(--red-900))" },
  { label: "red-950", color: "hsl(var(--red-950))" },

  { label: "lemon-50", color: "hsl(var(--lemon-50))" },
  { label: "lemon-100", color: "hsl(var(--lemon-100))" },
  { label: "lemon-200", color: "hsl(var(--lemon-200))" },
  { label: "lemon-300", color: "hsl(var(--lemon-300))" },
  { label: "lemon-400", color: "hsl(var(--lemon-400))" },
  { label: "lemon-500", color: "hsl(var(--lemon-500))" },
  { label: "lemon-600", color: "hsl(var(--lemon-600))" },
  { label: "lemon-700", color: "hsl(var(--lemon-700))" },
  { label: "lemon-800", color: "hsl(var(--lemon-800))" },
  { label: "lemon-900", color: "hsl(var(--lemon-900))" },
  { label: "lemon-950", color: "hsl(var(--lemon-950))" },
  { label: "charcoal-50", color: "hsl(var(--charcoal-50))" },
  { label: "charcoal-100", color: "hsl(var(--charcoal-100))" },
  { label: "charcoal-200", color: "hsl(var(--charcoal-200))" },
  { label: "charcoal-300", color: "hsl(var(--charcoal-300))" },
  { label: "charcoal-400", color: "hsl(var(--charcoal-400))" },
  { label: "charcoal-500", color: "hsl(var(--charcoal-500))" },
  { label: "charcoal-600", color: "hsl(var(--charcoal-600))" },
  { label: "charcoal-700", color: "hsl(var(--charcoal-700))" },
  { label: "charcoal-800", color: "hsl(var(--charcoal-800))" },
  { label: "charcoal-900", color: "hsl(var(--charcoal-900))" },
  { label: "charcoal-950", color: "hsl(var(--charcoal-950))" },

  { label: "bone", color: "hsl(var(--custom-bone))" },
  { label: "stroke", color: "hsl(var(--stroke))" },
  { label: "highEmphasis", color: "hsl(var(--text-primary-high-emphasis))" },
  { label: "lowEmphasis", color: "hsl(var(--text-primary-low-emphasis))" },
  { label: "disabled", color: "hsl(var(--text-primary-disabled))" },
  { label: "linkDefault", color: "hsl(var(--text-rich-link-default))" },
  { label: "linkHover", color: "hsl(var(--text-link-hover))" },
  { label: "linkActive", color: "hsl(var(--text-link-active))" },
  { label: "linkDisabled", color: "hsl(var(--text-link-disabled))" },
  { label: "lightBtnText", color: "hsl(var(--text-rich-light-btn-text))" },
  { label: "darkBtnText", color: "hsl(var(--text-rich-dark-btn-text))" },
  { label: "default", color: "hsl(var(--impact-default))" },
  { label: "hover", color: "hsl(var(--impact-hover))" },
  { label: "pressed", color: "hsl(var(--impact-pressed))" },
  { label: "disabled", color: "hsl(var(--impact-disabled))" },

  { label: "uppFill", color: "hsl(var(--market-up-fill))" },
  { label: "downFill", color: "hsl(var(--market-down-fill))" },
  { label: "upSolid", color: "hsl(var(--market-up-solid))" },
  { label: "downSolid", color: "hsl(var(--market-down-solid))" },

  { label: "buyDefault", color: "hsl(var(--trade-buy-default))" },
  { label: "buyPressed", color: "hsl(var(--trade-buy-pressed))" },
  { label: "buyDisabled", color: "hsl(var(--trade-buy-disabled))" },
  { label: "sellDefault", color: "hsl(var(--trade-sell-default))" },
  { label: "sellPressed", color: "hsl(var(--trade-sell-pressed))" },
  { label: "sellDisabled", color: "hsl(var(--trade-sell-disabled))" },

  { label: "attentionSolid", color: "hsl(var(--system-attention-solid))" },
  { label: "successSolid", color: "hsl(var(--system-success-solid))" },
  { label: "cautionSolid", color: "hsl(var(--system-caution-solid))" },
  { label: "critical", color: "hsl(var(--system-critical))" },
  { label: "neutral", color: "hsl(var(--system-neutral))" },
  { label: "attentionFill", color: "hsl(var(--system-attention-fill))" },
  { label: "successFill", color: "hsl(var(--system-success-fill))" },
  { label: "cautionFill", color: "hsl(var(--system-caution-fill))" },
  { label: "criticalFill", color: "hsl(var(--system-critical-fill))" },
  { label: "neutralFill", color: "hsl(var(--system-neutral-fill))" },
]

const ckEditorStyles = `
    .ck {
      --background: 0 0% 100%;
      --background-secondary: 0 0% 98.04%;
      --foreground: 240 10% 3.9%;
      --card: 0 0% 100%;
      --card-foreground: 240 10% 3.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 240 10% 3.9%;
      --primary: 240 5.9% 10%;
      --primary-foreground: 0 0% 98%;
      --secondary: 240 4.8% 95.9%;
      --secondary-foreground: 240 5.9% 10%;
      --muted: 240 4.8% 95.9%;
      --muted-foreground: 240 3.8% 46.1%;
      --accent: 240 4.8% 95.9%;
      --accent-foreground: 240 5.9% 10%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      --border: 36 8.47% 76.86%;
      --input: 240 5.9% 90%;
      --ring: 240 5.9% 10%;
      --radius: 1rem;
      --warning: 33 100% 50%;
      --warning-foreground: 210 40% 98%;
      --red-50: 355.71 100% 97.25%;
      --red-100: 356.13 100% 93.92%;
      --red-200: 355.79 100% 88.82%;
      --red-300: 355.67 100% 80.98%;
      --red-400: 355.66 100% 70.2%;
      --red-500: 355.85 96.91% 61.96%;
      --red-600: 355.71 83.33% 50.59%;
      --red-700: 355.69 84.98% 41.76%;
      --red-800: 355.83 80% 35.29%;
      --red-900: 355.71 71.79% 30.59%;
      --red-950: 355.52 84.81% 15.49%;
      --pale-100: 2 100% 66% 0.1;
      --lemon-50: 48 100% 96.08%;
      --lemon-100: 48 96.49% 88.82%;
      --lemon-200: 48.52 96.64% 76.67%;
      --lemon-300: 46.46 96.47% 66.67%;
      --lemon-400: 43.81 96.41% 56.27%;
      --lemon-500: 38.21 92.13% 50.2%;
      --lemon-600: 32.7 94.62% 43.73%;
      --lemon-700: 26.32 90.48% 37.06%;
      --lemon-800: 23.18 82.5% 31.37%;
      --lemon-900: 22.29 77.78% 26.47%;
      --lemon-950: 21.82 91.67% 14.12%;
      --mono-300: 36 8% 77%;
      --mono-400: 38 5% 67%;
      --mono-500: 34 3% 46%;
      --mono-600: 0 3% 22%;
      --mono-800: 0 5% 15%;
      --mono-900: 0 0% 0%;
      --charcoal-50: 0 6.67% 97.06%;
      --charcoal-100: 0 6.25% 93.73%;
      --charcoal-200: 0 7.04% 86.08%;
      --charcoal-300: 353.33 6.77% 73.92%;
      --charcoal-400: 355 5.83% 59.61%;
      --charcoal-500: 356 6.07% 48.43%;
      --charcoal-600: 355.38 6.47% 39.41%;
      --charcoal-700: 354 6.1% 32.16%;
      --charcoal-800: 0 5.71% 27.45%;
      --charcoal-900: 0 4.92% 23.92%;
      --charcoal-950: 0 5.26% 14.9%;
      --grayscale-charcoal: 0, 3%, 12%;
      --grayscale-4: 0 0% 74%;
      --elevation-6: 0 0% 0% 0.11;
      --stroke: 0 4.92% 23.92%;
      --mc-blue: 205 74% 41%;
      --bahia-dark-blue: 238 52% 38%;
      --bahia-light-blue: 204 100% 37%;
      --custom-red: 356 97% 62%;
      --fill-hover: 0 6.25% 93.73%;
      --custom-dark-red: 351 76% 46%;
      --custom-light-red: 2 100% 66%;
      --custom-bone: 37 30% 92%;
      --custom-charcoal: 0 5% 15%;
      --custom-orange: 34.14 98.35% 47.65%;
      --custom-teal: 182 54% 53%;
      --custom-lemon: 46 96% 67%;
      --custom-amethyst: 294 61% 22%;
      --text-primary-high-emphasis: 0 5.26% 14.9%;
      --text-primary-low-emphasis: 0 5.71% 27.45%;
      --text-primary-disabled: 355 5.83% 59.61%;
      --text-rich-link-default: 355.85 96.91% 61.96%;
      --text-link-hover: 355.71 83.33% 50.59%;
      --text-link-active: 355.69 84.98% 41.76%;
      --text-link-disabled: 356.13 100% 93.92%;
      --text-rich-light-btn-text: 36.92 30.23% 91.57%;
      --text-rich-dark-btn-text: 0 4.92% 23.92%;
      --impact-default: 46.46 96.47% 66.67%;
      --impact-hover: 43.81 96.41% 56.27%;
      --impact-pressed: 48.52 96.64% 76.67%;
      --impact-disabled: 48 96.49% 88.82%;
      --market-up-fill: 154.05 60.66% 88.04%;
      --market-down-fill: 356.76 94.87% 92.35%;
      --market-up-solid: 153.73 89.37% 40.59%;
      --market-down-solid: 355.85 96.91% 61.96%;
      --market-hero: 0 0% 94.9%;
      --trade-buy-default: 182.31 47.27% 43.14%;
      --trade-buy-pressed: 182.31 53.72% 52.55%;
      --trade-buy-disabled: 182.31 35.62% 71.37%;
      --trade-sell-default: 351.38 76.37% 46.47%;
      --trade-sell-pressed: 355.85 96.91% 61.96%;
      --trade-sell-disabled: 351.43 66.42% 73.14%;
      --system-attention-solid: 182.31 53.72% 52.55%;
      --system-success-solid: 156.23 100% 30.2%;
      --system-caution-solid: 34.17 100% 42.35%;
      --system-critical: 351.38 76.37% 46.47%;
      --system-neutral: 0 0% 54.9%;
      --system-attention-fill: 161.25 28.57% 89.02%;
      --system-success-fill: 140 28.77% 85.69%;
      --system-caution-fill: 34.5 58.82% 86.67%;
      --system-critical-fill: 2 48.39% 87.84%;
      --system-neutral-fill: 0 0% 94.9%;
    }
    .dark {
      --background: 240 10% 3.9%;
      --foreground: 0 0% 98%;
      --card: 240 10% 3.9%;
      --card-foreground: 0 0% 98%;
      --popover: 240 10% 3.9%;
      --popover-foreground: 0 0% 98%;
      --primary: 0 0% 98%;
      --primary-foreground: 240 5.9% 10%;
      --secondary: 240 3.7% 15.9%;
      --secondary-foreground: 0 0% 98%;
      --muted: 240 3.7% 15.9%;
      --muted-foreground: 240 5% 64.9%;
      --accent: 240 3.7% 15.9%;
      --accent-foreground: 0 0% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 0 0% 98%;
      --border: 240 3.7% 15.9%;
      --input: 240 3.7% 15.9%;
      --ring: 240 4.9% 83.9%;
    }

    .ck-heading_heading2 {
      font-size: 28px;
      line-height: 36px;
      font-weight: 600;
      margin-top: 16px;

      @media (min-width: 768px) {
        font-size: 34px;
        line-height: 44px;
      }

      @media (min-width: 1280px) {
        font-size: 40px;
        line-height: 52px;
      }
    }

  .ck-heading_heading3 {
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
    margin-top: 8px;

    @media (min-width: 768px) {
      font-size: 28px;
      line-height: 40px;
    }

    @media (min-width: 1280px) {
      font-size: 32px;
      line-height: 45px;
    }
  }

  .ck-heading_paragraph, b, strong{
      font-size: 20px;
      line-height: 32px;
      letter-spacing: 0.5px;
      color: black;
  }

  figure {
    margin-block: 24px;
  }

  figcaption {
    color: hsl(var(--mono-600));
    letter-spacing: 0.5px;
    line-height: 21px;
    font-size: 14px;

    @media (min-width: 768px) {
      font-size: 16px;
      line-height: 24px;
    }
  }

  a {
    color: hsl(var(--red-500));
  }

  i {
    font-weight: 400;
    margin-block: 8px;
  }

  table, image {
    width: 100%;
    object-fit: cover;
  }

  th, td {
    padding-inline: 24px;
    border: 1px solid transparent;
    text-align: start;
  }

  th:not(:last-child),
  td:not(:last-child) {
    border-right-color: hsl(var(--mono-400));
  }

  th {
    padding-block: 24px;
  }

  td {
    padding-block: 28px;
  }

  th,
  tr:not(:last-child) td {
    border-bottom-color: hsl(var(--mono-400));
  }

  tr:nth-child(even) td {
    background-color: hsla(var(--pale-100));
  }
`

const customConfig: Preset = {
  ...defaultHtmlPreset,
  name: "CustomCkEditor",
  description: "Custom CkEditor Config",

  styles: ckEditorStyles,
  editorConfig: {
    ...defaultHtmlPreset.editorConfig,
    fontColor: {
      ...defaultHtmlPreset.editorConfig.fontColor,
      colors: materialColors,
      columns: 12,
    },
    fontBackgroundColor: {
      ...defaultHtmlPreset.editorConfig.fontBackgroundColor,
      colors: materialColors,
      columns: 12,
    },
    placeholder: "Custom CkEditor Config",
    balloonToolbar: [
      "link",
      "fontSize",
      "italic",
      "bold",
      {
        label: "Other formatting options",
        icon: `
      <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" fill="none" width="24" height="24"/>
      <g>
      <path d="M14.348 12H21v2h-4.613c.24.515.368 1.094.368 1.748 0 1.317-.474 2.355-1.423 3.114-.947.76-2.266 1.138-3.956 1.138-1.557 0-2.934-.293-4.132-.878v-2.874c.985.44 1.818.75 2.5.928.682.18 1.306.27 1.872.27.68 0 1.2-.13 1.562-.39.363-.26.545-.644.545-1.158 0-.285-.08-.54-.24-.763-.16-.222-.394-.437-.704-.643-.18-.12-.483-.287-.88-.49H3v-2H14.347zm-3.528-2c-.073-.077-.143-.155-.193-.235-.126-.202-.19-.44-.19-.713 0-.44.157-.795.47-1.068.313-.273.762-.41 1.348-.41.492 0 .993.064 1.502.19.51.127 1.153.35 1.93.67l1-2.405c-.753-.327-1.473-.58-2.16-.76-.69-.18-1.414-.27-2.173-.27-1.544 0-2.753.37-3.628 1.108-.874.738-1.312 1.753-1.312 3.044 0 .302.036.58.088.848h3.318z"/>
      </g>
      </svg>`,
        items: ["underline", "strikethrough", "superscript", "subscript"],
      },
    ],
    toolbar: [
      "showBlocks",
      "|",
      "heading",
      "|",
      "fontColor", // this cannot be moved to balloon toolbar, otherwise the context for css vars is lost (as it's overridden during portal render)
      "fontBackgroundColor", // this cannot be moved to balloon toolbar, otherwise the context for css vars is lost (as it's overridden during portal render)
      "removeFormat",
      "|",
      "fontFamily",
      "alignment",
      "bulletedList",
      "numberedList",
      "todoList",
      "mediaEmbed",
      "insertImage",
      "strapiMediaLib",
      "blockquote",
      "insertTable",
      "htmlEmbed",
      "SourceEditing",
      "specialCharacters",
      "|",
      "undo",
      "redo",
    ],
    heading: {
      options: [
        {
          model: "heading1",
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4",
          view: "h4",
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
        {
          model: "heading5",
          view: "h5",
          title: "Heading 5",
          class: "ck-heading_heading5",
        },
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
      ],
    },
  },
}
const customSimpleFieldConfig: Preset = {
  ...defaultHtmlPreset,
  name: "CustomSimpleFieldCkEditor",
  description: "Custom Simple Field CkEditor Config",

  styles: ckEditorStyles,
  editorConfig: {
    ...defaultHtmlPreset.editorConfig,
    fontColor: {
      ...defaultHtmlPreset.editorConfig.fontColor,
      colors: materialColors,
      columns: 12,
    },
    fontBackgroundColor: {
      ...defaultHtmlPreset.editorConfig.fontBackgroundColor,
      colors: materialColors,
      columns: 12,
    },
    placeholder: "Custom Simple Field CkEditor Config",
    balloonToolbar: [
      "link",
      "fontSize",
      "italic",
      "bold",
      {
        label: "Other formatting options",
        icon: `
      <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" fill="none" width="24" height="24"/>
      <g>
      <path d="M14.348 12H21v2h-4.613c.24.515.368 1.094.368 1.748 0 1.317-.474 2.355-1.423 3.114-.947.76-2.266 1.138-3.956 1.138-1.557 0-2.934-.293-4.132-.878v-2.874c.985.44 1.818.75 2.5.928.682.18 1.306.27 1.872.27.68 0 1.2-.13 1.562-.39.363-.26.545-.644.545-1.158 0-.285-.08-.54-.24-.763-.16-.222-.394-.437-.704-.643-.18-.12-.483-.287-.88-.49H3v-2H14.347zm-3.528-2c-.073-.077-.143-.155-.193-.235-.126-.202-.19-.44-.19-.713 0-.44.157-.795.47-1.068.313-.273.762-.41 1.348-.41.492 0 .993.064 1.502.19.51.127 1.153.35 1.93.67l1-2.405c-.753-.327-1.473-.58-2.16-.76-.69-.18-1.414-.27-2.173-.27-1.544 0-2.753.37-3.628 1.108-.874.738-1.312 1.753-1.312 3.044 0 .302.036.58.088.848h3.318z"/>
      </g>
      </svg>`,
        items: ["underline", "strikethrough", "superscript", "subscript"],
      },
    ],
    toolbar: [
      "fontColor", // this cannot be moved to balloon toolbar, otherwise the context for css vars is lost (as it's overridden during portal render)
      "fontBackgroundColor", // this cannot be moved to balloon toolbar, otherwise the context for css vars is lost (as it's overridden during portal render)
      "removeFormat",
      "|",
      "SourceEditing",
      "|",
      "undo",
      "redo",
    ],
  },
}

const ckEditorConfig: PluginConfig = {
  presets: [customConfig, customSimpleFieldConfig],
}

export { ckEditorConfig }
