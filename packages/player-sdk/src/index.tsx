import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export interface PlayerProps {
  src: string;
  locale?: 'en' | 'es';
  onAdStart?: () => void;
  onAdEnd?: () => void;
  className?: string;
  autoPlay?: boolean;
}

export const Player: React.FC<PlayerProps> = ({
  src,
  locale = 'en',
  onAdStart,
  onAdEnd,
  className = '',
  autoPlay = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) {
          audio.play().catch((err) => {
            console.error('Autoplay failed:', err);
            setError('Autoplay blocked');
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError('Playback error');
              break;
          }
        }
      });
    } else {
      setError('HLS not supported');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, autoPlay]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        setIsLoading(true);
        await audio.play();
        setError(null);
      }
    } catch (err) {
      setError('Playback failed');
      setIsLoading(false);
    }
  };

  const text = {
    en: {
      play: 'Play',
      pause: 'Pause',
      loading: 'Loading...',
      live: 'Live',
    },
    es: {
      play: 'Reproducir',
      pause: 'Pausar',
      loading: 'Cargando...',
      live: 'En vivo',
    },
  };

  const t = text[locale];

  return (
    <div className={`player-sdk ${className}`}>
      <audio
        ref={audioRef}
        onPlay={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onPause={() => setIsPlaying(false)}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setError('Load failed');
          setIsLoading(false);
        }}
        aria-label={locale === 'es' ? 'Reproductor de audio' : 'Audio player'}
      />
      <button
        onClick={togglePlay}
        disabled={isLoading || !!error}
        className="player-sdk__button"
        aria-label={isPlaying ? t.pause : t.play}
      >
        {isLoading ? t.loading : isPlaying ? t.pause : t.play}
      </button>
      {error && <p className="player-sdk__error">{error}</p>}
      {isPlaying && <span className="player-sdk__live">{t.live}</span>}
    </div>
  );
};

export default Player;
