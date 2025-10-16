/* eslint-disable no-console */
"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

interface PlayerProps {
  src: string
  locale: string
  className?: string
}

export function Player({
  src,
  locale,
  className = "",
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(audio)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("manifest parsed")
      })
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = src
    }

    return () => {
      // Cleanup if needed
    }
  }, [src])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch((error) => console.error("Error playing audio:", error))
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <div className={`flex items-center gap-4 text-white ${className}`}>
      <audio ref={audioRef} className="hidden" />
      
      <button 
        onClick={togglePlay}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      
      <div className="text-left">
        <p className="font-semibold">Live Stream</p>
        <p className="text-sm text-gray-300">Trail Mixx Radio</p>
      </div>

      <button 
        onClick={toggleMute}
        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ease-in-out"
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
    </div>
  )
}
