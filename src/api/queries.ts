/**
 * TanStack Query hooks for fetching Mastodon data
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getMastodonClient } from './client'
import { queryKeys } from './queryKeys'
import type { TimelineParams, SearchParams } from '../types/mastodon'

// Timelines
export function useHomeTimeline(params?: TimelineParams) {
  return useQuery({
    queryKey: queryKeys.timelines.home(params),
    queryFn: () => getMastodonClient().getHomeTimeline(params),
  })
}

export function useInfiniteHomeTimeline() {
  return useInfiniteQuery({
    queryKey: queryKeys.timelines.home(),
    queryFn: ({ pageParam }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getMastodonClient().getHomeTimeline(params)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })
}

export function usePublicTimeline(params?: TimelineParams) {
  return useQuery({
    queryKey: queryKeys.timelines.public(params),
    queryFn: () => getMastodonClient().getPublicTimeline(params),
  })
}

// Statuses
export function useStatus(id: string) {
  return useQuery({
    queryKey: queryKeys.statuses.detail(id),
    queryFn: () => getMastodonClient().getStatus(id),
    enabled: !!id,
  })
}

export function useStatusContext(id: string) {
  return useQuery({
    queryKey: queryKeys.statuses.context(id),
    queryFn: () => getMastodonClient().getStatusContext(id),
    enabled: !!id,
  })
}

// Accounts
export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: () => getMastodonClient().getAccount(id),
    enabled: !!id,
  })
}

export function useCurrentAccount() {
  return useQuery({
    queryKey: queryKeys.accounts.current(),
    queryFn: () => getMastodonClient().verifyCredentials(),
  })
}

export function useAccountStatuses(id: string, params?: TimelineParams) {
  return useQuery({
    queryKey: queryKeys.accounts.statuses(id, params),
    queryFn: () => getMastodonClient().getAccountStatuses(id, params),
    enabled: !!id,
  })
}

export function useInfiniteAccountStatuses(id: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.accounts.statuses(id),
    queryFn: ({ pageParam }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getMastodonClient().getAccountStatuses(id, params)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!id,
  })
}

export function useFollowers(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.followers(id),
    queryFn: () => getMastodonClient().getFollowers(id),
    enabled: !!id,
  })
}

export function useFollowing(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.following(id),
    queryFn: () => getMastodonClient().getFollowing(id),
    enabled: !!id,
  })
}

export function useRelationships(ids: string[]) {
  return useQuery({
    queryKey: queryKeys.accounts.relationships(ids),
    queryFn: () => getMastodonClient().getRelationships(ids),
    enabled: ids.length > 0,
  })
}

// Bookmarks
export function useBookmarks(params?: TimelineParams) {
  return useQuery({
    queryKey: queryKeys.bookmarks.all(params),
    queryFn: () => getMastodonClient().getBookmarks(params),
  })
}

export function useInfiniteBookmarks() {
  return useInfiniteQuery({
    queryKey: queryKeys.bookmarks.all(),
    queryFn: ({ pageParam }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getMastodonClient().getBookmarks(params)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })
}

// Search
export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: queryKeys.search.all(params.q, params.type),
    queryFn: () => getMastodonClient().search(params),
    enabled: !!params.q && params.q.trim().length > 0,
  })
}
