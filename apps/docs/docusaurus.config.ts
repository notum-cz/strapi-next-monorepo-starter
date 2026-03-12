import { themes as prismThemes } from "prism-react-renderer"
import type { Config } from "@docusaurus/types"
import type * as Preset from "@docusaurus/preset-classic"

const url = process.env.DOCUSAURUS_URL ?? "https://notum-cz.github.io"
const baseUrl = process.env.DOCUSAURUS_BASE_URL ?? "/"

const config: Config = {
  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: "/",
      },
    ],
  ],

  title: "Strapi Next Monorepo Starter",
  tagline: "Enterprise-grade Strapi v5 + Next.js starter template",
  url,
  baseUrl,
  onBrokenLinks: "warn",
  favicon: undefined,
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/notum-cz/strapi-next-monorepo-starter/edit/main/apps/docs/",
          lastVersion: "3.1.1",
          versions: {
            current: {
              label: "Current",
              path: "latest",
            },
            "3.1.1": {
              label: "3.1.1",
              path: "",
            },
          },
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "Strapi Next Starter",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        {
          type: "docsVersionDropdown",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} Notum Technologies. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ["bash", "json", "typescript"],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
