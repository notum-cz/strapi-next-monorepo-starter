"use client"

/**
 * Game page content component
 * Displays detailed information about a single game
 */

import Image from "next/image"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { Container } from "@/components/elementary/Container"
import { Button } from "@/components/ui/button"

interface GamePageContentProps {
  game: any
  relatedGames?: any[]
}

export default function GamePageContent({
  game,
  relatedGames = [],
}: GamePageContentProps) {
  const {
    title,
    description,
    cover,
    developer,
    genres,
    platforms,
    releaseDate,
    rating,
    website,
    screenshots,
    trailer,
  } = game

  return (
    <>
      {/* Hero Section with Cover */}
      <section className="relative w-full bg-gradient-to-b from-slate-900 to-slate-800 py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cover Image */}
            <div className="lg:col-span-1">
              {cover && (
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={cover.url}
                    alt={cover.alternativeText || title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="lg:col-span-2 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>

              {developer && (
                <p className="text-lg text-slate-300 mb-4">
                  By <span className="font-semibold">{developer.name}</span>
                </p>
              )}

              {/* Rating */}
              {rating && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${
                          i < Math.round(rating)
                            ? "text-yellow-400"
                            : "text-slate-500"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{rating}/5</span>
                </div>
              )}

              {/* Description */}
              <p className="text-slate-200 mb-6 leading-relaxed">
                {description}
              </p>

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {releaseDate && (
                  <div>
                    <p className="text-slate-400 text-sm">Release Date</p>
                    <p className="text-white font-semibold">
                      {new Date(releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {genres && genres.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm">Genres</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {genres.slice(0, 3).map((genre: any) => (
                        <span
                          key={genre.id}
                          className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {platforms && platforms.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm">Platforms</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {platforms.slice(0, 3).map((platform: any) => (
                        <span
                          key={platform.id}
                          className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded"
                        >
                          {platform.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2">
                      Visit Website
                      <ExternalLink size={16} />
                    </Button>
                  </a>
                )}
                {trailer && (
                  <a
                    href={trailer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2 text-white border-white hover:bg-white hover:text-slate-900">
                      Watch Trailer
                      <ExternalLink size={16} />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Screenshots Section */}
      {screenshots && screenshots.length > 0 && (
        <section className="py-12 bg-slate-50">
          <Container>
            <h2 className="text-3xl font-bold mb-8">Screenshots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {screenshots.map((screenshot: any) => (
                <div
                  key={screenshot.id}
                  className="relative aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Image
                    src={screenshot.url}
                    alt={screenshot.alternativeText || title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Related Games Section */}
      {relatedGames.length > 0 && (
        <section className="py-12">
          <Container>
            <h2 className="text-3xl font-bold mb-8">Related Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedGames.map((relatedGame: any) => (
                <Link
                  key={relatedGame.id}
                  href={`/games/${relatedGame.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg mb-3">
                    {relatedGame.cover && (
                      <Image
                        src={relatedGame.cover.url}
                        alt={relatedGame.cover.alternativeText || relatedGame.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                    {relatedGame.title}
                  </h3>
                  {relatedGame.developer && (
                    <p className="text-sm text-slate-600">
                      {relatedGame.developer.name}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
