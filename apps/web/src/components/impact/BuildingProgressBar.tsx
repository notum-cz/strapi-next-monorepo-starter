'use client'

/**
 * BuildingProgressBar - Shows overall organization building progress
 */

import { motion } from 'framer-motion'
import { Hammer, Sparkles } from 'lucide-react'

interface BuildingProgressBarProps {
  progress?: number
}

export function BuildingProgressBar({ progress = 75 }: BuildingProgressBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full"
    >
      {/* Background card */}
      <div className="relative bg-gradient-to-r from-slate-900/80 via-purple-900/40 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 overflow-hidden">
        {/* Animated scan line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg">
                <Hammer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Building Our Future</h3>
                <p className="text-sm text-slate-400">Creating lasting impact across 7 generations</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-cyan-500/30">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-400">{progress}% Complete</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 bg-slate-800/80 rounded-full overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-sm" />

            {/* Progress fill */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
            />

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear', delay: 1 }}
            />

            {/* Progress indicator line */}
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-white/80 shadow-lg"
              initial={{ left: '0%' }}
              animate={{ left: `${progress}%` }}
              transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
            />
          </div>

          {/* Milestones */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <div className={`text-xs ${progress >= 25 ? 'text-cyan-400' : 'text-slate-500'}`}>
              Foundation<br />
              <span className="font-bold">25%</span>
            </div>
            <div className={`text-xs ${progress >= 50 ? 'text-purple-400' : 'text-slate-500'}`}>
              Growing<br />
              <span className="font-bold">50%</span>
            </div>
            <div className={`text-xs ${progress >= 75 ? 'text-pink-400' : 'text-slate-500'}`}>
              Scaling<br />
              <span className="font-bold">75%</span>
            </div>
            <div className={`text-xs ${progress >= 100 ? 'text-green-400' : 'text-slate-500'}`}>
              7 Generations<br />
              <span className="font-bold">100%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
