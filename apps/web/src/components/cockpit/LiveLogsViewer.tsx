// ============================================================================
// LiveLogsViewer - Real-time agent logs
// ============================================================================

'use client';

import { useRealtimeLogs } from '@/hooks/useRealtimeLogs';
import { cn } from '@/lib/utils';
import type { AgentLog } from '@/lib/supabase/client';

const logLevelColors = {
  debug: 'text-gray-400',
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  critical: 'text-red-600',
};

const logLevelIcons = {
  debug: '🐛',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  critical: '🔥',
};

export function LiveLogsViewer() {
  const logs = useRealtimeLogs(50);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/90 p-4 font-mono text-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg text-white">Live Logs</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-sans text-xs text-gray-400">
            {logs.length} logs
          </span>
        </div>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {logs.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No logs yet. Waiting for agent activity...
          </div>
        )}

        {logs.map((log: AgentLog) => (
          <div
            key={log.id}
            className={cn(
              "border-l-2 pl-3 py-1 text-xs",
              logLevelColors[log.log_level] === 'text-red-400' || logLevelColors[log.log_level] === 'text-red-600'
                ? 'border-red-500'
                : logLevelColors[log.log_level] === 'text-yellow-400'
                ? 'border-yellow-500'
                : 'border-blue-500'
            )}
          >
            <div className="flex items-start gap-2">
              <span className="shrink-0">
                {logLevelIcons[log.log_level]}
              </span>
              <div className="flex-1 space-y-1">
                <div className={cn("font-semibold", logLevelColors[log.log_level])}>
                  [{log.log_level.toUpperCase()}] {log.message}
                </div>
                {log.thought_process && (
                  <div className="text-gray-500 italic">
                    💭 {log.thought_process}
                  </div>
                )}
                {log.tool_call && (
                  <div className="text-purple-400">
                    🔧 {log.tool_call}
                  </div>
                )}
                <div className="text-gray-600 text-xs">
                  {new Date(log.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
