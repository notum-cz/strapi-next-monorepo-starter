/**
 * Game-style Skeleton Loading Components
 * Futuristic animated placeholders for loading states
 */

'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/styles'

interface SkeletonProps {
  className?: string
}

// Base skeleton with shimmer effect
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-slate-800/50',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-slate-700/30 before:to-transparent',
        'before:animate-shimmer',
        className
      )}
    />
  )
}

// Animated skeleton with glow pulse
export function GlowSkeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        'rounded-lg bg-slate-800/50 border border-slate-700/30',
        className
      )}
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(34, 211, 238, 0)',
          '0 0 20px 2px rgba(34, 211, 238, 0.1)',
          '0 0 0 0 rgba(34, 211, 238, 0)',
        ],
      }}
      transition={{ repeat: Infinity, duration: 2 }}
    />
  )
}

// Card skeleton for agent cards
export function AgentCardSkeleton() {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl blur opacity-20" />
      <div className="relative bg-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="w-3 h-3 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-slate-700/30 rounded-xl blur" />
      <div className="relative bg-slate-900/80 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

// Activity item skeleton
export function ActivitySkeleton() {
  return (
    <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

// Metric card skeleton for Impact HUD
export function MetricCardSkeleton() {
  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-slate-700/20 rounded-xl blur" />
      <div className="relative bg-slate-900/80 rounded-xl p-4 border border-slate-700/50">
        <Skeleton className="w-8 h-8 rounded-lg mb-3" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

// Chat message skeleton
export function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />}
        <div className={`rounded-2xl px-4 py-3 ${isUser ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// Full page loading skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header skeleton */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AgentCardSkeleton />
          <AgentCardSkeleton />
          <AgentCardSkeleton />
          <AgentCardSkeleton />
          <AgentCardSkeleton />
          <AgentCardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Inline loading spinner
export function LoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-cyan-500 border-t-transparent',
          sizes[size]
        )}
      />
      <div
        className={cn(
          'absolute inset-0 animate-ping rounded-full border-cyan-500 opacity-20',
          sizes[size]
        )}
      />
    </div>
  )
}

// Pulsing dot indicator
export function PulsingDot({ color = 'cyan', size = 'md' }: { color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  const colors: Record<string, string> = {
    cyan: 'bg-cyan-400',
    green: 'bg-green-400',
    purple: 'bg-purple-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
  }

  return (
    <motion.div
      className={cn('rounded-full', sizes[size], colors[color])}
      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    />
  )
}
