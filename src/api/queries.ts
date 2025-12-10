/**
 * TanStack Query hooks for fetching Mastodon data
 * Uses queryOptions pattern for reusability and type safety
 */

import { useQuery, useInfiniteQuery, queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
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
  getPinnedStatuses,
  getFollowers,
  getFollowing,
  getRelationships,
  getFollowRequests,
  getBlockedAccounts,
  getMutedAccounts,
  getBookmarks,
  search,
  getCustomEmojis,
  createCustomClient,
  getNotifications,
  getNotification,
  getUnreadNotificationCount,
  getPreferences,
  getLists,
  getList,
  getListAccounts,
  getListTimeline,
  getAccountLists,
  getStatusHistory,
  getStatusSource,
  getScheduledStatuses,
  getScheduledStatus,
} from './client'
import { queryKeys } from './queryKeys'
import type { TimelineParams, SearchParams, Status, NotificationParams, Account, ScheduledStatus, Tag, TrendingLink } from '../types/mastodon'
import { useAuthStore } from '../hooks/useStores'

// ============================================================================
// QUERY OPTIONS - Reusable query configurations
// ============================================================================

// Timeline Options
export const homeTimelineOptions = (params?: TimelineParams) =>
  queryOptions({
    queryKey: queryKeys.timelines.home(params),
    queryFn: ({ signal }) => getHomeTimeline(params, signal),
  })

export const infiniteHomeTimelineOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.timelines.home(),
    queryFn: ({ pageParam, signal }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getHomeTimeline(params, signal)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const publicTimelineOptions = (params?: TimelineParams) =>
  queryOptions({
    queryKey: queryKeys.timelines.public(params),
    queryFn: ({ signal }) => getPublicTimeline(params, signal),
  })

export const infiniteHashtagTimelineOptions = (hashtag: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.timelines.hashtag(hashtag),
    queryFn: ({ pageParam, signal }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getHashtagTimeline(hashtag, params, signal)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

// Status Options
export const statusOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.statuses.detail(id),
    queryFn: ({ signal }) => getStatus(id, signal),
  })

export const statusContextOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.statuses.context(id),
    queryFn: ({ signal }) => getStatusContext(id, signal),
  })

export const statusHistoryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.statuses.history(id),
    queryFn: ({ signal }) => getStatusHistory(id, signal),
  })

export const statusSourceOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.statuses.source(id),
    queryFn: ({ signal }) => getStatusSource(id, signal),
  })

// Account Options
export const accountOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: ({ signal }) => getAccount(id, signal),
  })

export const lookupAccountOptions = (acct: string) =>
  queryOptions({
    queryKey: queryKeys.accounts.lookup(acct),
    queryFn: ({ signal }) => lookupAccount(acct, signal),
  })

export const currentAccountOptions = () =>
  queryOptions({
    queryKey: queryKeys.accounts.current(),
    queryFn: ({ signal }) => verifyCredentials(signal),
  })

export const accountStatusesOptions = (id: string, params?: TimelineParams) =>
  queryOptions({
    queryKey: queryKeys.accounts.statuses(id, params),
    queryFn: ({ signal }) => getAccountStatuses(id, params, signal),
  })

export const infiniteAccountStatusesOptions = (id: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.accounts.statuses(id),
    queryFn: ({ pageParam, signal }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getAccountStatuses(id, params, signal)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export interface AccountStatusFilters {
  exclude_replies?: boolean
  exclude_reblogs?: boolean
  only_media?: boolean
}

export const infiniteAccountStatusesWithFiltersOptions = (
  id: string,
  filters: AccountStatusFilters
) =>
  infiniteQueryOptions({
    queryKey: queryKeys.accounts.statuses(id, filters),
    queryFn: ({ pageParam, signal }) => {
      const params: TimelineParams = { limit: 20, ...filters }
      if (pageParam) params.max_id = pageParam
      return getAccountStatuses(id, params, signal)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const pinnedStatusesOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.accounts.pinnedStatuses(id),
    queryFn: ({ signal }) => getPinnedStatuses(id, signal),
  })

export const followersOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.accounts.followers(id),
    queryFn: ({ signal }) => getFollowers(id, undefined, signal),
  })

export const infiniteFollowersOptions = (id: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.accounts.followers(id),
    queryFn: ({ pageParam, signal }) => {
      const params: { max_id?: string; limit: number } = { limit: 40 }
      if (pageParam) params.max_id = pageParam
      return getFollowers(id, params, signal)
    },
    getNextPageParam: (lastPage: Account[]) => {
      if (lastPage.length === 0 || lastPage.length < 40) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const followingOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.accounts.following(id),
    queryFn: ({ signal }) => getFollowing(id, undefined, signal),
  })

export const infiniteFollowingOptions = (id: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.accounts.following(id),
    queryFn: ({ pageParam, signal }) => {
      const params: { max_id?: string; limit: number } = { limit: 40 }
      if (pageParam) params.max_id = pageParam
      return getFollowing(id, params, signal)
    },
    getNextPageParam: (lastPage: Account[]) => {
      if (lastPage.length === 0 || lastPage.length < 40) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const infiniteFollowRequestsOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.accounts.followRequests(),
    queryFn: ({ pageParam, signal }) => {
      const params: { max_id?: string; limit: number } = { limit: 40 }
      if (pageParam) params.max_id = pageParam
      return getFollowRequests(params, signal)
    },
    getNextPageParam: (lastPage: Account[]) => {
      if (lastPage.length === 0 || lastPage.length < 40) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const relationshipsOptions = (ids: string[]) =>
  queryOptions({
    queryKey: queryKeys.accounts.relationships(ids),
    queryFn: ({ signal }) => getRelationships(ids, signal),
  })

// Bookmarks Options
export const bookmarksOptions = (params?: TimelineParams) =>
  queryOptions({
    queryKey: queryKeys.bookmarks.all(params),
    queryFn: ({ signal }) => getBookmarks(params, signal),
  })

export const infiniteBookmarksOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.bookmarks.all(),
    queryFn: ({ pageParam, signal }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getBookmarks(params, signal)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

// Search Options
export const searchOptions = (params: SearchParams) =>
  queryOptions({
    queryKey: queryKeys.search.all(params.q, params.type),
    queryFn: ({ signal }) => search(params, signal),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

export const infiniteSearchOptions = (params: SearchParams) =>
  infiniteQueryOptions({
    queryKey: [...queryKeys.search.all(params.q, params.type), 'infinite'],
    queryFn: ({ pageParam, signal }) => {
      const searchParams = { ...params, limit: 20, offset: pageParam }
      return search(searchParams, signal)
    },
    getNextPageParam: (lastPage, allPages) => {
      const hasResults =
        lastPage.accounts.length >= 20 ||
        lastPage.statuses.length >= 20 ||
        lastPage.hashtags.length >= 20
      if (!hasResults) return undefined
      return allPages.length * 20
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  })

// Custom Emojis Options
export const customEmojisOptions = () =>
  queryOptions({
    queryKey: ['customEmojis'] as const,
    queryFn: ({ signal }) => getCustomEmojis(signal),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  })

// Trends Options
export const infiniteTrendingStatusesOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.trends.statuses(),
    queryFn: async ({ pageParam, signal }) => {
      const trendingClient = createCustomClient('https://mastodon.social')
      const params = { limit: 20, offset: pageParam }
      const { data } = await trendingClient.get<Status[]>('/api/v1/trends/statuses', { params, signal })
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return allPages.length * 20
    },
    initialPageParam: 0,
  })

export const infiniteTrendingTagsOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.trends.tags(),
    queryFn: async ({ pageParam, signal }) => {
      const trendingClient = createCustomClient('https://mastodon.social')
      const params = { limit: 20, offset: pageParam }
      const { data } = await trendingClient.get<Tag[]>('/api/v1/trends/tags', { params, signal })
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return allPages.length * 20
    },
    initialPageParam: 0,
  })

export const infiniteTrendingLinksOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.trends.links(),
    queryFn: async ({ pageParam, signal }) => {
      const trendingClient = createCustomClient('https://mastodon.social')
      const params = { limit: 20, offset: pageParam }
      const { data } = await trendingClient.get<TrendingLink[]>('/api/v1/trends/links', { params, signal })
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return allPages.length * 20
    },
    initialPageParam: 0,
  })

// Instance Options
export const instanceOptions = () =>
  queryOptions({
    queryKey: queryKeys.instance.default,
    queryFn: ({ signal }) => import('./client').then(m => m.getInstance(signal)),
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  })

// Notification Options
export const notificationsOptions = (params?: NotificationParams) =>
  queryOptions({
    queryKey: queryKeys.notifications.list(params),
    queryFn: ({ signal }) => getNotifications(params, signal),
  })

export const infiniteNotificationsOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam, signal }) => {
      const params: NotificationParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getNotifications(params, signal)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const notificationOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: ({ signal }) => getNotification(id, signal),
  })

export const unreadNotificationCountOptions = () =>
  queryOptions({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: ({ signal }) => getUnreadNotificationCount(signal),
    refetchInterval: 60000, // Refetch every minute
  })

// Blocked/Muted Accounts Options
export const infiniteBlockedAccountsOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.blocks.list(),
    queryFn: ({ pageParam, signal }) => {
      const params: { max_id?: string; limit: number } = { limit: 40 }
      if (pageParam) params.max_id = pageParam
      return getBlockedAccounts(params, signal)
    },
    getNextPageParam: (lastPage: Account[]) => {
      if (lastPage.length === 0 || lastPage.length < 40) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const infiniteMutedAccountsOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.mutes.list(),
    queryFn: ({ pageParam, signal }) => {
      const params: { max_id?: string; limit: number } = { limit: 40 }
      if (pageParam) params.max_id = pageParam
      return getMutedAccounts(params, signal)
    },
    getNextPageParam: (lastPage: Account[]) => {
      if (lastPage.length === 0 || lastPage.length < 40) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

// Preferences Options
export const preferencesOptions = () =>
  queryOptions({
    queryKey: queryKeys.preferences.all(),
    queryFn: ({ signal }) => getPreferences(signal),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

// List Options
export const listsOptions = () =>
  queryOptions({
    queryKey: queryKeys.lists.all(),
    queryFn: ({ signal }) => getLists(signal),
  })

export const listOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.lists.detail(id),
    queryFn: ({ signal }) => getList(id, signal),
  })

export const infiniteListAccountsOptions = (id: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.lists.accounts(id),
    queryFn: ({ pageParam, signal }) => {
      const params: { max_id?: string; limit: number } = { limit: 40 }
      if (pageParam) params.max_id = pageParam
      return getListAccounts(id, params, signal)
    },
    getNextPageParam: (lastPage: Account[]) => {
      if (lastPage.length === 0 || lastPage.length < 40) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const infiniteListTimelineOptions = (id: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.lists.timeline(id),
    queryFn: ({ pageParam, signal }) => {
      const params: TimelineParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getListTimeline(id, params, signal)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const accountListsOptions = (accountId: string) =>
  queryOptions({
    queryKey: ['accounts', accountId, 'lists'] as const,
    queryFn: ({ signal }) => getAccountLists(accountId, signal),
  })

// Scheduled Statuses Options
export const infiniteScheduledStatusesOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.scheduledStatuses.list(),
    queryFn: ({ pageParam, signal }) => {
      const params: { min_id?: string; max_id?: string; limit?: number } = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getScheduledStatuses(params, signal)
    },
    getNextPageParam: (lastPage: ScheduledStatus[]) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    initialPageParam: undefined as string | undefined,
  })

export const scheduledStatusOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.scheduledStatuses.detail(id),
    queryFn: ({ signal }) => getScheduledStatus(id, signal),
  })

// ============================================================================
// HOOKS - React hooks using the query options
// ============================================================================

// Timelines
export function useHomeTimeline(params?: TimelineParams) {
  return useQuery(homeTimelineOptions(params))
}

export function useInfiniteHomeTimeline() {
  return useInfiniteQuery(infiniteHomeTimelineOptions())
}

export function usePublicTimeline(params?: TimelineParams) {
  return useQuery(publicTimelineOptions(params))
}

export function useInfiniteHashtagTimeline(hashtag: string) {
  return useInfiniteQuery({
    ...infiniteHashtagTimelineOptions(hashtag),
    enabled: !!hashtag,
  })
}

// Statuses
export function useStatus(id: string) {
  return useQuery({
    ...statusOptions(id),
    enabled: !!id,
  })
}

export function useStatusContext(id: string) {
  return useQuery({
    ...statusContextOptions(id),
    enabled: !!id,
  })
}

export function useStatusHistory(id: string) {
  return useQuery({
    ...statusHistoryOptions(id),
    enabled: !!id,
  })
}

export function useStatusSource(id: string) {
  return useQuery({
    ...statusSourceOptions(id),
    enabled: !!id,
  })
}

// Accounts
export function useAccount(id: string) {
  return useQuery({
    ...accountOptions(id),
    enabled: !!id,
  })
}

export function useLookupAccount(acct: string) {
  return useQuery({
    ...lookupAccountOptions(acct),
    enabled: !!acct,
  })
}

export function useCurrentAccount() {
  const authStore = useAuthStore()
  return useQuery({
    ...currentAccountOptions(),
    enabled: authStore.isAuthenticated,
  })
}

export function useAccountStatuses(id: string, params?: TimelineParams) {
  return useQuery({
    ...accountStatusesOptions(id, params),
    enabled: !!id,
  })
}

export function useInfiniteAccountStatuses(id: string) {
  return useInfiniteQuery({
    ...infiniteAccountStatusesOptions(id),
    enabled: !!id,
  })
}

export function useInfiniteAccountStatusesWithFilters(
  id: string,
  filters: AccountStatusFilters
) {
  return useInfiniteQuery({
    ...infiniteAccountStatusesWithFiltersOptions(id, filters),
    enabled: !!id,
  })
}

export function usePinnedStatuses(id: string) {
  return useQuery({
    ...pinnedStatusesOptions(id),
    enabled: !!id,
  })
}

export function useFollowers(id: string) {
  return useQuery({
    ...followersOptions(id),
    enabled: !!id,
  })
}

export function useInfiniteFollowers(id: string) {
  return useInfiniteQuery({
    ...infiniteFollowersOptions(id),
    enabled: !!id,
  })
}

export function useFollowing(id: string) {
  return useQuery({
    ...followingOptions(id),
    enabled: !!id,
  })
}

export function useInfiniteFollowing(id: string) {
  return useInfiniteQuery({
    ...infiniteFollowingOptions(id),
    enabled: !!id,
  })
}

export function useFollowRequests() {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteFollowRequestsOptions(),
    enabled: authStore.isAuthenticated,
  })
}

export function useRelationships(ids: string[]) {
  const authStore = useAuthStore()
  return useQuery({
    ...relationshipsOptions(ids),
    enabled: ids.length > 0 && authStore.isAuthenticated,
  })
}

// Bookmarks
export function useBookmarks(params?: TimelineParams) {
  return useQuery(bookmarksOptions(params))
}

export function useInfiniteBookmarks() {
  return useInfiniteQuery(infiniteBookmarksOptions())
}

// Search
export function useSearch(params: SearchParams, options?: { enabled?: boolean }) {
  return useQuery({
    ...searchOptions(params),
    enabled: (options?.enabled ?? true) && !!params.q && params.q.trim().length > 0,
  })
}

export function useInfiniteSearch(params: SearchParams, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    ...infiniteSearchOptions(params),
    enabled: (options?.enabled ?? true) && !!params.q && params.q.trim().length > 0 && params.type !== undefined,
  })
}

// Custom Emojis
export function useCustomEmojis() {
  return useQuery(customEmojisOptions())
}

// Trends
export function useInfiniteTrendingStatuses() {
  return useInfiniteQuery(infiniteTrendingStatusesOptions())
}

export function useInfiniteTrendingTags() {
  return useInfiniteQuery(infiniteTrendingTagsOptions())
}

export function useInfiniteTrendingLinks() {
  return useInfiniteQuery(infiniteTrendingLinksOptions())
}

// Instance
export function useInstance() {
  return useQuery(instanceOptions())
}

// Notifications
export function useNotifications(params?: NotificationParams) {
  const authStore = useAuthStore()
  return useQuery({
    ...notificationsOptions(params),
    enabled: authStore.isAuthenticated,
  })
}

export function useInfiniteNotifications() {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteNotificationsOptions(),
    enabled: authStore.isAuthenticated,
  })
}

export function useNotification(id: string) {
  const authStore = useAuthStore()
  return useQuery({
    ...notificationOptions(id),
    enabled: !!id && authStore.isAuthenticated,
  })
}

export function useUnreadNotificationCount() {
  const authStore = useAuthStore()
  return useQuery({
    ...unreadNotificationCountOptions(),
    enabled: authStore.isAuthenticated,
  })
}

// Blocked Accounts
export function useBlockedAccounts() {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteBlockedAccountsOptions(),
    enabled: authStore.isAuthenticated,
  })
}

// Muted Accounts
export function useMutedAccounts() {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteMutedAccountsOptions(),
    enabled: authStore.isAuthenticated,
  })
}

// Preferences
export function usePreferences() {
  const authStore = useAuthStore()
  return useQuery({
    ...preferencesOptions(),
    enabled: authStore.isAuthenticated,
  })
}

// Lists
export function useLists() {
  const authStore = useAuthStore()
  return useQuery({
    ...listsOptions(),
    enabled: authStore.isAuthenticated,
  })
}

export function useList(id: string) {
  const authStore = useAuthStore()
  return useQuery({
    ...listOptions(id),
    enabled: !!id && authStore.isAuthenticated,
  })
}

export function useListAccounts(id: string) {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteListAccountsOptions(id),
    enabled: !!id && authStore.isAuthenticated,
  })
}

export function useInfiniteListTimeline(id: string) {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteListTimelineOptions(id),
    enabled: !!id && authStore.isAuthenticated,
  })
}

export function useAccountLists(accountId: string) {
  const authStore = useAuthStore()
  return useQuery({
    ...accountListsOptions(accountId),
    enabled: !!accountId && authStore.isAuthenticated,
  })
}

// Scheduled Statuses
export function useScheduledStatuses() {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteScheduledStatusesOptions(),
    enabled: authStore.isAuthenticated,
  })
}

export function useScheduledStatus(id: string) {
  const authStore = useAuthStore()
  return useQuery({
    ...scheduledStatusOptions(id),
    enabled: !!id && authStore.isAuthenticated,
  })
}
