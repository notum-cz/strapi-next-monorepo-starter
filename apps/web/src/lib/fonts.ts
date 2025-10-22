// ============================================================================
// TYPOGRAPHY SYSTEM - Existing + Stellar Cockpit Fonts
// ============================================================================

import { Roboto, Space_Grotesk, Orbitron, Inter, JetBrains_Mono } from "next/font/google"

// Existing Roboto font
export const fontRoboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
  variable: "--font-roboto",
})

// ============================================================================
// STELLAR COCKPIT - AWWWARDS-INSPIRED FONTS
// ============================================================================

/**
 * Space Grotesk - Display & Headings
 * Geometric sans-serif with a modern, cosmic feel
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
})

/**
 * Orbitron - Cosmic Accent
 * Futuristic, space-themed font
 */
export const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
  preload: true,
})

/**
 * Inter - Body Text
 * Clean, highly readable sans-serif
 */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

/**
 * JetBrains Mono - Code & Logs
 * Monospace font optimized for code
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
})

/**
 * Combined font variables for Stellar Cockpit
 */
export const stellarFontVariables = `${spaceGrotesk.variable} ${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable}`
