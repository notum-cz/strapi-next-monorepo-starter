/**
 * This object maps frontend locales (specified within the global data document) to Strapi content locales
 * Strapi content locales are not changeable by default and therefore it is the easiest to simply map them
 * and change their display locale in the admin panel
 *
 * Otherwise we would need to use a patch-package, which is not advisable
 *
 * Everything in the FE application should interact with the AppLocale locales,
 * the Strapi locales are mapped in the fetch method within the Strapi Client Interface
 */

export const strapiToFeLocaleMapping = {
  en: "int", // English	Worldwide
  "ar-AE": "ar-ae", // Arabic	Worldwide (Not just UAE)
  zh: "cn", // Chinese (Simplified)	China
  "es-MX": "es-mx", // Spanish	LATAM (Not Spain)
  fr: "fr-ma", // French	Morocco (Not France)
  id: "id", // Indonesian	Indonesia
  "it-CH": "it-ch", // Italian	Switzerland (Not Italy)
  ja: "jp", // Japanese	Japan
  "ko-KR": "kr", // Korean	South Korea
  pt: "pt", // Portuguese	LATAM (Not Portugal)
  th: "th", // Thai	Thailand
  "zh-Hant-TW": "tw", // Chinese (Traditional)	Taiwan
  vi: "vn", // Vietnamese	Vietnam
  "en-ZA": "za", // English	South Africa
  "en-GB": "uk", // English	United Kingdom
  "en-AU": "au", // English	Australia & New Zealand
  "en-AE": "en-ae", // English	UAE
  "en-EU": "eu", // English	Europe
  pl: "pl", // Polish	Poland
  de: "de", // German Germany
} as const

export const feToStrapiLocaleMapping = {
  int: "en", // English	Worldwide
  "ar-ae": "ar-AE", // Arabic	Worldwide (Not just UAE)
  cn: "zh", // Chinese (Simplified)	China
  "es-mx": "es-MX", // Spanish	LATAM (Not Spain)
  "fr-ma": "fr", // French	Morocco (Not France)
  id: "id", // Indonesian	Indonesia
  "it-ch": "it-CH", // Italian	Switzerland (Not Italy)
  jp: "ja", // Japanese	Japan
  kr: "ko-KR", // Korean	South Korea
  pt: "pt", // Portuguese	LATAM (Not Portugal)
  th: "th", // Thai	Thailand
  tw: "zh-Hant-TW", // Chinese (Traditional)	Taiwan
  vn: "vi", // Vietnamese	Vietnam
  za: "en-ZA", // English	South Africa
  uk: "en-GB", // English	United Kingdom
  au: "en-AU", // English	Australia & New Zealand
  "en-ae": "en-AE", // English	UAE
  eu: "en-EU", // English	Europe
  pl: "pl", // Polish	Poland
  de: "de", // German Germany
} as const

export const defaultFeLocale = "int" as const
export const defaultStrapiLocale = feToStrapiLocaleMapping[defaultFeLocale]

export const strapiLocales = Object.keys(strapiToFeLocaleMapping)
export const feLocales = Object.keys(feToStrapiLocaleMapping)

/**
 * Returns Strapi Locale from Frontend App Locale.
 * @param feLocale locale on the frontend
 * @returns strapiLocale
 * @example getStrapiLocaleFromFeLocale("int") => "en"
 */
export const getStrapiLocaleFromFeLocale = (feLocale?: string) =>
  typeof feLocale === "string" && feLocale in feToStrapiLocaleMapping
    ? feToStrapiLocaleMapping[feLocale as keyof typeof feToStrapiLocaleMapping]
    : defaultStrapiLocale

/**
 * Returns Frontend App Locale from Strapi Locale.
 * @param strapiLocale locale in Strapi
 * @returns feLocale
 * @example getFeLocaleFromStrapiLocale("en") => "int"
 */
export const getFeLocaleFromStrapiLocale = (strapiLocale?: string) =>
  typeof strapiLocale === "string" && strapiLocale in strapiToFeLocaleMapping
    ? strapiToFeLocaleMapping[
    strapiLocale as keyof typeof strapiToFeLocaleMapping
    ]
    : defaultFeLocale

