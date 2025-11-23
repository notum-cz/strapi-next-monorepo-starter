/**
 * Observability Dashboard - Real-time activity monitoring
 * Game-style mission control for tracking all system activity
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Activity, AlertTriangle, CheckCircle, Clock, Filter,
  RefreshCw, Search, Zap, Shield, Sparkles, Rocket,
  Bell, TrendingUp, Users, Bot, Terminal, Eye,
  ChevronDown, X, Info, AlertCircle
} from 'lucide-react'
import { StarField3D } from '@/components/cockpit/GameUI/StarField3D'
import { NonprofitImpactHUD } from '@/components/cockpit/GameUI/NonprofitImpactHUD'

interface ActivityLog {
  id: string
  type: 'agent' | 'system' | 'user' | 'donation' | 'milestone'
  level: 'info' | 'success' | 'warning' | 'error'
  agent?: string
  message: string
  details?: string
  timestamp: string
  metadata?: Record<string, any>
}

const AGENT_ICONS: Record<string, any> = {
  Sirius: Zap,
  Andromeda: Sparkles,
  Vega: Shield,
  Rigel: Search,
  Cassiopeia: Activity,
  Betelgeuse: Rocket,
}

const AGENT_COLORS: Record<string, string> = {
  Sirius: 'from-amber-500 to-orange-600',
  Andromeda: 'from-purple-500 to-pink-600',
  Vega: 'from-blue-500 to-cyan-600',
  Rigel: 'from-red-500 to-rose-600',
  Cassiopeia: 'from-green-500 to-emerald-600',
  Betelgeuse: 'from-yellow-500 to-amber-600',
}

const LEVEL_STYLES: Record<string, { bg: string; border: string; text: string; icon: any }> = {
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: Info },
  success: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: CheckCircle },
  warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: AlertTriangle },
  error: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: AlertCircle },
}

const TYPE_LABELS: Record<string, string> = {
  agent: 'Agent Activity',
  system: 'System',
  user: 'User Action',
  donation: 'Donation',
  milestone: 'Milestone',
}

export default function ObservabilityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch('/api/activity/feed?limit=50')
      const data = await response.json()

      if (data.success) {
        setActivities(data.activities)
        setIsDemo(data.isDemo)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
    const interval = setInterval(fetchActivities, 5000)
    return () => clearInterval(interval)
  }, [fetchActivities])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchActivities()
  }

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (selectedLevel && activity.level !== selectedLevel) return false
    if (selectedAgent && activity.agent !== selectedAgent) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        activity.message.toLowerCase().includes(query) ||
        activity.details?.toLowerCase().includes(query) ||
        activity.agent?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Count by level
  const levelCounts = {
    info: activities.filter(a => a.level === 'info').length,
    success: activities.filter(a => a.level === 'success').length,
    warning: activities.filter(a => a.level === 'warning').length,
    error: activities.filter(a => a.level === 'error').length,
  }

  // Get unique agents
  const uniqueAgents = [...new Set(activities.filter(a => a.agent).map(a => a.agent!))]

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StarField3D />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl"
        >
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Observability
                  </h1>
                </div>
                <p className="text-slate-400">Real-time activity monitoring and system metrics</p>
              </div>

              <div className="flex items-center gap-3">
                {isDemo && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/30">
                    <span className="text-xs text-amber-400 font-mono uppercase">Demo Mode</span>
                  </div>
                )}
                <Link
                  href="/cockpit"
                  className="px-4 py-2 bg-slate-800/50 rounded-xl text-slate-300 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleRefresh}
                  className="p-2 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-colors group"
                >
                  <RefreshCw className={`w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(levelCounts).map(([level, count]) => {
                const style = LEVEL_STYLES[level]
                const Icon = style.icon
                return (
                  <motion.button
                    key={level}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                    className={`relative group p-4 rounded-xl border transition-all ${
                      selectedLevel === level
                        ? `${style.bg} ${style.border}`
                        : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-3xl font-bold ${selectedLevel === level ? style.text : 'text-white'}`}>
                          {count}
                        </div>
                        <div className="text-sm text-slate-400 capitalize">{level}</div>
                      </div>
                      <Icon className={`w-8 h-8 ${style.text} opacity-50`} />
                    </div>
                    {selectedLevel === level && (
                      <motion.div
                        layoutId="level-indicator"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${style.bg.replace('/10', '')}`}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* Search & Filters */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search activities..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-xl border transition-all ${
                    showFilters || selectedAgent
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Agent Filter */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
                      <div className="text-sm text-slate-400 mb-3">Filter by Agent</div>
                      <div className="flex flex-wrap gap-2">
                        {uniqueAgents.map(agent => {
                          const Icon = AGENT_ICONS[agent] || Bot
                          const color = AGENT_COLORS[agent] || 'from-gray-500 to-gray-600'
                          return (
                            <button
                              key={agent}
                              onClick={() => setSelectedAgent(selectedAgent === agent ? null : agent)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                                selectedAgent === agent
                                  ? `bg-gradient-to-r ${color} text-white`
                                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {agent}
                            </button>
                          )
                        })}
                        {selectedAgent && (
                          <button
                            onClick={() => setSelectedAgent(null)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-red-500/10 text-red-400 border border-red-500/30"
                          >
                            <X className="w-3 h-3" />
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live Indicator */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  <span className="text-sm text-green-400 font-mono uppercase">Live Feed</span>
                </div>
                <span className="text-sm text-slate-500">
                  {filteredActivities.length} activities
                </span>
              </div>

              {/* Activity List */}
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-700/50 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-4 w-48 bg-slate-700/50 rounded mb-2" />
                          <div className="h-3 w-32 bg-slate-700/30 rounded" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : filteredActivities.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No activities found</p>
                    {(selectedLevel || selectedAgent || searchQuery) && (
                      <button
                        onClick={() => {
                          setSelectedLevel(null)
                          setSelectedAgent(null)
                          setSearchQuery('')
                        }}
                        className="mt-4 px-4 py-2 text-sm text-cyan-400 hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredActivities.map((activity, index) => {
                      const style = LEVEL_STYLES[activity.level] || LEVEL_STYLES.info
                      const LevelIcon = style.icon
                      const AgentIcon = activity.agent ? (AGENT_ICONS[activity.agent] || Bot) : null
                      const agentColor = activity.agent ? (AGENT_COLORS[activity.agent] || 'from-gray-500 to-gray-600') : null

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: index * 0.02 }}
                          className={`p-4 rounded-xl border transition-all hover:border-slate-600 ${style.bg} ${style.border}`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`p-2 rounded-lg ${
                              activity.agent && agentColor
                                ? `bg-gradient-to-br ${agentColor}`
                                : style.bg
                            }`}>
                              {AgentIcon ? (
                                <AgentIcon className="w-5 h-5 text-white" />
                              ) : (
                                <LevelIcon className={`w-5 h-5 ${style.text}`} />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {activity.agent && (
                                  <span className="text-sm font-medium text-white">
                                    {activity.agent}
                                  </span>
                                )}
                                <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-800/50 rounded-full">
                                  {TYPE_LABELS[activity.type] || activity.type}
                                </span>
                              </div>
                              <p className="text-sm text-slate-200 mb-1">{activity.message}</p>
                              {activity.details && (
                                <p className="text-xs text-slate-500">{activity.details}</p>
                              )}
                            </div>

                            {/* Timestamp */}
                            <div className="text-xs text-slate-500 whitespace-nowrap">
                              {formatTime(activity.timestamp)}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>

            {/* Right Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* System Health */}
              <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  System Health
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'API Server', status: 'healthy', uptime: '99.9%' },
                    { name: 'Database', status: 'healthy', uptime: '99.8%' },
                    { name: 'AI Agents', status: 'healthy', uptime: '99.5%' },
                    { name: 'Storage', status: 'healthy', uptime: '100%' },
                  ].map((service, i) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          service.status === 'healthy' ? 'bg-green-400' : 'bg-yellow-400'
                        }`} />
                        <span className="text-sm text-slate-300">{service.name}</span>
                      </div>
                      <span className="text-xs text-green-400 font-mono">{service.uptime}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Active Agents */}
              <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  Agent Activity
                </h3>
                <div className="space-y-3">
                  {Object.entries(AGENT_ICONS).map(([name, Icon], i) => {
                    const color = AGENT_COLORS[name]
                    const agentActivities = activities.filter(a => a.agent === name).length
                    return (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
                      >
                        <div className={`p-2 bg-gradient-to-br ${color} rounded-lg`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-white">{name}</div>
                          <div className="text-xs text-slate-500">{agentActivities} activities</div>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full p-3 text-left text-sm text-slate-300 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                    Export Activity Logs
                  </button>
                  <button className="w-full p-3 text-left text-sm text-slate-300 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                    Configure Alerts
                  </button>
                  <button className="w-full p-3 text-left text-sm text-slate-300 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                    View System Metrics
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Impact HUD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <NonprofitImpactHUD />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
