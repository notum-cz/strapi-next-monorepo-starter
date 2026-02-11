import { ReactNode } from "react"
import { JSONContent } from "@tiptap/core"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { TableKit } from "@tiptap/extension-table"
import TextAlign from "@tiptap/extension-text-align"
import StarterKit from "@tiptap/starter-kit"
import { NodeProps } from "@tiptap/static-renderer"
import { renderToReactElement } from "@tiptap/static-renderer/pm/react"
import { Node as TiptapNode } from "prosemirror-model"

import type { FontWeight, Variant } from "@/components/typography"

import { safeJSONParse } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import AppLink from "@/components/elementary/AppLink"
import {
  HeadingWithSEOTag,
  OnlyCursive,
} from "@/components/elementary/tiptap-editor/extensions"
import { textAlignClassName } from "@/components/elementary/tiptap-editor/utils"
import Typography from "@/components/typography"

export type TiptapRichTextProps = {
  content?: string | null

  /** Default variant to be used for text nodes that are not marked with a specific style.
   * If not provided, defaults to "medium".
   */
  defaultVariant?: Variant

  /** Default font weight to be used for text nodes that are not marked with a specific weight.
   * If not provided, defaults to "light".
   */
  defaultWeight?: FontWeight

  /** How text marked as AccentCursive in Tiptap should be styled.
   * - "accent-cursive": applies italic and text-accent-dark color
   * - "only-cursive": applies only italic
   * - "no-accent": no accent color and no italic applied
   * Default is `accent-cursive`.
   */
  accentCursive?: "accent-cursive" | "only-cursive" | "no-accent"

  nodeMapping?: Record<
    string,
    NoInfer<(ctx: NodeProps<TiptapNode, ReactNode | ReactNode[]>) => ReactNode>
  >

  markMapping?: Record<
    string,
    NoInfer<
      ({
        mark,
        children,
      }: {
        mark: any
        children: ReactNode | ReactNode[]
      }) => ReactNode
    >
  >
}

export function TiptapRichText({
  content,
  accentCursive,
  defaultVariant = "medium",
  defaultWeight = "normal",
  nodeMapping = {},
  markMapping = {},
}: TiptapRichTextProps) {
  if (!content) {
    return null
  }

  const jsonContent = safeJSONParse(content) as JSONContent

  if (!jsonContent?.type) {
    console.warn("TiptapRichText: content is not valid:", content)
    return null
  }

  return renderToReactElement({
    extensions: [
      StarterKit.configure({ heading: false }),
      HeadingWithSEOTag,
      OnlyCursive,
      Superscript,
      Subscript,
      TableKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: jsonContent,
    options: {
      markMapping: {
        code({ children }) {
          return (
            <code className="bg-gray-100 px-2 py-1 font-mono">{children}</code>
          )
        },
        link({ mark, children }) {
          const href = mark.attrs?.href || ""

          return (
            <AppLink href={href} className="inline p-0 underline">
              {children}
            </AppLink>
          )
        },
        accentCursive({ children }) {
          let className = "text-accent-dark italic"
          if (accentCursive === "only-cursive") className = "italic"
          if (accentCursive === "no-accent") className = ""
          return <span className={className}>{children}</span>
        },
        onlyCursive({ children }) {
          return <span className="italic">{children}</span>
        },
        ...markMapping,
      },
      nodeMapping: {
        heading({ node, children }) {
          const level = node.attrs?.level ?? 1
          const chosenTag = node.attrs?.tag || `h${level}`
          const variant = `heading-${level}` as Variant
          const Tag = chosenTag
          return (
            <Typography
              variant={variant}
              tag={Tag}
              fontWeight="normal"
              className={textAlignClassName(node.attrs.textAlign)}
            >
              {children}
            </Typography>
          )
        },
        blockquote({ children }) {
          return (
            <Typography
              variant="heading1"
              tag="blockquote"
              className="border-l-2 border-l-black pl-[40px]"
            >
              {children}
            </Typography>
          )
        },
        paragraph({ children, node }) {
          return (
            <Typography
              variant={defaultVariant}
              fontWeight={defaultWeight}
              tag="p"
              className={cn(
                "mb-4 last:mb-0",
                textAlignClassName(node.attrs.textAlign)
              )}
            >
              {children}
            </Typography>
          )
        },
        orderedList({ children }) {
          return (
            <Typography
              variant={defaultVariant}
              fontWeight={defaultWeight}
              tag="ol"
              className="tiptap-list"
            >
              {children}
            </Typography>
          )
        },
        bulletList({ children }) {
          return (
            <Typography
              variant={defaultVariant}
              fontWeight={defaultWeight}
              tag="ul"
              className="tiptap-list tiptap-unordered-list"
            >
              {children}
            </Typography>
          )
        },
        table({ children }) {
          // Wrap table in a div that allows horizontal scrolling on small screens
          // Precise setting of table-fixed, w-max, etc. is needed to make sure
          // the table does not shrink too much and respects colwidth set on cells
          return (
            <div className="overflow-x-auto lg:w-full lg:overflow-x-visible">
              <table className="w-max min-w-full table-fixed lg:w-full lg:max-w-full lg:min-w-auto lg:table-auto">
                {children}
              </table>
            </div>
          )
        },
        tableHeader: renderTableCell,
        tableCell: renderTableCell,
        ...nodeMapping, // possible overrides from props
      },
    },
  })
}

/* To simplify editor we do not distinguish between header and body cells.
The user should use bold text in cells they want to appear as header cells. */
function renderTableCell(ctx: NodeProps<TiptapNode, ReactNode | ReactNode[]>) {
  const { node, children } = ctx
  const style = {
    // convert colwidth number to css width in px if set
    width: node.attrs.colwidth && node.attrs.colwidth + "px",
    verticalAlign: "text-top",
  }
  return (
    <td className="p-2" style={style} {...node.attrs}>
      {children}
    </td>
  )
}
