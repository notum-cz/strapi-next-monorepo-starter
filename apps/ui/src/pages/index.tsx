import React from 'react'
import Link from 'next/link'
import { fetchGamesList } from '../lib/strapi'
import GameCard from '../components/GameCard'

export default function Index({ games }: { games: any[] }) {
  return (
    <main>
      <h1>Games</h1>
      <div>
        {games.map((g: any) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </main>
  )
}

export async function getStaticProps() {
  try {
    const res = await fetchGamesList()
    const games = res.data || []
    return { props: { games }, revalidate: 60 }
  } catch (e) {
    return { props: { games: [] }, revalidate: 60 }
  }
}
