import useSWR from 'swr';
import { API_ENDPOINTS } from '@/lib/constants';
import type { TimelineStage, ApiResponse } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook to fetch all timeline stages
 */
export function useTimeline() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TimelineStage[]>>(
    API_ENDPOINTS.timeline.stages,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    stages: data?.data || [],
    isLoading,
    isError: error,
    refresh: mutate,
    total: data?.meta?.pagination?.total || 0,
  };
}
