"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

interface PlayerProps {
  src: string
  locale?: string
  onAdStart?: () => void
  onAdEnd?: () => void
  className?: string
}

export function Player({
  src,
  locale = "en",
  onAdStart,
  onAdEnd,
  className = "",
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !src) return

    // Check if browser supports HLS natively (Safari)
    if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = src
    } else if (Hls.isSupported()) {
      // Use hls.js for other browsers
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })

      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(audio)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest parsed")
        setIsLoading(false)
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error, trying to recover")
              setError("Network error. Retrying...")
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error, trying to recover")
              setError("Media error. Retrying...")
              hls.recoverMediaError()
              break
            default:
              console.error("Fatal error, cannot recover")
              setError("Playback error occurred")
              hls.destroy()
              break
          }
        }
      })
    } else {
      setError("HLS is not supported in this browser")
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [src])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        setIsLoading(true)
        await audio.play()
        setIsPlaying(true)
        setError(null)
      }
    } catch (err) {
      console.error("Playback error:", err)
      setError("Failed to play audio")
      setIsLoading(false)
    }
  }

  const handlePlay = () => {
    setIsPlaying(true)
    setIsLoading(false)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleLoadStart = () => {
    setIsLoading(true)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setError("Failed to load audio stream")
    setIsLoading(false)
  }

  const playPauseText = locale === "es" 
    ? (isPlaying ? "Pausar" : "Reproducir") 
    : (isPlaying ? "Pause" : "Play")

  const loadingText = locale === "es" ? "Cargando..." : "Loading..."
  const errorText = locale === "es" ? "Error de reproducción" : "Playback error"

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <audio
        ref={audioRef}
        onPlay={handlePlay}
        onPause={handlePause}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        aria-label={locale === "es" ? "Reproductor de audio" : "Audio player"}
      />
      
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={togglePlay}
          disabled={isLoading || !!error}
          className="rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-8 py-4 text-white font-semibold text-lg transition-colors shadow-lg"
          aria-label={playPauseText}
        >
          {isLoading ? loadingText : playPauseText}
        </button>
        
        {error && (
          <p className="text-red-500 text-sm" role="alert">
            {errorText}: {error}
          </p>
        )}
        
        {isPlaying && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>{locale === "es" ? "En vivo" : "Live"}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function speak(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  }
}
