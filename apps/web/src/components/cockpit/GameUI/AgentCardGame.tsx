'use client'

/**
 * AgentCardGame - Futuristic video game-style agent card
 * Think Mass Effect meets Cyberpunk with elegant design
 */

import { motion } from 'framer-motion'
import { Sparkles, Zap, Activity, Shield, Search, Rocket } from 'lucide-react'
import { useState } from 'react'

const AGENT_ICONS = {
  Sirius: Zap,
  Andromeda: Sparkles,
  Vega: Shield,
  Rigel: Search,
  Cassiopeia: Activity,
  Betelgeuse: Rocket,
}

const AGENT_COLORS = {
  Sirius: 'from-amber-500 to-orange-600',
  Andromeda: 'from-purple-500 to-pink-600',
  Vega: 'from-blue-500 to-cyan-600',
  Rigel: 'from-red-500 to-rose-600',
  Cassiopeia: 'from-green-500 to-emerald-600',
  Betelgeuse: 'from-yellow-500 to-amber-600',
}

const STATUS_COLORS = {
  online: 'bg-green-500',
  busy: 'bg-yellow-500',
  offline: 'bg-gray-500',
  error: 'bg-red-500',
}

interface Agent {
  name: string
  displayName: string
  type: string
  status: 'online' | 'busy' | 'offline' | 'error'
  description: string
  capabilities: string[]
  stats?: {
    tasksCompleted: number
    successRate: number
    avgResponseTime: string
  }
}

interface AgentCardGameProps {
  agent: Agent
  onClick?: () => void
}

export function AgentCardGame({ agent, onClick }: AgentCardGameProps) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = AGENT_ICONS[agent.name as keyof typeof AGENT_ICONS] || Activity
  const colorClass = AGENT_COLORS[agent.name as keyof typeof AGENT_COLORS] || 'from-gray-500 to-gray-600'
  const statusColor = STATUS_COLORS[agent.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      {/* Outer glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClass} rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300`} />

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon with animated glow */}
            <div className={`relative p-3 bg-gradient-to-br ${colorClass} rounded-xl`}>
              <Icon className="w-6 h-6 text-white" />
              {isHovered && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${colorClass} rounded-xl blur-lg`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>

            <div>
              <h3 className="font-bold text-xl text-white">{agent.displayName}</h3>
              <p className="text-sm text-slate-400">{agent.type}</p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <motion.div
              className={`w-3 h-3 rounded-full ${statusColor}`}
              animate={{ scale: agent.status === 'online' ? [1, 1.2, 1] : 1 }}
              transition={{ repeat: agent.status === 'online' ? Infinity : 0, duration: 2 }}
            />
            <span className="text-xs text-slate-400 capitalize">{agent.status}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 mb-4 line-clamp-2">
          {agent.description}
        </p>

        {/* Stats bar */}
        {agent.stats && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-slate-400">Tasks</div>
              <div className="text-sm font-bold text-white">{agent.stats.tasksCompleted}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-slate-400">Success</div>
              <div className="text-sm font-bold text-green-400">{agent.stats.successRate}%</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-slate-400">Speed</div>
              <div className="text-sm font-bold text-cyan-400">{agent.stats.avgResponseTime}</div>
            </div>
          </div>
        )}

        {/* Capabilities */}
        <div className="flex flex-wrap gap-2">
          {agent.capabilities.slice(0, 3).map((capability, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 bg-slate-800/80 text-slate-300 rounded-full border border-slate-700/50"
            >
              {capability}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="text-xs px-2 py-1 text-slate-400">
              +{agent.capabilities.length - 3} more
            </span>
          )}
        </div>

        {/* Hover effect - scanning line */}
        {isHovered && (
          <motion.div
            className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colorClass}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Corner accents */}
        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${colorClass} opacity-10 rounded-tr-2xl`} />
        <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${colorClass} opacity-10 rounded-bl-2xl`} />
      </div>
    </motion.div>
  )
}
