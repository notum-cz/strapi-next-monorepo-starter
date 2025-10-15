import '../../../../styles/globals.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { ClientProviders } from '@/components/providers/ClientProviders';
import { ServerProviders } from '@/components/providers/ServerProviders';
import { StrapiFooter } from '@/components/page-builder/single-types/footer/StrapiFooter';
import { StrapiNavbar } from '@/components/page-builder/single-types/navbar/StrapiNavbar';
import { TailwindIndicator } from '@/components/elementary/TailwindIndicator';
import { Toaster } from '@/components/ui/toaster';
import { fontSans } from '@/lib/fonts';
import { getDefaultMetadata } from '@/lib/metadata';
import { cn } from '@/lib/styles';

export async function generateMetadata({ params: { locale } }: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata',
  });

  return getDefaultMetadata({
    title: t('home.title'),
    description: t('home.description'),
  });
}

export default async function LocaleLayout({ children, params: { locale } }: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <ServerProviders>
            <ClientProviders>
              <div className="relative flex min-h-dvh flex-col bg-background">
                <StrapiNavbar />
                <main className="flex-1">{children}</main>
                <StrapiFooter />
              </div>
              <TailwindIndicator />
            </ClientProviders>
          </ServerProviders>

          <Toaster />
        </NextIntlClientProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
