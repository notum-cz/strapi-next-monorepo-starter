"use client"

/**
 * Games listing page content with client-side filtering
 */

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

import { Container } from "@/components/elementary/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGamesList } from "@/lib/strapi-api/games/hooks"

interface GamesListingContentProps {
  initialGames: any[]
  initialMeta: any
  genres: any[]
  platforms: any[]
}

export default function GamesListingContent({
  initialGames,
  initialMeta,
  genres,
  platforms,
}: GamesListingContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get values from URL params
  const page = searchParams.get("page") ?? "1"
  const search = searchParams.get("search") ?? ""
  const genreId = searchParams.get("genre") ?? ""
  const platformId = searchParams.get("platform") ?? ""

  // Local state for form inputs
  const [searchInput, setSearchInput] = useState(search)

  // Helper function to update URL params
  const updateParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })

    router.push(`?${newParams.toString()}`, { scroll: false })
  }

  const { data: gamesResponse, isPending } = useGamesList({
    page: parseInt(page),
    pageSize: 12,
    genreId: genreId ? parseInt(genreId) : undefined,
    platformId: platformId ? parseInt(platformId) : undefined,
    search: search || undefined,
  })

  const games = gamesResponse?.data ?? initialGames
  const meta = gamesResponse?.meta ?? initialMeta
  const totalPages = Math.ceil((meta?.pagination?.total ?? 0) / 12)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleSearchSubmit = () => {
    updateParams({
      search: searchInput,
      page: "1",
    })
  }

  const handleGenreChange = (value: string) => {
    updateParams({
      genre: value,
      page: "1",
    })
  }

  const handlePlatformChange = (value: string) => {
    updateParams({
      platform: value,
      page: "1",
    })
  }

  const handleClearFilters = () => {
    setSearchInput("")
    updateParams({
      search: "",
      genre: "",
      platform: "",
      page: "1",
    })
  }

  return (
    <>
      {/* Filters Section */}
      <section className="bg-slate-50 py-8">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search games..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit()
                    }
                  }}
                  disabled={isPending}
                />
                <Button
                  onClick={handleSearchSubmit}
                  disabled={isPending}
                  className="px-4"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Genre
              </label>
              <Select
                value={genreId || "all"}
                onValueChange={(value) => handleGenreChange(value === "all" ? "" : value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((genre: any) => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Platform
              </label>
              <Select
                value={platformId || "all"}
                onValueChange={(value) => handlePlatformChange(value === "all" ? "" : value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {platforms.map((platform: any) => (
                    <SelectItem key={platform.id} value={platform.id.toString()}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={isPending || (!search && !genreId && !platformId)}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Games Grid */}
      <section className="py-12">
        <Container>
          {games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-slate-600">
                No games found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {games.map((game: any) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg mb-4 bg-slate-200">
                      {game.cover && (
                        <Image
                          src={game.cover.url}
                          alt={game.cover.alternativeText || game.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                        {game.title}
                      </h3>

                      {game.developer && (
                        <p className="text-sm text-slate-600 mb-2">
                          {game.developer.name}
                        </p>
                      )}

                      {game.genres && game.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {game.genres.slice(0, 2).map((genre: any) => (
                            <span
                              key={genre.id}
                              className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={isPending || parseInt(page) === 1}
                    onClick={() => updateParams({ page: String(parseInt(page) - 1) })}
                  >
                    Previous
                  </Button>

                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={parseInt(page) === i + 1 ? "default" : "outline"}
                      disabled={isPending}
                      onClick={() => updateParams({ page: String(i + 1) })}
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    disabled={isPending || parseInt(page) === totalPages}
                    onClick={() => updateParams({ page: String(parseInt(page) + 1) })}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  )
}
