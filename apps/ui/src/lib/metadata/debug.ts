import type { Metadata } from "next"

/**
 * Debug utility to log SEO metadata generation in development
 */
export function debugSeoGeneration(
  metadata: Metadata,
  pageData?: any,
  seoData?: any,
  context?: string
) {
  if (process.env.NODE_ENV !== 'development') return

  console.group(`🔍 SEO Debug: ${context || 'Metadata Generation'}`)
  
  console.log('📄 Page Data:', {
    title: pageData?.title,
    breadcrumbTitle: pageData?.breadcrumbTitle,
    slug: pageData?.slug,
  })
  
  console.log('🎯 SEO Data:', {
    metaTitle: seoData?.metaTitle,
    metaDescription: seoData?.metaDescription,
    keywords: seoData?.keywords,
    hasStructuredData: !!seoData?.structuredData,
  })
  
  console.log('✅ Final Metadata:', {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    canonical: metadata.alternates?.canonical,
  })
  
  // Check for missing critical SEO elements
  const warnings = []
  if (!metadata.title) warnings.push('Missing title')
  if (!metadata.description) warnings.push('Missing description')
  if (typeof metadata.description === 'string' && metadata.description.length > 160) {
    warnings.push('Description too long (>160 chars)')
  }
  if (typeof metadata.title === 'string' && metadata.title.length > 60) {
    warnings.push('Title too long (>60 chars)')
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ SEO Warnings:', warnings)
  }
  
  console.groupEnd()
}