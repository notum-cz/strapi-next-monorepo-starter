"use client"

import { Player } from "@/components/Player"

export default function PlayerPage() {
  const hlsUrl = process.env.NEXT_PUBLIC_HLS_URL || "https://example.com/live/index.m3u8"
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-gray-900 to-gray-800">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            Trail Mixx
          </h1>
          <p className="text-xl text-gray-300">
            Community Radio · Streaming Live
          </p>
        </div>
        
        <Player 
          src={hlsUrl}
          locale="en"
          className="my-8"
        />
        
        <div className="text-sm text-gray-400 max-w-md mx-auto">
          <p>
            Supporting local artists, nonprofit organizations, and BIPOC communities
            through the power of music and connection.
          </p>
        </div>
      </div>
    </div>
  )
}
