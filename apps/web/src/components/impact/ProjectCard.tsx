// ============================================================================
// Project Card - Show individual impact projects with funding progress
// ============================================================================

'use client';

import { cn } from '@/lib/utils';

interface ImpactProject {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  partner_organization: string;
  goal_amount: number;
  current_funding: number;
  impact_metrics: any;
  status: string;
  image_url?: string;
}

interface ProjectCardProps {
  project: ImpactProject;
}

const categoryColors = {
  education: 'from-blue-600 to-blue-800',
  technology: 'from-purple-600 to-purple-800',
  agriculture: 'from-green-600 to-green-800',
  community: 'from-yellow-600 to-yellow-800',
  research: 'from-pink-600 to-pink-800',
};

const categoryIcons = {
  education: '📚',
  technology: '💻',
  agriculture: '🌱',
  community: '🤝',
  research: '🔬',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const fundingPercentage = (project.current_funding / project.goal_amount) * 100;
  const categoryColor = categoryColors[project.category as keyof typeof categoryColors] || 'from-gray-600 to-gray-800';

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20">
      {/* Project Image/Category Banner */}
      <div className={cn(
        "relative h-48 bg-gradient-to-br",
        categoryColor
      )}>
        <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20">
          {categoryIcons[project.category as keyof typeof categoryIcons] || '🎯'}
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
          <span className="font-mono text-xs text-white uppercase tracking-wider">
            {project.status}
          </span>
        </div>

        {/* Category */}
        <div className="absolute bottom-4 left-4">
          <div className="rounded-full bg-white/20 px-4 py-1 backdrop-blur-sm">
            <span className="font-sans text-sm font-semibold text-white uppercase tracking-wider">
              {project.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-display text-2xl font-bold text-white mb-2">
          {project.name}
        </h3>

        <p className="font-sans text-sm text-gray-400 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Location & Partner */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">📍</span>
            <span className="font-sans text-gray-300">{project.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">🤝</span>
            <span className="font-sans text-purple-400">{project.partner_organization}</span>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-sm text-gray-400">Funding Progress</span>
            <span className="font-cosmic text-sm font-bold text-green-400">
              {fundingPercentage.toFixed(0)}%
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-sm text-gray-400">
              ${project.current_funding.toLocaleString()}
            </span>
            <span className="font-mono text-sm text-gray-500">
              / ${project.goal_amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Impact Metrics */}
        {project.impact_metrics && Object.keys(project.impact_metrics).length > 0 && (
          <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
            <div className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Impact So Far
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(project.impact_metrics)
                .filter(([key]) => !key.startsWith('target_'))
                .slice(0, 4)
                .map(([key, value]) => (
                  <div key={key}>
                    <div className="font-cosmic text-lg font-bold text-white">
                      {String(value)}
                    </div>
                    <div className="font-sans text-xs text-gray-500">
                      {key.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
