/**
 * TanStack Query hooks for fetching Mastodon data
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  getHomeTimeline,
  getPublicTimeline,
  getHashtagTimeline,
  getStatus,
  getStatusContext,
  getAccount,
  lookupAccount,
  verifyCredentials,
  getAccountStatuses,
  getFollowers,
  getFollowing,
  getRelationships,
  getBookmarks,
  search,
  getCustomEmojis,
  getTrendingStatuses,
  getInstance,
  createCustomClient,
  getNotifications,
  getNotification,
  getUnreadNotificationCount,
} from './client'
import { queryKeys } from './queryKeys'
import type { TimelineParams, SearchParams, Status, NotificationParams } from '../types/mastodon'
import { useAuthStore } from '../hooks/useStores'

// Timelines
export function useHomeTimeline(params?: TimelineParams) {
  return useQuery({
    queryKey: queryKeys.timelines.home(params),
    queryFn: () => getHomeTimeline(params),
  })
}

export function useInfiniteHomeTimeline() {
  return useInfiniteQuery({
    queryKey: queryKeys.timelines.home(),
    queryFn: ({ pageParam }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getHomeTimeline(params)
    },
    getNextPageParam: (lastPage) => {
      // Stop fetching if page is empty or has fewer items than requested (last page)
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })
}

export function usePublicTimeline(params?: TimelineParams) {
  return useQuery({
    queryKey: queryKeys.timelines.public(params),
    queryFn: () => getPublicTimeline(params),
  })
}

export function useInfiniteHashtagTimeline(hashtag: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.timelines.hashtag(hashtag),
    queryFn: ({ pageParam }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getHashtagTimeline(hashtag, params)
    },
    getNextPageParam: (lastPage) => {
      // Stop fetching if page is empty or has fewer items than requested (last page)
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!hashtag,
  })
}

// Statuses
export function useStatus(id: string) {
  return useQuery({
    queryKey: queryKeys.statuses.detail(id),
    queryFn: () => getStatus(id),
    enabled: !!id,
  })
}

export function useStatusContext(id: string) {
  return useQuery({
    queryKey: queryKeys.statuses.context(id),
    queryFn: () => getStatusContext(id),
    enabled: !!id,
  })
}

// Accounts
export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: () => getAccount(id),
    enabled: !!id,
  })
}

export function useLookupAccount(acct: string) {
  return useQuery({
    queryKey: queryKeys.accounts.lookup(acct),
    queryFn: () => lookupAccount(acct),
    enabled: !!acct,
  })
}

export function useCurrentAccount() {
  const authStore = useAuthStore()

  return useQuery({
    queryKey: queryKeys.accounts.current(),
    queryFn: () => verifyCredentials(),
    enabled: authStore.isAuthenticated,
  })
}

export function useAccountStatuses(id: string, params?: TimelineParams) {
  return useQuery({
    queryKey: queryKeys.accounts.statuses(id, params),
    queryFn: () => getAccountStatuses(id, params),
    enabled: !!id,
  })
}

export function useInfiniteAccountStatuses(id: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.accounts.statuses(id),
    queryFn: ({ pageParam }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getAccountStatuses(id, params)
    },
    getNextPageParam: (lastPage) => {
      // Stop fetching if page is empty or has fewer items than requested (last page)
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!id,
  })
}

export function useFollowers(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.followers(id),
    queryFn: () => getFollowers(id),
    enabled: !!id,
  })
}

export function useFollowing(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.following(id),
    queryFn: () => getFollowing(id),
    enabled: !!id,
  })
}

export function useRelationships(ids: string[]) {
  const authStore = useAuthStore()

  return useQuery({
    queryKey: queryKeys.accounts.relationships(ids),
    queryFn: () => getRelationships(ids),
    enabled: ids.length > 0 && authStore.isAuthenticated,
  })
}

// Bookmarks
export function useBookmarks(params?: TimelineParams) {
  return useQuery({
    queryKey: queryKeys.bookmarks.all(params),
    queryFn: () => getBookmarks(params),
  })
}

export function useInfiniteBookmarks() {
  return useInfiniteQuery({
    queryKey: queryKeys.bookmarks.all(),
    queryFn: ({ pageParam }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getBookmarks(params)
    },
    getNextPageParam: (lastPage) => {
      // Stop fetching if page is empty or has fewer items than requested (last page)
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })
}

// Search
export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: queryKeys.search.all(params.q, params.type),
    queryFn: () => search(params),
    enabled: !!params.q && params.q.trim().length > 0,
  })
}

// Custom Emojis
export function useCustomEmojis() {
  return useQuery({
    queryKey: ['customEmojis'],
    queryFn: () => getCustomEmojis(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  })
}

// Trends
export function useInfiniteTrendingStatuses() {
  return useInfiniteQuery({
    queryKey: queryKeys.trends.statuses(),
    queryFn: async ({ pageParam }) => {
      // Use mastodon.social for trending statuses (public API, no auth required)
      const trendingClient = createCustomClient('https://mastodon.social')
      const params = { limit: 20, offset: pageParam }
      const { data } = await trendingClient.get<Status[]>('/api/v1/trends/statuses', { params })
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      // Stop fetching if page is empty or has fewer items than requested (last page)
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return allPages.length * 20
    },
    initialPageParam: 0,
  })
}

// Instance
export function useInstance() {
  return useQuery({
    queryKey: queryKeys.instance.default,
    queryFn: () => getInstance(),
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  })
}

// Notifications
export function useNotifications(params?: NotificationParams) {
  const authStore = useAuthStore()

  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => getNotifications(params),
    enabled: authStore.isAuthenticated,
  })
}

export function useInfiniteNotifications() {
  const authStore = useAuthStore()

  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam }) => {
      const params: NotificationParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getNotifications(params)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
    enabled: authStore.isAuthenticated,
  })
}

export function useNotification(id: string) {
  const authStore = useAuthStore()

  return useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: () => getNotification(id),
    enabled: !!id && authStore.isAuthenticated,
  })
}

export function useUnreadNotificationCount() {
  const authStore = useAuthStore()

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => getUnreadNotificationCount(),
    enabled: authStore.isAuthenticated,
    refetchInterval: 60000, // Refetch every minute
  })
}
