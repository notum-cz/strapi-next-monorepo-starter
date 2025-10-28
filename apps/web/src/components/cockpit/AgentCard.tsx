// ============================================================================
// AgentCard - Display agent status and info
// ============================================================================

'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Agent } from '@/lib/supabase/client';

interface AgentCardProps {
  agent: Agent;
}

const statusColors = {
  idle: 'bg-gray-500',
  active: 'bg-green-500',
  busy: 'bg-yellow-500',
  error: 'bg-red-500',
  offline: 'bg-gray-700',
};

const agentIcons: Record<string, string> = {
  sirius: '⭐',
  andromeda: '🌌',
  vega: '✨',
  rigel: '🔭',
  cassiopeia: '🎙️',
  betelgeuse: '🏗️',
};

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={`/cockpit/agents/${agent.name}`}>
      <div className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-purple-500/20">
        {/* Status indicator */}
        <div className="absolute right-4 top-4">
          <div className={cn(
            "h-3 w-3 rounded-full animate-pulse",
            statusColors[agent.status]
          )} />
        </div>

        {/* Icon */}
        <div className="mb-4 text-5xl">
          {agentIcons[agent.name] || '🤖'}
        </div>

        {/* Name */}
        <h3 className="font-cosmic text-2xl uppercase tracking-wider text-white mb-2">
          {agent.name}
        </h3>

        {/* Display name */}
        <p className="font-display text-lg text-purple-300 mb-3">
          {agent.display_name}
        </p>

        {/* Description */}
        <p className="font-sans text-sm text-gray-400 line-clamp-2 mb-4">
          {agent.description || 'No description'}
        </p>

        {/* Capabilities */}
        {agent.capabilities && agent.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 3).map((cap: string) => (
              <span
                key={cap}
                className="rounded-full bg-purple-900/30 px-2 py-1 text-xs font-sans text-purple-300"
              >
                {cap.replace('_', ' ')}
              </span>
            ))}
            {agent.capabilities.length > 3 && (
              <span className="rounded-full bg-purple-900/30 px-2 py-1 text-xs font-sans text-purple-300">
                +{agent.capabilities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}
