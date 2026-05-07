import Image, { type ImageProps } from "next/image"

/**
 * Optimized image component for local/static assets (public/ folder or static imports).
 *
 * Uses Next.js built-in Sharp optimizer — generates srcSet, converts to WebP,
 * and provides blur placeholders for static imports.
 *
 * For Strapi media, use StrapiBasicImage instead (routes through imgproxy).
 *
 * @example
 * // Static import — automatic width/height/blur placeholder
 * import heroImg from "@/assets/hero.jpg"
 * <StaticImage src={heroImg} alt="Hero" sizes="100vw" />
 *
 * @example
 * // Public folder — must provide width/height or fill
 * <StaticImage src="/images/logo.png" alt="Logo" width={200} height={50} />
 * <StaticImage src="/images/bg.jpg" alt="" fill sizes="100vw" />
 */
export function StaticImage({ alt, ...props }: ImageProps & { alt: string }) {
  return <Image alt={alt} {...props} unoptimized={false} />
}
