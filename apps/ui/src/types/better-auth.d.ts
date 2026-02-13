// Better Auth type declarations with Strapi custom fields
// Type augmentation for Better Auth to include Strapi-specific fields

// Since Better Auth uses type inference from the actual auth instance,
// the types are automatically inferred from the data we return in endpoints.
// This file provides type helpers for when we need explicit types.

// Type helper for Better Auth User with Strapi fields
export type BetterAuthUserWithStrapi = {
  id: string
  email: string
  emailVerified: boolean
  name: string
  image?: string | null
  createdAt: Date
  updatedAt: Date
  strapiJWT?: string
  userId?: number
  blocked?: boolean
  provider?: string // OAuth provider (e.g., "github", "google") or "credentials" for email/password
}

// Type helper for Better Auth Session with Strapi user
export type BetterAuthSessionWithStrapi = {
  user: BetterAuthUserWithStrapi | null
  session: {
    id: string
    userId: string
    expiresAt: Date
    token: string
    ipAddress?: string | null
    userAgent?: string | null
  } | null
}
