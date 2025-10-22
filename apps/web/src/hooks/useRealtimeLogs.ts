// ============================================================================
// useRealtimeLogs Hook - Subscribe to real-time agent logs
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { stellarCockpit, type AgentLog } from '@/lib/supabase/client';

export function useRealtimeLogs(limit: number = 100) {
  const [logs, setLogs] = useState<AgentLog[]>([]);

  useEffect(() => {
    // Subscribe to new logs
    const channel = stellarCockpit.subscribeToLogs((log) => {
      setLogs((prev) => {
        const updated = [log, ...prev];
        return updated.slice(0, limit); // Keep only last N logs
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [limit]);

  return logs;
}
