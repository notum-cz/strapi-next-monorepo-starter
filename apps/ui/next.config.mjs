import { withSentryConfig } from "@sentry/nextjs"
import plugin from "next-intl/plugin"

import { env } from "./src/env.mjs"

const withNextIntl = plugin("./src/lib/i18n.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: env.NEXT_OUTPUT,
  reactStrictMode: true,
  devIndicators: {
    position: "bottom-right",
  },
  // Enable cacheComponents when caching strategy is introduced
  // cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  reactCompiler: true,
  transpilePackages: ["@repo/design-system"],
  images: {
    // See apps/ui/README.md#image-optimization for the full policy.
    // Keep global optimization enabled so components can opt in/out.
    // Do not set `unoptimized: true` globally: Next.js applies it to every
    // image and component-level `unoptimized={false}` cannot re-enable loaders.
    //
    // Image ownership in this app:
    // - Strapi media + IMGPROXY_URL: StrapiBasicImage uses imgproxy URLs.
    //   Next generates responsive srcsets, but imgproxy does the processing.
    // - Strapi media without IMGPROXY_URL: StrapiBasicImage is unoptimized and
    //   loads the Strapi URL directly, useful for local development.
    // - StaticImage: uses Next's Sharp optimizer for local/static assets only.
    // unoptimized: true,

    // Used only by Next's built-in optimizer, mainly StaticImage.
    // imgproxy/external services choose their own output format.
    formats: ["image/webp"],

    // Cache TTL for images processed by Next's built-in optimizer.
    minimumCacheTTL: 60 * 60, // 1 hour

    // Widths for generated srcsets. With imgproxy these become external
    // imgproxy URLs; with StaticImage they are processed by Next.
    // Covers: mobile 1x (420), tablet (768), desktop 1x (1024),
    // large desktop / mobile 2x (1440), desktop 2x retina (2048).
    deviceSizes: [420, 768, 1024, 1440, 2048],

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

  // Turbopack configuration (replaces webpack config)
  // Turbopack has built-in intelligent caching, so no manual cache configuration needed
  // Note: Custom webpack loaders/plugins are not supported in Turbopack
}

const withConfig = (() => {
  let config = withNextIntl(nextConfig)

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
