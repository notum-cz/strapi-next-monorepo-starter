# Roboto

Variable Roboto v3.015, normal and italic, with weights 100 through 900 and the complete upstream character set.

Source: [Google Fonts Roboto v3.015 release](https://github.com/googlefonts/roboto-3-classic/releases/tag/v3.015).

The WOFF2 files were converted from `web/split/Roboto[wdth,wght].ttf` and `web/split/Roboto-Italic[wdth,wght].ttf` in `Roboto_v3.015.zip` using FontTools 4.60.2 with WOFF2 compression. No glyphs were removed. The files retain the upstream weight and width axes.

The font is distributed under the SIL Open Font License 1.1.

`src/fonts.css` declares these files for shared CSS consumers. Next.js loads the same files through `next/font/local` in `apps/ui/src/lib/fonts.ts`. The design-system build copies this directory to `dist/fonts` before compiling CSS.
