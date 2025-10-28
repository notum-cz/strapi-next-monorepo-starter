'use client'

/**
 * ProjectCardNew - New World Kids project cards
 * Shows real projects: Indigo Azul, Culture Shock, Culture Shock Sports, Real Minority Report
 */

import { motion } from 'framer-motion'
import { CheckCircle, Clock, Zap, ExternalLink, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type ProjectStatus = 'active' | 'building' | 'launching'

interface Project {
  id: string
  title: string
  subtitle: string
  description: string
  status: ProjectStatus
  season?: string
  location?: string
  launchDate?: string
  imageUrl: string
  category: 'food' | 'education' | 'sports' | 'media'
  fundingProgress?: number
  impactStats?: {
    label: string
    value: string
  }[]
  detailsUrl?: string
}

interface ProjectCardNewProps {
  project: Project
  index?: number
}

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-400',
  },
  building: {
    label: 'Building',
    icon: Clock,
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-400',
  },
  launching: {
    label: 'Launching Soon',
    icon: Zap,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-400',
  },
}

const CATEGORY_LABELS = {
  food: '🌱 Food & Sustainability',
  education: '🎓 Education & Development',
  sports: '⚽ Sports & Mentorship',
  media: '📰 Media & Community',
}

export function ProjectCardNew({ project, index = 0 }: ProjectCardNewProps) {
  const statusConfig = STATUS_CONFIG[project.status]
  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${statusConfig.color} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />

      {/* Card */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl bg-slate-900/80 border border-slate-700/50">
          <StatusIcon className={`w-3 h-3 ${statusConfig.textColor}`} />
          <span className={`text-xs font-semibold uppercase tracking-wide ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Active indicator dot - Top Left */}
        {project.status === 'active' && (
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              className="w-3 h-3 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        )}

        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

          {/* Category badge */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs text-slate-300 border border-slate-700/50">
              {CATEGORY_LABELS[project.category]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title & Subtitle */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-slate-400">
              {project.subtitle}
              {project.season && <span className="ml-2 text-cyan-400 font-semibold">• {project.season}</span>}
              {project.location && <span className="ml-2">• {project.location}</span>}
            </p>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {project.description}
          </p>

          {/* Launch Date (for launching projects) */}
          {project.launchDate && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">{project.launchDate}</span>
              </div>
            </div>
          )}

          {/* Impact Stats */}
          {project.impactStats && project.impactStats.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              {project.impactStats.map((stat, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Funding Progress Bar */}
          {project.fundingProgress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Funding Progress</span>
                <span className="text-xs font-semibold text-cyan-400">{project.fundingProgress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${statusConfig.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.fundingProgress}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                />
              </div>
            </div>
          )}

          {/* CTA Button */}
          {project.detailsUrl && (
            <Link
              href={project.detailsUrl}
              className={`group/btn flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r ${statusConfig.color} rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300`}
            >
              <span>Learn More</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Hover effect line */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${statusConfig.color} opacity-0 group-hover:opacity-100 transition-opacity`}
        />
      </div>
    </motion.div>
  )
}
