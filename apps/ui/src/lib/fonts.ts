import localFont from "next/font/local"

export const fontRoboto = localFont({
  src: [
    {
      path: "../../../../packages/design-system/src/fonts/Roboto-VF.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../../../packages/design-system/src/fonts/Roboto-Italic-VF.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-roboto",
  display: "swap",
})
