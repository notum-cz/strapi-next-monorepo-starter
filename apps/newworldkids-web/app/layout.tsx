import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "New World Kids - Golden Boilerplate",
  description: "Educational platform for children focused on blockchain technology and conservation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}