import { linkDecorationsPopulate } from "./LinkDecorations"

export const linkPopulate = {
  populate: {
    page: {
      /** fields key is not allowed here by Strapi v5 TypeScript types because nested populate (components, dynamic zones, relations inside on) only supports officially documented parameters. Although the REST API accepts fields at runtime for performance reasons, the typings are intentionally conservative and do not model this behavior, so TypeScript rejects it. */
      fields: ["fullPath"] as unknown as any,
    },
    decorations: linkDecorationsPopulate,
  },
} as const
