export const PASSWORD_MIN_LENGTH = 6 // this value is in sync with Strapi

/**
 * Cookie that flags a response as part of the Strapi preview iframe flow.
 * Set by `/api/preview` and read by the security-headers proxy to widen
 * `frame-ancestors` so the Strapi admin can iframe the previewed page.
 */
export const STRAPI_PREVIEW_FRAME_COOKIE = "__strapi_frame_preview_flag__"

// Hostnames that mean "this app is running on the developer's machine".
export const LOCAL_UI_HOSTNAMES = ["localhost", "127.0.0.1"]

// Local Strapi listens here. The two spellings are separate browser origins,
// so anything gating on one of them has to gate on both.
export const LOCAL_STRAPI_PORT = "1337"
export const LOCAL_STRAPI_ORIGINS = LOCAL_UI_HOSTNAMES.map(
  (hostname) => `http://${hostname}:${LOCAL_STRAPI_PORT}`
)
