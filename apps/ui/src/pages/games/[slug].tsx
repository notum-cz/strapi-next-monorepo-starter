import React from 'react'
import { fetchGameBySlug } from '../../lib/strapi'

export default function GamePage({ game }: { game: any }) {
  if (!game) return <p>Not found</p>
  const attrs = game.attributes || {}
  return (
    <main>
      <h1>{attrs.title}</h1>
      <p>{attrs.summary}</p>
    </main>
  )
}

export async function getStaticPaths() {
  const res = await fetch('http://localhost:1337/api/games?fields=slug')
  const json = await res.json()
  const games = json.data || []
  const paths = games.map((g: any) => ({ params: { slug: g.attributes.slug } }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }: any) {
  try {
    const res = await fetchGameBySlug(params.slug)
    const game = res.data && res.data[0] ? res.data[0] : null
    return { props: { game }, revalidate: 60 }
  } catch (e) {
    return { notFound: true }
  }
}
