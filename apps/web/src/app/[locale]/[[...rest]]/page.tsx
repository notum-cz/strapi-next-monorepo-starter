import { notFound } from 'next/navigation';

import { PageBuilder } from '@/components/page-builder';
import { getDefaultMetadata } from '@/lib/metadata';
import { getPageData } from '@/lib/firebase-api/content/server'; // Placeholder for Firebase API call
import { getTranslations } from 'next-intl/server';

// Placeholder for metadata generation, to be replaced with Firebase data
export async function generateMetadata({ params }: {
  params: { rest: string[] | undefined; locale: string };
}) {
  const slug = params.rest || ['/'];

  const pageData = await getPageData({ // Placeholder
    slug,
    locale: params.locale,
  });

  if (!pageData) {
    const t = await getTranslations({
      locale: params.locale,
      namespace: 'Metadata',
    });
    return getDefaultMetadata({
      title: t('notFound.title'),
      description: t('notFound.description'),
    });
  }

  const { seo } = pageData; // Assuming SEO data is part of pageData

  if (!seo) {
    const t = await getTranslations({
      locale: params.locale,
      namespace: 'Metadata',
    });
    return getDefaultMetadata({
      title: t('home.title'),
      description: t('home.description'),
    });
  }

  return getDefaultMetadata({
    title: seo.metaTitle,
    description: seo.metaDescription,
    ...seo,
  });
}

export default async function RestPage({ params }: {
  params: { rest: string[] | undefined; locale: string };
}) {
  const slug = params.rest || ['/'];
  const page = await getPageData({ // Placeholder
    slug,
    locale: params.locale,
  });

  if (!page) {
    notFound();
  }

  const { content, hide_breadcrumbs } = page; // Assuming these fields exist

  if (!content) {
    return null;
  }

  return <PageBuilder items={content} withBreadcrumbs={!hide_breadcrumbs} />;
}
