// ============================================================================
// useAgents Hook - Fetch and manage agents
// ============================================================================

'use client';

import { useQuery } from '@tanstack/react-query';
import { stellarCockpit, type Agent } from '@/lib/supabase/client';

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await stellarCockpit.getAgents();
      if (error) throw error;
      return data as Agent[];
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useAgent(name: string) {
  return useQuery({
    queryKey: ['agent', name],
    queryFn: async () => {
      const { data, error } = await stellarCockpit.getAgent(name);
      if (error) throw error;
      return data as Agent;
    },
    enabled: !!name,
  });
}
