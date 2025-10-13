import withPlaiceholder from "@plaiceholder/next"
import { withSentryConfig } from "@sentry/nextjs"
import plugin from "next-intl/plugin"

import { env } from "./src/env.mjs"

const withNextIntl = plugin("./src/lib/i18n.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: env.NEXT_OUTPUT,
  reactStrictMode: true,
  experimental: {},
  transpilePackages: ["@repo/design-system"],
  images: {
    // Be aware that Strapi has optimization on by default
    // Do not optimize all images by default.
    // This is because the optimization process can be slow and resource-intensive. Instead, only optimize images that are requested by the browser.
    unoptimized: false,

    // AVIF generally takes 20% longer to encode but it compresses 20% smaller compared to WebP.
    // This means that the first time an image is requested, it will typically be slower and then subsequent requests that are cached will be faster.
    formats: ["image/webp" /* 'image/avif' */],

    // The optimized image file will be served for subsequent requests until the expiration is reached.
    // When a request is made that matches a cached but expired file, the expired image is served stale immediately.
    // Then the image is optimized again in the background (also called revalidation) and saved to the cache with the new expiration date.
    minimumCacheTTL: 60 * 15, // 15 minutes - after this time, the image will be revalidated

    // You can configure deviceSizes or imageSizes to reduce the total number of possible generated images.
    // Please check: https://nextjs.org/docs/14/app/api-reference/components/image#imagesizes
    deviceSizes: [420, 768, 1024],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },

  webpack: (config, { dev }) => {
    if (config.cache && !dev) {
      // Switching between memory and filesystem cache
      // Memory cache is faster and can be beneficial in environments with slow or limited disk access,
      // but it isn't persistent across builds and requires higher memory usage.
      // Filesystem cache survives across builds but may cause large `.next/cache` folder.
      config.cache = Object.freeze({
        type: env.WEBPACK_CACHE_TYPE || "filesystem",
      })
    }
    return config
  },
}

const withConfig = (() => {
  let config = withNextIntl(withPlaiceholder(nextConfig))

  config = withSentryConfig(config, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Pass org, project and auth token to be able to upload source maps
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    authToken: env.SENTRY_AUTH_TOKEN,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // sourcemaps: {
    //   // To disable sourcemap plugin, set this to true
    //   disable: true
    // }

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  })
  return config
})()

export default withConfig
