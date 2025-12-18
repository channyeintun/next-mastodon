/**
 * TanStack Query hooks for fetching Mastodon data
 * Uses queryOptions pattern for reusability and type safety
 */

import { useQuery, useInfiniteQuery, queryOptions, infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query'
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
  getGroupedNotifications,
  getPreferences,
  getLists,
  getList,
  getListAccounts,
  getListTimeline,
  getAccountLists,
  getStatusHistory,
  getStatusSource,
  getFavouritedBy,
  getRebloggedBy,
  getStatusQuotes,
  getScheduledStatuses,
  getScheduledStatus,
  getMarkers,
  getConversations,
  getNotificationRequests,
  getNotificationRequest,
  getNotificationPolicy,
  getNotificationPolicyV1,
  getInstanceLanguages,
  getTranslationLanguages,
  getPushSubscription,
  getFilters,
  getFilter,
  getAnnualReportState,
  getAnnualReport,
  getSuggestions,
} from './client'
import { queryKeys } from './queryKeys'
import type { TimelineParams, SearchParams, Status, NotificationParams, GroupedNotificationParams, Tag, TrendingLink, ConversationParams, NotificationRequestParams, NotificationType } from '../types/mastodon'
import { useAuthStore, useAccountStore } from '../hooks/useStores'
import { useEffect } from 'react'




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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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

export const infiniteFavouritedByOptions = (id: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.statuses.favouritedBy(id),
    queryFn: ({ pageParam, signal }) => {
      const params: { max_id?: string; limit: number } = { limit: 40 }
      if (pageParam) params.max_id = pageParam
      return getFavouritedBy(id, params, signal)
    },
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
    initialPageParam: undefined as string | undefined,
  })

export const infiniteRebloggedByOptions = (id: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.statuses.rebloggedBy(id),
    queryFn: ({ pageParam, signal }) => {
      const params: { max_id?: string; limit: number } = { limit: 40 }
      if (pageParam) params.max_id = pageParam
      return getRebloggedBy(id, params, signal)
    },
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
    initialPageParam: undefined as string | undefined,
  })

export const infiniteStatusQuotesOptions = (id: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.statuses.quotes(id),
    queryFn: ({ pageParam, signal }) => {
      const params: { max_id?: string; limit: number } = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getStatusQuotes(id, params, signal)
    },
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
    initialPageParam: undefined as string | undefined,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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

export const infiniteNotificationsOptions = (types?: NotificationType[]) =>
  infiniteQueryOptions({
    queryKey: queryKeys.notifications.list({ types }),
    queryFn: ({ pageParam, signal }) => {
      const params: NotificationParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      if (types && types.length > 0) params.types = types
      return getNotifications(params, signal)
    },
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
    initialPageParam: undefined as string | undefined,
    staleTime: 0, // Always refetch when mounting to get new notifications
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

// Grouped Notifications Options (v2)
export const infiniteGroupedNotificationsOptions = (params?: Omit<GroupedNotificationParams, 'max_id' | 'min_id' | 'since_id' | 'limit'>) =>
  infiniteQueryOptions({
    queryKey: queryKeys.notifications.grouped(params),
    queryFn: ({ pageParam, signal }) => {
      const queryParams: GroupedNotificationParams = {
        limit: 20,
        expand_accounts: 'full',
        // Include grouped types for favourite, reblog, follow
        grouped_types: ['favourite', 'reblog', 'follow'],
        ...params,
      }
      if (pageParam) queryParams.max_id = pageParam
      return getGroupedNotifications(queryParams, signal)
    },
    // When page_min_id === page_max_id on the last group, we've reached the end
    // This means there's only one notification in that group's page range
    getNextPageParam: (lastPage) => {
      const groups = lastPage.data.notification_groups
      if (groups.length === 0) return undefined

      const lastGroup = groups.at(-1)
      // If page_min_id equals page_max_id, we're at the last page boundary
      if (lastGroup?.page_min_id && lastGroup.page_min_id === lastGroup.page_max_id) {
        return undefined
      }

      return lastPage.nextMaxId
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 0, // Always refetch when mounting to get new notifications
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
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
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
    initialPageParam: undefined as string | undefined,
  })

export const scheduledStatusOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.scheduledStatuses.detail(id),
    queryFn: ({ signal }) => getScheduledStatus(id, signal),
  })

// Marker Options (for tracking read position)
export const notificationMarkerOptions = () =>
  queryOptions({
    queryKey: queryKeys.markers.notifications(),
    queryFn: ({ signal }) => getMarkers(['notifications'], signal),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
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
    placeholderData: keepPreviousData, // Prevent layout shift during refetch
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

export function useInfiniteFavouritedBy(id: string) {
  return useInfiniteQuery({
    ...infiniteFavouritedByOptions(id),
    enabled: !!id,
  })
}

export function useInfiniteRebloggedBy(id: string) {
  return useInfiniteQuery({
    ...infiniteRebloggedByOptions(id),
    enabled: !!id,
  })
}

export function useInfiniteStatusQuotes(id: string) {
  return useInfiniteQuery({
    ...infiniteStatusQuotesOptions(id),
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

/**
 * Optimized account fetching hook with priority:
 * 1. Cached account data → return immediately, NO fetch
 * 2. Cached ID → fetch using /accounts/:id (faster)  
 * 3. No ID → fetch using /accounts/lookup (slower)
 */
export function useAccountWithCache(acct: string) {
  const accountStore = useAccountStore()

  // Priority 1: Check for cached account data (in-memory)
  const cachedAccount = acct ? accountStore.getAccountByAcct(acct) : undefined

  // Priority 2: Check for cached ID (persisted in localStorage)
  const cachedId = acct ? accountStore.getAccountIdByAcct(acct) : undefined

  // Determine fetch strategy
  const hasCachedData = !!cachedAccount
  const hasCachedId = !!cachedId && !hasCachedData
  const needsLookup = !!acct && !hasCachedData && !cachedId

  // Query using ID (only if we have ID but no cached data)
  const idQuery = useQuery({
    ...accountOptions(cachedId || ''),
    enabled: hasCachedId,
  })

  // Query using lookup (only if no ID and no cached data)
  const lookupQuery = useQuery({
    ...lookupAccountOptions(acct),
    enabled: needsLookup,
  })

  // Cache results from API calls
  useEffect(() => {
    const fetchedData = idQuery.data || lookupQuery.data
    if (fetchedData && !hasCachedData) {
      accountStore.cacheAccount(fetchedData)
    }
  }, [idQuery.data, lookupQuery.data, accountStore, hasCachedData])

  // Return the appropriate result
  if (hasCachedData) {
    // Return cached data as a query-like object
    return {
      data: cachedAccount,
      isLoading: false,
      isError: false,
      error: null,
    }
  }

  return hasCachedId ? idQuery : lookupQuery
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

export function useInfiniteNotifications(types?: NotificationType[]) {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteNotificationsOptions(types),
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

// Grouped Notifications (v2)
export function useInfiniteGroupedNotifications(types?: NotificationType[]) {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteGroupedNotificationsOptions(types ? { types } : undefined),
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

// Markers
export function useNotificationMarker() {
  const authStore = useAuthStore()
  return useQuery({
    ...notificationMarkerOptions(),
    enabled: authStore.isAuthenticated,
  })
}

// Conversations (Direct Messages)
export const infiniteConversationsOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.conversations.list(),
    queryFn: ({ pageParam, signal }) => {
      const params: ConversationParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getConversations(params, signal)
    },
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
    initialPageParam: undefined as string | undefined,
    staleTime: 0, // Always refetch to get new messages
  })

export function useConversations() {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteConversationsOptions(),
    enabled: authStore.isAuthenticated,
  })
}

// Notification Requests Options
export const infiniteNotificationRequestsOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.notificationRequests.list(),
    queryFn: ({ pageParam, signal }) => {
      const params: NotificationRequestParams = { limit: 20 }
      if (pageParam) params.max_id = pageParam
      return getNotificationRequests(params, signal)
    },
    getNextPageParam: (lastPage) => lastPage.nextMaxId,
    initialPageParam: undefined as string | undefined,
    staleTime: 0, // Always refetch to get latest requests
  })

export const notificationRequestOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.notificationRequests.detail(id),
    queryFn: ({ signal }) => getNotificationRequest(id, signal),
  })

// Notification Policy Options (V2 - string-based)
export const notificationPolicyOptions = () =>
  queryOptions({
    queryKey: queryKeys.notificationPolicy.all(),
    queryFn: ({ signal }) => getNotificationPolicy(signal),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

// Notification Policy V1 Options (boolean-based)
export const notificationPolicyV1Options = () =>
  queryOptions({
    queryKey: ['notificationPolicy', 'v1'] as const,
    queryFn: ({ signal }) => getNotificationPolicyV1(signal),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

// Notification Requests Hooks
export function useNotificationRequests() {
  const authStore = useAuthStore()
  return useInfiniteQuery({
    ...infiniteNotificationRequestsOptions(),
    enabled: authStore.isAuthenticated,
  })
}

export function useNotificationRequest(id: string) {
  const authStore = useAuthStore()
  return useQuery({
    ...notificationRequestOptions(id),
    enabled: !!id && authStore.isAuthenticated,
  })
}

// V2 Notification Policy Hook
export function useNotificationPolicy() {
  const authStore = useAuthStore()
  return useQuery({
    ...notificationPolicyOptions(),
    enabled: authStore.isAuthenticated,
  })
}

// V1 Notification Policy Hook
export function useNotificationPolicyV1() {
  const authStore = useAuthStore()
  return useQuery({
    ...notificationPolicyV1Options(),
    enabled: authStore.isAuthenticated,
  })
}

// Instance Languages Options
export const instanceLanguagesOptions = () =>
  queryOptions({
    queryKey: ['instance', 'languages'] as const,
    queryFn: ({ signal }) => getInstanceLanguages(signal),
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  })

// Instance Languages Hook
export function useInstanceLanguages() {
  return useQuery(instanceLanguagesOptions())
}

// Translation Languages Options
export const translationLanguagesOptions = () =>
  queryOptions({
    queryKey: ['instance', 'translation_languages'] as const,
    queryFn: ({ signal }) => getTranslationLanguages(signal),
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  })

// Translation Languages Hook
export function useTranslationLanguages() {
  return useQuery(translationLanguagesOptions())
}

// Push Subscription Options
export const pushSubscriptionOptions = () =>
  queryOptions({
    queryKey: queryKeys.pushSubscription.all(),
    queryFn: ({ signal }) => getPushSubscription(signal),
  })

// Push Subscription Hook
export function usePushSubscription() {
  const authStore = useAuthStore()
  return useQuery({
    ...pushSubscriptionOptions(),
    enabled: authStore.isAuthenticated,
    retry: false, // Don't retry on 404 (no subscription)
    throwOnError: false,
  })
}

// Filter Options (v2)
export const filtersOptions = () =>
  queryOptions({
    queryKey: queryKeys.filters.all(),
    queryFn: ({ signal }) => getFilters(signal),
  })

export const filterOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.filters.detail(id),
    queryFn: ({ signal }) => getFilter(id, signal),
  })

// Filter Hooks
export function useFilters() {
  const authStore = useAuthStore()
  return useQuery({
    ...filtersOptions(),
    enabled: authStore.isAuthenticated,
  })
}

export function useFilter(id: string) {
  const authStore = useAuthStore()
  return useQuery({
    ...filterOptions(id),
    enabled: authStore.isAuthenticated && !!id,
  })
}

// Instance Rules Options
export const instanceRulesOptions = () =>
  queryOptions({
    queryKey: queryKeys.instance.rules(),
    queryFn: ({ signal }) => import('./client').then(m => m.getInstanceRules(signal)),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  })

// Privacy Policy Options - Returns null if not configured on server
export const privacyPolicyOptions = () =>
  queryOptions({
    queryKey: queryKeys.instance.privacyPolicy(),
    queryFn: async ({ signal }) => {
      try {
        const { getPrivacyPolicy } = await import('./client')
        return await getPrivacyPolicy(signal)
      } catch (error) {
        // Return null if 404 - policy not configured on this server
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } }
          if (axiosError.response?.status === 404) return null
        }
        throw error
      }
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: false, // Don't retry on 404
  })

// Terms of Service Options - Returns null if not configured on server
export const termsOfServiceOptions = () =>
  queryOptions({
    queryKey: queryKeys.instance.termsOfService(),
    queryFn: async ({ signal }) => {
      try {
        const { getTermsOfService } = await import('./client')
        return await getTermsOfService(signal)
      } catch (error) {
        // Return null if 404 - ToS not configured on this server
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } }
          if (axiosError.response?.status === 404) return null
        }
        throw error
      }
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: false, // Don't retry on 404
  })

// Extended Description Options - Returns null if not configured on server
export const extendedDescriptionOptions = () =>
  queryOptions({
    queryKey: queryKeys.instance.extendedDescription(),
    queryFn: async ({ signal }) => {
      try {
        const { getExtendedDescription } = await import('./client')
        return await getExtendedDescription(signal)
      } catch (error) {
        // Return null if 404 - description not configured on this server
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } }
          if (axiosError.response?.status === 404) return null
        }
        throw error
      }
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: false, // Don't retry on 404
  })

// Instance Rules Hook
export function useInstanceRules() {
  return useQuery(instanceRulesOptions())
}

// Privacy Policy Hook
export function usePrivacyPolicy() {
  return useQuery(privacyPolicyOptions())
}

// Terms of Service Hook
export function useTermsOfService() {
  return useQuery(termsOfServiceOptions())
}

// Extended Description Hook
export function useExtendedDescription() {
  return useQuery(extendedDescriptionOptions())
}

// ============================================================================
// ANNUAL REPORT (WRAPSTODON) QUERIES
// ============================================================================

// Annual Report State Options
export const annualReportStateOptions = (year: number) =>
  queryOptions({
    queryKey: queryKeys.annualReports.state(year),
    queryFn: ({ signal }) => getAnnualReportState(year, signal),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

// Annual Report Data Options
export const annualReportOptions = (year: number) =>
  queryOptions({
    queryKey: queryKeys.annualReports.detail(year),
    queryFn: ({ signal }) => getAnnualReport(year, signal),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour - report doesn't change once generated
  })

// Annual Report State Hook
export function useAnnualReportState(year: number, options?: { enabled?: boolean }) {
  const authStore = useAuthStore()
  return useQuery({
    ...annualReportStateOptions(year),
    enabled: (options?.enabled ?? true) && authStore.isAuthenticated && year > 0,
  })
}

// Annual Report Data Hook
export function useAnnualReport(year: number, options?: { enabled?: boolean }) {
  const authStore = useAuthStore()
  return useQuery({
    ...annualReportOptions(year),
    enabled: (options?.enabled ?? true) && authStore.isAuthenticated && year > 0,
  })
}

// ============================================================================
// SUGGESTIONS (FOLLOW RECOMMENDATIONS)
// ============================================================================

// Suggestions Query Options
export const suggestionsOptions = (params?: { limit?: number }) =>
  queryOptions({
    queryKey: queryKeys.suggestions.list(params),
    queryFn: ({ signal }) => getSuggestions(params, signal),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

// Suggestions Hook
export function useSuggestions(params?: { limit?: number }) {
  const authStore = useAuthStore()
  return useQuery({
    ...suggestionsOptions(params),
    enabled: authStore.isAuthenticated,
  })
}
