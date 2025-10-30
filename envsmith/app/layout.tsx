import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EnvSmith - Generate and Sync .env Files',
  description: 'Secure web app for generating .env files and syncing secrets to GitHub and Vercel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
