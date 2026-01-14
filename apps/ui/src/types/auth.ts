// Type definitions for Better Auth with Strapi integration
// These types extend Better Auth's built-in types with Strapi-specific fields

/**
 * Extended User type with Strapi-specific fields
 */
export interface StrapiUser {
  // Standard Better Auth fields
  id: string
  email: string
  emailVerified: boolean
  name: string
  image?: string | null
  createdAt: Date
  updatedAt: Date

  // Strapi-specific fields
  strapiJWT?: string
  userId?: number
  blocked?: boolean
}

/**
 * Extended Session type with Strapi user
 */
export interface StrapiSession {
  user: StrapiUser
  session: {
    id: string
    userId: string
    expiresAt: Date
    token: string
    ipAddress?: string | null
    userAgent?: string | null
  }
}
