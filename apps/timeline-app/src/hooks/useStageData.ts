import useSWR from 'swr';
import { API_ENDPOINTS } from '@/lib/constants';
import type { StageDetailsResponse } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook to fetch detailed stage data including gallery, documents, people, and metrics
 */
export function useStageData(stageId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<StageDetailsResponse>(
    stageId ? API_ENDPOINTS.timeline.stageById(stageId) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    stage: data?.stage,
    gallery: data?.gallery || [],
    documents: data?.documents || [],
    people: data?.people || [],
    metrics: data?.metrics || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook to fetch only gallery images for a stage
 */
export function useStageGallery(stageId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    stageId ? API_ENDPOINTS.timeline.gallery(stageId) : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    gallery: data?.gallery || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook to fetch documents for a stage
 */
export function useStageDocuments(stageId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    stageId ? API_ENDPOINTS.timeline.documents(stageId) : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    documents: data?.documents || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook to fetch people for a stage
 */
export function useStagePeople(stageId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    stageId ? API_ENDPOINTS.timeline.people(stageId) : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    people: data?.people || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook to fetch metrics for a stage
 */
export function useStageMetrics(stageId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    stageId ? API_ENDPOINTS.timeline.metrics(stageId) : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    metrics: data?.metrics || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
