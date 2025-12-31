import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'New World Kids Interactive Timeline',
  description: 'Explore the journey of Proyecto Indigo Azul - from vision to reality',
  openGraph: {
    title: 'New World Kids Interactive Timeline',
    description: 'Explore the journey of Proyecto Indigo Azul - from vision to reality',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New World Kids Interactive Timeline',
    description: 'Explore the journey of Proyecto Indigo Azul - from vision to reality',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
