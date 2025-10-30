/**
 * Infinite Scroll Hook
 * Custom hooks for infinite scrolling with TanStack Query
 */

import { useRef, useEffect } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';

export interface InfiniteScrollOptions<TData, TError> {
  queryKey: unknown[];
  queryFn: (pageParam: number) => Promise<{ items: TData[]; total: number }>;
  limit?: number;
  initialPageParam?: number;
}

export interface InfiniteScrollResult<TData> {
  data: TData[];
  total: number;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  hasMore: boolean; // Alias for hasNextPage for backward compatibility
  isFetching: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  error: Error | null;
  ref: React.RefObject<HTMLElement>;
}

export function useInfiniteScroll<TData = unknown, TError = Error>(
  options: InfiniteScrollOptions<TData, TError>
): InfiniteScrollResult<TData> {
  const { queryKey, queryFn, limit = 20, initialPageParam = 1 } = options;
  const ref = useRef<HTMLElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam as number),
    initialPageParam,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.items) return undefined;
      const currentTotal = allPages.reduce((sum, page) => sum + (page?.items?.length || 0), 0);
      return currentTotal < (lastPage.total || 0) ? allPages.length + 1 : undefined;
    },
  } as UseInfiniteQueryOptions<any, TError, any, any, any>);

  // Setup intersection observer for auto-loading
  useEffect(() => {
    if (!ref.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const flatData = data?.pages?.flatMap((page: any) => page?.items || []) || [];
  const total = data?.pages?.[0]?.total || 0;

  return {
    data: flatData,
    total,
    fetchNextPage,
    hasNextPage: hasNextPage || false,
    hasMore: hasNextPage || false, // Alias for hasNextPage
    isFetching,
    isFetchingNextPage,
    isLoading,
    error: error as Error | null,
    ref: ref as React.RefObject<HTMLElement>,
  };
}

export interface PaginatedQueryOptions<TData> {
  queryKey: unknown[];
  queryFn: (pageParam: number) => Promise<{ items: TData[]; total: number }>;
  limit?: number;
}

export interface PaginatedQueryResult<TData> {
  items: TData[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePaginatedQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: (pageParam: number) => Promise<{ items: TData[]; total: number }>,
  limit: number = 20
): PaginatedQueryResult<TData> {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.items) return undefined;
      const currentTotal = allPages.reduce((sum, page) => sum + (page?.items?.length || 0), 0);
      return currentTotal < (lastPage.total || 0) ? allPages.length + 1 : undefined;
    },
  } as UseInfiniteQueryOptions<any, any, any, any, any>);

  const items = data?.pages?.flatMap((page: any) => page?.items || []) || [];
  const total = data?.pages?.[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    totalPages,
    isLoading,
    error: error as Error | null,
    refetch: refetch as () => void,
  };
}

