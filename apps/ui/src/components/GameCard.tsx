import React from 'react'
import Link from 'next/link'

export default function GameCard({ game }: { game: any }) {
  const title = game.attributes?.title || game.title || 'Untitled'
  const slug = game.attributes?.slug || game.slug || '#'
  const cover = game.attributes?.cover?.data?.attributes?.url
  return (
    <article>
      {cover && <img src={cover} alt={title} style={{ width: 200 }} />}
      <h2><Link href={`/games/${slug}`}>{title}</Link></h2>
      <p>{game.attributes?.summary}</p>
    </article>
  )
}
