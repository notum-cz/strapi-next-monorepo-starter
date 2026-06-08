export const PASSWORD_MIN_LENGTH = 6 // this value is in sync with Strapi

/**
 * Cookie that flags a response as part of the Strapi preview iframe flow.
 * Set by `/api/preview` and read by the security-headers proxy to widen
 * `frame-ancestors` so the Strapi admin can iframe the previewed page.
 */
export const STRAPI_PREVIEW_FRAME_COOKIE = "__strapi_frame_preview_flag__"
