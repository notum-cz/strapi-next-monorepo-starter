const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function fetchAPI(path: string) {
  const url = `${API_URL}/api/${path}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function fetchGamesList() {
  // small list for index page
  return fetchAPI('games?pagination[pageSize]=50&populate=developer,genres,platforms')
}

export async function fetchGameBySlug(slug: string) {
  const encoded = encodeURIComponent(slug)
  return fetchAPI(`games?filters[slug][$eq]=${encoded}&populate=deep`)
}

export default fetchAPI
