'use client'

/**
 * NonprofitImpactHUD - Game-style HUD for nonprofit impact metrics
 * Real-time donation tracking, project funding, impact visualization
 */

import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Users, Target, TrendingUp, Heart, Sparkles, Activity, RefreshCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

interface ImpactMetrics {
  totalDonations: number
  totalDonated: number
  activeProjects: number
  milestonesAchieved: number
  livesImpacted: number
  volunteersActive: number
  growthRate?: number
}

interface ActivityItem {
  id: string
  type: 'donation' | 'milestone' | 'volunteer' | 'project'
  message: string
  amount?: number
  timestamp: string
}

export function NonprofitImpactHUD() {
  const [metrics, setMetrics] = useState<ImpactMetrics>({
    totalDonations: 0,
    totalDonated: 0,
    activeProjects: 0,
    milestonesAchieved: 0,
    livesImpacted: 0,
    volunteersActive: 0,
    growthRate: 0,
  })

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/impact/metrics')
      const data = await response.json()

      if (data.success) {
        setMetrics(data.metrics)
        setRecentActivity(data.metrics.recentActivity || [])
        setIsDemo(data.isDemo)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch and real-time updates
  useEffect(() => {
    fetchMetrics()

    // Real-time updates every 5 seconds
    const interval = setInterval(() => {
      setIsAnimating(true)
      fetchMetrics()
      setTimeout(() => setIsAnimating(false), 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchMetrics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const metricCards = [
    {
      label: 'Total Donated',
      value: formatCurrency(metrics.totalDonated),
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'border-green-500/30',
      textColor: 'text-green-400',
      subtext: `${metrics.totalDonations} donations`,
    },
    {
      label: 'Lives Impacted',
      value: formatNumber(metrics.livesImpacted),
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'border-pink-500/30',
      textColor: 'text-pink-400',
      subtext: 'People helped',
    },
    {
      label: 'Active Projects',
      value: metrics.activeProjects.toString(),
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      subtext: 'Ongoing initiatives',
    },
    {
      label: 'Milestones',
      value: metrics.milestonesAchieved.toString(),
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      subtext: 'Goals achieved',
    },
    {
      label: 'Active Volunteers',
      value: metrics.volunteersActive.toString(),
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      subtext: 'Community members',
    },
    {
      label: 'Growth Rate',
      value: `+${metrics.growthRate || 23}%`,
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
      subtext: 'This month',
    },
  ]

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-slate-700/50 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-slate-700/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/50">
              <div className="h-8 w-8 bg-slate-700/50 rounded-lg animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-700/50 rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-slate-700/30 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Impact Dashboard</h3>
          <p className="text-sm text-slate-400">Real-time nonprofit impact metrics</p>
        </div>

        {/* Live indicator and controls */}
        <div className="flex items-center gap-3">
          {isDemo && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/30">
              <span className="text-xs text-amber-400 font-mono uppercase">Demo Mode</span>
            </div>
          )}
          <button
            onClick={() => { setIsAnimating(true); fetchMetrics(); setTimeout(() => setIsAnimating(false), 500); }}
            className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors group"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors ${isAnimating ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-green-500/30">
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span className="text-xs text-green-400 font-mono uppercase">Live</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${metric.color} rounded-xl blur opacity-20 group-hover:opacity-40 transition`} />

              {/* Card */}
              <div className={`relative bg-slate-900/80 backdrop-blur rounded-xl p-4 border ${metric.bgColor} h-full`}>
                {/* Icon */}
                <div className={`w-8 h-8 mb-3 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Value */}
                <motion.div
                  className={`text-2xl font-bold text-white mb-1 ${isAnimating ? 'scale-110' : 'scale-100'}`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {metric.value}
                </motion.div>

                {/* Label */}
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  {metric.label}
                </div>

                {/* Subtext */}
                <div className={`text-xs ${metric.textColor}`}>
                  {metric.subtext}
                </div>

                {/* Hover effect line */}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${metric.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                  layoutId={`hover-${index}`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Simple language explanation */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-20" />
        <div className="relative bg-slate-900/80 backdrop-blur rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">
                What do these numbers mean?
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                These are <span className="text-cyan-400 font-semibold">live updates</span> showing the
                real impact your nonprofit is making right now. Every donation tracked, every person
                helped, and every project milestone is automatically updated here.
                Think of it as your <span className="text-purple-400 font-semibold">mission's scoreboard</span> -
                showing exactly how you're changing lives!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
