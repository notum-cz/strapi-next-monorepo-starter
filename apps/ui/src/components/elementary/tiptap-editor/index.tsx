import type { ID } from "@repo/strapi-types"
import type { JSONContent } from "@tiptap/core"
import ColorExtension from "@tiptap/extension-color"
import HighlightExtension from "@tiptap/extension-highlight"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { TableKit } from "@tiptap/extension-table"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import StarterKit from "@tiptap/starter-kit"
import type { NodeProps } from "@tiptap/static-renderer"
import { renderToReactElement } from "@tiptap/static-renderer/pm/react"
import type { Node as TiptapNode } from "prosemirror-model"
import type { ReactNode } from "react"

import AppLink from "@/components/elementary/AppLink"
import {
  HeadingWithSEOTag,
  StrapiImage,
} from "@/components/elementary/tiptap-editor/extensions"
import {
  imageAlignClassName,
  textAlignClassName,
} from "@/components/elementary/tiptap-editor/utils"
import Typography from "@/components/typography"
import type {
  FontWeight,
  TextColor,
  Variant,
} from "@/components/typography/config"
import Element from "@/components/typography/element"
import { safeJSONParse } from "@/lib/general-helpers"
import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"
import { cn } from "@/lib/styles"

export type TiptapRichTextProps = {
  content?:
    | string
    | JSONContent
    | {
        id?: ID
        content?: string | JSONContent | null
      }
    | null

  /** Default variant to be used for text nodes that are not marked with a specific style.
   * If not provided, defaults to "medium".
   */
  defaultVariant?: Variant

  /** Default font weight to be used for text nodes that are not marked with a specific weight.
   * If not provided, defaults to "light".
   */
  defaultWeight?: FontWeight

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
        mark: { attrs?: Record<string, unknown> }
        children: ReactNode | ReactNode[]
      }) => ReactNode
    >
  >
  className?: string
  textColor?: TextColor
  id?: ID
  linksTarget?: "_blank" | "_self"
}

export function TiptapRichText({
  content,
  defaultVariant = "medium",
  defaultWeight = "normal",
  nodeMapping = {},
  markMapping = {},
  className,
  textColor,
  id,
  linksTarget = "_self",
}: TiptapRichTextProps) {
  if (!content) {
    return null
  }

  const jsonContent = normalizeContent(content)

  if (!jsonContent?.type) {
    console.warn("TiptapRichText: content is not valid:", content)

    return null
  }

  return renderToReactElement({
    extensions: [
      StarterKit.configure({ heading: false }),
      HeadingWithSEOTag,
      Superscript,
      Subscript,
      TableKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      ColorExtension,
      HighlightExtension.configure({ multicolor: true }),
      StrapiImage,
    ],
    content: jsonContent,
    options: {
      markMapping: {
        code({ children }) {
          return (
            <code id={id} className="bg-gray-100 px-2 py-1 font-mono">
              {children}
            </code>
          )
        },
        link({ mark, children }) {
          const href = mark.attrs?.href || ""

          return (
            <AppLink
              id={id}
              href={href}
              className={cn("inline p-0 underline", className)}
              openInNewTab={linksTarget === "_blank"}
            >
              {children}
            </AppLink>
          )
        },
        underline({ children }) {
          return <u>{children}</u>
        },
        textStyle({ mark, children }) {
          const color = mark.attrs?.color as string | undefined

          if (!color) {
            return <>{children}</>
          }

          return <span style={{ color }}>{children}</span>
        },
        highlight({ mark, children }) {
          const color = mark.attrs?.color as string | undefined

          return (
            <mark style={color ? { backgroundColor: color } : undefined}>
              {children}
            </mark>
          )
        },
        ...markMapping,
      },
      nodeMapping: {
        heading({ node, children }) {
          const level = node.attrs?.level ?? 1
          const chosenTag = node.attrs?.tag || `h${level}`
          // allow explicit visual variant to be stored on the node (so the rendered style can differ from the semantic tag.)

          const variantFromNode = node.attrs?.variant as string | undefined

          // normalize variants so they match keys in variantStyles (e.g. 'heading2')
          const rawVariant = variantFromNode || `heading${level}`
          const variant = String(rawVariant).replaceAll("-", "") as Variant
          const Tag = chosenTag

          return (
            <Typography
              id={id}
              variant={variant}
              tag={Tag}
              fontWeight="normal"
              className={cn(
                textAlignClassName(node.attrs.textAlign),
                className
              )}
              textColor={textColor}
            >
              {children}
            </Typography>
          )
        },
        blockquote({ children }) {
          return (
            <Element
              id={id}
              tag="blockquote"
              variant="heading4"
              className="border-l-2 border-l-black pl-8"
            >
              {children}
            </Element>
          )
        },
        paragraph({ children, node }) {
          return (
            <Typography
              id={id}
              variant={defaultVariant}
              fontWeight={defaultWeight}
              tag="p"
              className={cn(
                "mb-4 last:mb-0",
                textAlignClassName(node.attrs.textAlign),
                className
              )}
              textColor={textColor}
            >
              {children}
            </Typography>
          )
        },
        orderedList({ children }) {
          return (
            <Element
              id={id}
              variant={defaultVariant}
              fontWeight={defaultWeight}
              tag="ol"
              className="tiptap-list"
              textColor={textColor}
            >
              {children}
            </Element>
          )
        },
        bulletList({ children }) {
          return (
            <Element
              id={id}
              variant={defaultVariant}
              fontWeight={defaultWeight}
              tag="ul"
              className="tiptap-list tiptap-unordered-list"
              textColor={textColor}
            >
              {children}
            </Element>
          )
        },
        table({ children }) {
          // Wrap table in a div that allows horizontal scrolling on small screens
          // Precise setting of table-fixed, w-max, etc. is needed to make sure
          // the table does not shrink too much and respects colwidth set on cells
          return (
            <div
              id={id}
              className="overflow-x-auto lg:w-full lg:overflow-x-visible"
            >
              <table className="w-max min-w-full table-fixed lg:w-full lg:max-w-full lg:min-w-auto lg:table-auto">
                {children}
              </table>
            </div>
          )
        },
        image({ node }) {
          const src = formatStrapiMediaUrl(
            node.attrs?.src as string | undefined
          )
          const alt = (node.attrs?.alt as string) ?? ""
          const title = node.attrs?.title as string | undefined
          const width = node.attrs?.width as number | undefined
          const height = node.attrs?.height as number | undefined
          const align = node.attrs?.["data-align"] as
            | "left"
            | "center"
            | "right"
            | null
            | undefined

          if (!src) {
            return null
          }

          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              id={id}
              src={src}
              alt={alt}
              title={title ?? undefined}
              width={width ?? undefined}
              height={height ?? undefined}
              className={cn("max-w-full", imageAlignClassName(align))}
            />
          )
        },
        tableHeader: renderTableCell,
        tableCell: renderTableCell,
        ...nodeMapping, // possible overrides from props
      },
    },
  })
}

function normalizeContent(
  content: NonNullable<TiptapRichTextProps["content"]>
): JSONContent | undefined {
  if (typeof content === "string") {
    return safeJSONParse<JSONContent>(content)
  }

  if ("type" in content && typeof content.type === "string") {
    return content
  }

  const nestedContent = content.content

  if (typeof nestedContent === "string") {
    return safeJSONParse<JSONContent>(nestedContent)
  }

  if (
    nestedContent &&
    typeof nestedContent === "object" &&
    "type" in nestedContent &&
    typeof nestedContent.type === "string"
  ) {
    return nestedContent
  }
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
