// ============================================================================
// VoiceCommandButton - Floating voice command button
// ============================================================================

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function VoiceCommandButton() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleClick = () => {
    if (isListening) {
      setIsListening(false);
      // TODO: Stop recording and send to Cassiopeia
      console.log('[Voice] Stopped listening');
    } else {
      setIsListening(true);
      setTranscript('');
      // TODO: Start recording
      console.log('[Voice] Started listening');

      // Simulate voice recognition (for MVP)
      setTimeout(() => {
        setTranscript('Create a new React component');
        setTimeout(() => {
          setIsListening(false);
        }, 2000);
      }, 2000);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleClick}
        className={cn(
          "fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all",
          isListening
            ? "animate-pulse bg-gradient-to-r from-purple-500 to-blue-500 scale-110"
            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
        )}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
      >
        <span className="text-3xl">{isListening ? '🎤' : '🎙️'}</span>

        {/* Waveform animation when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping delay-75" />
          </div>
        )}
      </button>

      {/* Transcript popup */}
      {transcript && (
        <div className="fixed bottom-28 right-8 z-50 max-w-sm rounded-lg border border-purple-500/50 bg-slate-900 p-4 shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="font-sans text-sm text-white mb-2">
            You said:
          </div>
          <div className="font-display text-lg text-purple-300">
            "{transcript}"
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Processing...
          </div>
        </div>
      )}
    </>
  );
}
