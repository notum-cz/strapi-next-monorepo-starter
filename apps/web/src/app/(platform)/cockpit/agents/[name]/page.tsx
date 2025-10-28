// ============================================================================
// Agent Detail Page
// ============================================================================

'use client';

import { use } from 'react';
import { useAgent } from '@/hooks/useAgents';
import { VoiceCommandButton } from '@/components/cockpit/VoiceCommandButton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

export default function AgentDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const { data: agent, isLoading, error } = useAgent(resolvedParams.name);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="font-display text-2xl text-white mb-2">Agent Not Found</div>
          <Link href="/cockpit" className="text-purple-400 hover:text-purple-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-purple-900/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <Link href="/cockpit" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>

          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="text-7xl">
              {agentIcons[agent.name] || '🤖'}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="font-cosmic text-4xl uppercase tracking-wider text-white">
                  {agent.name}
                </h1>
                <div className={cn(
                  "h-4 w-4 rounded-full animate-pulse",
                  statusColors[agent.status]
                )} />
                <span className="font-sans text-sm text-gray-400">
                  {agent.status}
                </span>
              </div>

              <h2 className="font-display text-2xl text-purple-300 mb-4">
                {agent.display_name}
              </h2>

              <p className="font-sans text-gray-400 max-w-2xl">
                {agent.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Capabilities */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="font-display text-2xl text-white mb-4">Capabilities</h3>
              {agent.capabilities && agent.capabilities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap: string) => (
                    <span
                      key={cap}
                      className="rounded-full bg-purple-900/30 px-4 py-2 font-sans text-sm text-purple-300"
                    >
                      {cap.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No capabilities defined</div>
              )}
            </div>

            {/* Model Configuration */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="font-display text-2xl text-white mb-4">Model Configuration</h3>
              {agent.model_config ? (
                <div className="font-mono text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Provider:</span>
                    <span className="text-white">{agent.model_config.provider || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Model:</span>
                    <span className="text-white">{agent.model_config.model || 'Unknown'}</span>
                  </div>
                  {agent.model_config.temperature !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temperature:</span>
                      <span className="text-white">{agent.model_config.temperature}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No model configuration</div>
              )}
            </div>

            {/* Recent Sessions */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="font-display text-2xl text-white mb-4">Recent Sessions</h3>
              <div className="text-gray-500">
                No recent sessions (Coming in Codex phase)
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="font-display text-xl text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full rounded-lg bg-purple-600 px-4 py-3 font-sans text-white transition hover:bg-purple-700">
                  Execute Task
                </button>
                <button className="w-full rounded-lg bg-slate-700 px-4 py-3 font-sans text-white transition hover:bg-slate-600">
                  View Logs
                </button>
                <button className="w-full rounded-lg bg-slate-700 px-4 py-3 font-sans text-white transition hover:bg-slate-600">
                  Test Connection
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="font-display text-xl text-white mb-4">Metadata</h3>
              <div className="font-mono text-xs space-y-2">
                <div>
                  <div className="text-gray-500">Type:</div>
                  <div className="text-white">{agent.type}</div>
                </div>
                <div>
                  <div className="text-gray-500">Created:</div>
                  <div className="text-white">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">ID:</div>
                  <div className="text-white truncate">{agent.id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VoiceCommandButton />
    </div>
  );
}
