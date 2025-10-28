// ============================================================================
// Observability Dashboard - Real-time logs and metrics
// ============================================================================

'use client';

import { useRealtimeLogs } from '@/hooks/useRealtimeLogs';
import { VoiceCommandButton } from '@/components/cockpit/VoiceCommandButton';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const logLevelColors = {
  debug: 'text-gray-400 border-gray-700',
  info: 'text-blue-400 border-blue-700',
  warn: 'text-yellow-400 border-yellow-700',
  error: 'text-red-400 border-red-700',
  critical: 'text-red-600 border-red-800',
};

export default function ObservabilityPage() {
  const logs = useRealtimeLogs(100);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const filteredLogs = selectedLevel
    ? logs.filter(log => log.log_level === selectedLevel)
    : logs;

  const logCounts = {
    debug: logs.filter(l => l.log_level === 'debug').length,
    info: logs.filter(l => l.log_level === 'info').length,
    warn: logs.filter(l => l.log_level === 'warn').length,
    error: logs.filter(l => l.log_level === 'error').length,
    critical: logs.filter(l => l.log_level === 'critical').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-purple-900/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="cosmic-gradient font-display text-5xl font-bold mb-3">
            Observability
          </h1>
          <p className="font-sans text-lg text-gray-400">
            Real-time agent logs and system metrics
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-8 py-12">
        {/* Navigation */}
        <div className="mb-8 flex gap-4">
          <Link
            href="/cockpit"
            className="rounded-lg bg-slate-800 px-6 py-2 font-sans text-white transition hover:bg-slate-700"
          >
            Dashboard
          </Link>
          <Link
            href="/cockpit/observability"
            className="rounded-lg bg-purple-600 px-6 py-2 font-sans text-white transition hover:bg-purple-700"
          >
            Observability
          </Link>
        </div>

        {/* Log Level Filters */}
        <div className="mb-6 grid grid-cols-5 gap-4">
          <button
            onClick={() => setSelectedLevel(selectedLevel === 'debug' ? null : 'debug')}
            className={cn(
              "rounded-lg border p-4 transition",
              selectedLevel === 'debug'
                ? "border-gray-500 bg-gray-900"
                : "border-slate-700 bg-slate-900/50 hover:bg-slate-900"
            )}
          >
            <div className="font-cosmic text-2xl text-gray-400">{logCounts.debug}</div>
            <div className="font-sans text-sm text-gray-500">Debug</div>
          </button>

          <button
            onClick={() => setSelectedLevel(selectedLevel === 'info' ? null : 'info')}
            className={cn(
              "rounded-lg border p-4 transition",
              selectedLevel === 'info'
                ? "border-blue-500 bg-blue-900/30"
                : "border-slate-700 bg-slate-900/50 hover:bg-slate-900"
            )}
          >
            <div className="font-cosmic text-2xl text-blue-400">{logCounts.info}</div>
            <div className="font-sans text-sm text-gray-500">Info</div>
          </button>

          <button
            onClick={() => setSelectedLevel(selectedLevel === 'warn' ? null : 'warn')}
            className={cn(
              "rounded-lg border p-4 transition",
              selectedLevel === 'warn'
                ? "border-yellow-500 bg-yellow-900/30"
                : "border-slate-700 bg-slate-900/50 hover:bg-slate-900"
            )}
          >
            <div className="font-cosmic text-2xl text-yellow-400">{logCounts.warn}</div>
            <div className="font-sans text-sm text-gray-500">Warnings</div>
          </button>

          <button
            onClick={() => setSelectedLevel(selectedLevel === 'error' ? null : 'error')}
            className={cn(
              "rounded-lg border p-4 transition",
              selectedLevel === 'error'
                ? "border-red-500 bg-red-900/30"
                : "border-slate-700 bg-slate-900/50 hover:bg-slate-900"
            )}
          >
            <div className="font-cosmic text-2xl text-red-400">{logCounts.error}</div>
            <div className="font-sans text-sm text-gray-500">Errors</div>
          </button>

          <button
            onClick={() => setSelectedLevel(selectedLevel === 'critical' ? null : 'critical')}
            className={cn(
              "rounded-lg border p-4 transition",
              selectedLevel === 'critical'
                ? "border-red-700 bg-red-950/50"
                : "border-slate-700 bg-slate-900/50 hover:bg-slate-900"
            )}
          >
            <div className="font-cosmic text-2xl text-red-600">{logCounts.critical}</div>
            <div className="font-sans text-sm text-gray-500">Critical</div>
          </button>
        </div>

        {/* Live Status */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-green-700/30 bg-green-900/10 p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="font-sans text-green-400">Live Streaming</span>
          </div>
          <span className="font-mono text-sm text-gray-400">
            {filteredLogs.length} logs
          </span>
        </div>

        {/* Logs Terminal */}
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-6">
          <div className="font-mono text-sm space-y-3 max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                {selectedLevel
                  ? `No ${selectedLevel} logs yet`
                  : 'No logs yet. Waiting for agent activity...'
                }
              </div>
            )}

            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  "border-l-2 pl-4 py-2 rounded-r",
                  logLevelColors[log.log_level]
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 text-gray-600">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold">
                      [{log.log_level.toUpperCase()}] {log.message}
                    </div>
                    {log.thought_process && (
                      <div className="mt-1 text-gray-500 italic">
                        💭 {log.thought_process}
                      </div>
                    )}
                    {log.tool_call && (
                      <div className="mt-1 text-purple-400">
                        🔧 {log.tool_call}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VoiceCommandButton />
    </div>
  );
}
