'use client'

/**
 * VoiceCommandGame - Futuristic voice control with natural language
 * Makes AI accessible to non-technical nonprofit staff
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { translateCommand, getExampleCommands, explainAgent } from '@/lib/naturalLanguage'

type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error'

export function VoiceCommandGame() {
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [command, setCommand] = useState<any>(null)
  const [showExamples, setShowExamples] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const current = event.resultIndex
        const transcriptText = event.results[current][0].transcript

        setTranscript(transcriptText)

        if (event.results[current].isFinal) {
          setState('processing')
          processCommand(transcriptText)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setState('error')
        setTimeout(() => setState('idle'), 2000)
      }

      recognition.onend = () => {
        if (state === 'listening') {
          setState('idle')
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const processCommand = async (text: string) => {
    try {
      // Translate natural language to structured command
      const parsedCommand = translateCommand(text)
      setCommand(parsedCommand)

      // Send to backend
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: parsedCommand.agent,
          action: parsedCommand.action,
          parameters: parsedCommand.parameters,
        }),
      })

      if (response.ok) {
        setState('success')
        // Speak the response
        speakResponse(`Got it! ${parsedCommand.simplifiedExplanation}`)
      } else {
        setState('error')
      }

      setTimeout(() => {
        setState('idle')
        setTranscript('')
        setCommand(null)
      }, 3000)
    } catch (error) {
      console.error('Command processing error:', error)
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && state === 'idle') {
      setState('listening')
      setTranscript('')
      setCommand(null)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setState('idle')
    }
  }

  const handleClick = () => {
    if (state === 'idle') {
      startListening()
    } else if (state === 'listening') {
      stopListening()
    }
  }

  const getStateColor = () => {
    switch (state) {
      case 'listening':
        return 'from-blue-500 to-cyan-500'
      case 'processing':
        return 'from-purple-500 to-pink-500'
      case 'success':
        return 'from-green-500 to-emerald-500'
      case 'error':
        return 'from-red-500 to-rose-500'
      default:
        return 'from-slate-600 to-slate-700'
    }
  }

  const getStateIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic className="w-8 h-8 text-white animate-pulse" />
      case 'processing':
        return <Loader2 className="w-8 h-8 text-white animate-spin" />
      case 'success':
        return <CheckCircle className="w-8 h-8 text-white" />
      case 'error':
        return <XCircle className="w-8 h-8 text-white" />
      default:
        return <MicOff className="w-8 h-8 text-white" />
    }
  }

  const exampleCommands = getExampleCommands()

  return (
    <>
      {/* Floating voice button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Help button */}
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="absolute -top-14 right-0 px-4 py-2 bg-slate-800 text-white rounded-full text-sm hover:bg-slate-700 transition-colors"
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          Need ideas?
        </button>

        {/* Main voice button */}
        <div className="relative">
          {/* Pulsing glow */}
          {state === 'listening' && (
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${getStateColor()} rounded-full blur-2xl`}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}

          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${getStateColor()} shadow-2xl flex items-center justify-center`}
            disabled={state === 'processing'}
          >
            {getStateIcon()}
          </motion.button>
        </div>

        {/* Transcript display */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-24 right-0 max-w-xs bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-slate-700 shadow-2xl"
            >
              <p className="text-sm text-slate-300 mb-2">You said:</p>
              <p className="text-white font-medium mb-3">{transcript}</p>

              {command && (
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">
                    Agent: <span className="text-purple-400 font-bold">{command.agent}</span>
                  </p>
                  <p className="text-xs text-green-400">{command.simplifiedExplanation}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Example commands panel */}
      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            className="fixed bottom-32 right-8 w-96 max-h-[70vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 shadow-2xl z-40"
          >
            <h3 className="text-xl font-bold text-white mb-4">Try saying...</h3>

            <div className="space-y-4">
              {exampleCommands.map((category, i) => (
                <div key={i}>
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">{category.category}</h4>
                  <ul className="space-y-1">
                    {category.examples.map((example, j) => (
                      <li
                        key={j}
                        className="text-sm text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800/50 rounded px-2 py-1 transition-colors"
                        onClick={() => {
                          setTranscript(example)
                          processCommand(example)
                          setShowExamples(false)
                        }}
                      >
                        "{example}"
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                Just speak naturally! The AI will understand what you need.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
