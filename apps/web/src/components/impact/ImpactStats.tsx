// ============================================================================
// Impact Stats - Public-facing donation transparency metrics
// ============================================================================

'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface ImpactOverview {
  total_donations: number;
  total_donated_usd: number;
  active_projects: number;
  total_allocated: number;
  milestones_achieved: number;
}

export function ImpactStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['impact-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impact_overview')
        .select('*')
        .single();

      if (error) throw error;
      return data as ImpactOverview;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-700 bg-slate-900/50 p-6 animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-2" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      label: 'Total Donations',
      value: stats?.total_donations || 0,
      suffix: '',
      color: 'text-green-400',
      icon: '💰',
    },
    {
      label: 'Total Donated',
      value: `$${(stats?.total_donated_usd || 0).toLocaleString()}`,
      suffix: '',
      color: 'text-blue-400',
      icon: '🎯',
    },
    {
      label: 'Active Projects',
      value: stats?.active_projects || 0,
      suffix: '',
      color: 'text-purple-400',
      icon: '🚀',
    },
    {
      label: 'Milestones Achieved',
      value: stats?.milestones_achieved || 0,
      suffix: '',
      color: 'text-yellow-400',
      icon: '⭐',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-br from-slate-900/90 to-slate-800/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-4xl">{stat.icon}</div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>

          <div className={`font-cosmic text-4xl font-bold ${stat.color} mb-2`}>
            {stat.value}{stat.suffix}
          </div>

          <div className="font-sans text-sm text-gray-400">
            {stat.label}
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}
