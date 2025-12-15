/**
 * TanStack Query mutations for Mastodon data updates
 * Includes optimistic updates for better UX
 */

import { useMutation, useQueryClient, type QueryClient, type InfiniteData } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createStatus,
  deleteStatus,
  updateStatus,
  favouriteStatus,
  unfavouriteStatus,
  reblogStatus,
  unreblogStatus,
  bookmarkStatus,
  unbookmarkStatus,
  followAccount,
  unfollowAccount,
  blockAccount,
  unblockAccount,
  muteAccount,
  unmuteAccount,
  updateCredentials,
  votePoll,
  dismissNotification,
  dismissNotificationGroup,
  clearNotifications,
  updateMarkers,
  acceptFollowRequest,
  rejectFollowRequest,
  createList,
  updateList,
  deleteList,
  addAccountsToList,
  removeAccountsFromList,
  muteConversation,
  unmuteConversation,
  pinStatus,
  unpinStatus,
  updateScheduledStatus,
  deleteScheduledStatus,
  deleteConversation,
  markConversationAsRead,
  acceptNotificationRequest,
  dismissNotificationRequest,
  acceptNotificationRequests,
  dismissNotificationRequests,
  updateNotificationPolicy,
  updateNotificationPolicyV1,
  translateStatus,
  createPushSubscription,
  updatePushSubscription,
  deletePushSubscription,
  createFilter,
  updateFilter,
  deleteFilter,
  createReport,
  type PaginatedResponse,
} from './client'
import { queryKeys } from './queryKeys'
import { findStatusInPages, findStatusInArray, updateStatusById, findFirstNonNil } from '@/utils/fp'
import type { CreateStatusParams, Status, UpdateAccountParams, Poll, MuteAccountParams, CreateListParams, UpdateListParams, ScheduledStatusParams, Context, Conversation, NotificationRequest, UpdateNotificationPolicyParams, UpdateNotificationPolicyV1Params, CreatePushSubscriptionParams, UpdatePushSubscriptionParams, CreateFilterParams, UpdateFilterParams, CreateReportParams } from '../types/mastodon'


// Helper function to invalidate all relationship queries that contain a given account ID
// This is needed because relationships can be batch-fetched with multiple IDs
function invalidateRelationshipsForAccount(queryClient: QueryClient, accountId: string) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey as readonly unknown[]
      if (key[0] === 'accounts' && key[1] === 'relationships' && Array.isArray(key[2])) {
        return (key[2] as string[]).includes(accountId)
      }
      return false
    },
  })
}

// Helper to update a status or its nested reblog
// This function is now a thin wrapper around updateStatusById for backwards compatibility
function updateStatusOrReblog(
  status: Status,
  statusId: string,
  updateFn: (status: Status) => Status
): Status {
  return updateStatusById(statusId, updateFn)(status)
}

// Helper to find a status in any cache (for rollback purposes)
function findStatusInCaches(
  queryClient: QueryClient,
  statusId: string
): Status | undefined {
  // 1. Try detail cache first
  const detail = queryClient.getQueryData<Status>(queryKeys.statuses.detail(statusId))
  if (detail) return detail

  // 2. Try trending statuses
  const trendingData = queryClient.getQueryData<InfiniteData<Status[]>>(queryKeys.trends.statuses())
  const foundInTrending = findStatusInPages(statusId)(trendingData?.pages)
  if (foundInTrending) return foundInTrending

  // 3. Try timelines (now PaginatedResponse structure)
  const timelines = queryClient.getQueriesData<InfiniteData<PaginatedResponse<Status[]>>>({
    predicate: (query) => {
      const key = query.queryKey as readonly unknown[]
      return key[0] === 'timelines'
    }
  })

  const foundInTimelines = findFirstNonNil(
    timelines.map(([_, data]) => findStatusInPages(statusId)(data?.pages?.map(p => p.data)))
  )
  if (foundInTimelines) return foundInTimelines

  // 4. Try bookmarks (now PaginatedResponse structure)
  const bookmarks = queryClient.getQueryData<InfiniteData<PaginatedResponse<Status[]>>>(queryKeys.bookmarks.all())
  const foundInBookmarks = findStatusInPages(statusId)(bookmarks?.pages?.map(p => p.data))
  if (foundInBookmarks) return foundInBookmarks

  // 5. Try account statuses (now PaginatedResponse structure)
  const accounts = queryClient.getQueriesData<InfiniteData<PaginatedResponse<Status[]>>>({ queryKey: ['accounts'] })
  for (const [key, data] of accounts) {
    // Check if it's a pinned statuses query (flat array)
    if (Array.isArray(key) && key[2] === 'pinned_statuses') {
      const pinnedStatuses = data as unknown as Status[]
      if (Array.isArray(pinnedStatuses)) {
        const found = findStatusInArray(statusId)(pinnedStatuses)
        if (found) return found
      }
      continue
    }

    // Regular account timeline (InfiniteData with PaginatedResponse)
    const foundInAccount = findStatusInPages(statusId)(data?.pages?.map(p => p.data))
    if (foundInAccount) return foundInAccount
  }

  return undefined
}

// Helper to update InfiniteData cache with status pages (PaginatedResponse structure)
function updateInfiniteStatusCache(
  queryClient: QueryClient,
  queryOptions: Parameters<QueryClient['setQueriesData']>[0],
  updateFn: (statuses: Status[]) => Status[]
) {
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<Status[]>>>(
    queryOptions,
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          data: updateFn(page.data),
        })),
      }
    }
  )
}

// Helper function to update status in all infinite query caches
function updateStatusInCaches(
  queryClient: QueryClient,
  statusId: string,
  updateFn: (status: Status) => Status
) {
  // Create a simple function to update statuses in an array
  const updateStatuses = (statuses: Status[]) =>
    statuses.map((status) => updateStatusOrReblog(status, statusId, updateFn))

  // Update all timeline types (home, public, list, hashtag, etc.)
  updateInfiniteStatusCache(
    queryClient,
    {
      predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[0] === 'timelines'
      }
    },
    updateStatuses
  )

  // Update bookmarks
  updateInfiniteStatusCache(
    queryClient,
    { queryKey: queryKeys.bookmarks.all() },
    updateStatuses
  )

  // Update account statuses
  updateInfiniteStatusCache(
    queryClient,
    { queryKey: ['accounts'] },
    updateStatuses
  )

  // Update trending statuses (still plain arrays)
  queryClient.setQueriesData<InfiniteData<Status[]>>(
    { queryKey: queryKeys.trends.statuses() },
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map(page => page.map(status => updateStatusOrReblog(status, statusId, updateFn))),
      }
    }
  )

  // Update search results - infinite search (Statuses, Accounts, Hashtags tabs)
  // Query key format: ['search', query, type, 'infinite']
  // Data structure: InfiniteData<{ accounts, statuses, hashtags }>
  queryClient.setQueriesData<InfiniteData<{ accounts: unknown[]; statuses: Status[]; hashtags: unknown[] }>>(
    { queryKey: ['search'], predicate: (query) => query.queryKey.includes('infinite') },
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          statuses: page.statuses.map((status) =>
            updateStatusOrReblog(status, statusId, updateFn)
          ),
        })),
      }
    }
  )

  // Update search results - regular search (All tab)
  // Query key format: ['search', query, type]
  // Data structure: { accounts, statuses, hashtags } (not paginated)
  queryClient.setQueriesData<{ accounts: unknown[]; statuses: Status[]; hashtags: unknown[] }>(
    { queryKey: ['search'], predicate: (query) => !query.queryKey.includes('infinite') },
    (old) => {
      if (!old?.statuses) return old
      return {
        ...old,
        statuses: old.statuses.map((status) =>
          updateStatusOrReblog(status, statusId, updateFn)
        ),
      }
    }
  )

  // Update pinned statuses (flat array)
  // Query key format: ['accounts', id, 'pinned_statuses']
  queryClient.setQueriesData<Status[]>(
    {
      predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[0] === 'accounts' && key[2] === 'pinned_statuses'
      },
    },
    (old) => {
      if (!Array.isArray(old)) return old
      return old.map((status) => updateStatusOrReblog(status, statusId, updateFn))
    }
  )

  // Update status context caches (ancestors/descendants in thread views)
  // Query key format: ['statuses', id, 'context']
  queryClient.setQueriesData<Context>(
    {
      predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[0] === 'statuses' && key[2] === 'context'
      }
    },
    (old) => {
      if (!old || !('ancestors' in old)) return old
      return {
        ancestors: old.ancestors.map((status) =>
          updateStatusOrReblog(status, statusId, updateFn)
        ),
        descendants: old.descendants.map((status) =>
          updateStatusOrReblog(status, statusId, updateFn)
        ),
      }
    }
  )
}

// Helper function to filter statuses (remove matching statuses)
function filterStatuses(statuses: Status[], statusId: string): Status[] {
  return statuses.filter(status =>
    status.id !== statusId && status.reblog?.id !== statusId
  )
}

// Helper function to remove status from all caches (for delete operations)
function removeStatusFromCaches(
  queryClient: QueryClient,
  statusId: string
) {
  // Remove from all timeline types (home, public, list, hashtag, etc.)
  updateInfiniteStatusCache(
    queryClient,
    {
      predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[0] === 'timelines'
      }
    },
    (statuses) => filterStatuses(statuses, statusId)
  )

  // Remove from bookmarks
  updateInfiniteStatusCache(
    queryClient,
    { queryKey: queryKeys.bookmarks.all() },
    (statuses) => filterStatuses(statuses, statusId)
  )

  // Remove from account statuses
  updateInfiniteStatusCache(
    queryClient,
    { queryKey: ['accounts'] },
    (statuses) => filterStatuses(statuses, statusId)
  )

  // Remove from trending statuses (still plain arrays)
  queryClient.setQueriesData<InfiniteData<Status[]>>(
    { queryKey: queryKeys.trends.statuses() },
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map(page => filterStatuses(page, statusId)),
      }
    }
  )

  // Remove from search results - infinite search (Statuses, Accounts, Hashtags tabs)
  queryClient.setQueriesData<InfiniteData<{ accounts: unknown[]; statuses: Status[]; hashtags: unknown[] }>>(
    { queryKey: ['search'], predicate: (query) => query.queryKey.includes('infinite') },
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          statuses: page.statuses.filter((status) =>
            status.id !== statusId && status.reblog?.id !== statusId
          ),
        })),
      }
    }
  )

  // Remove from search results - regular search (All tab)
  queryClient.setQueriesData<{ accounts: unknown[]; statuses: Status[]; hashtags: unknown[] }>(
    { queryKey: ['search'], predicate: (query) => !query.queryKey.includes('infinite') },
    (old) => {
      if (!old?.statuses) return old
      return {
        ...old,
        statuses: old.statuses.filter((status) =>
          status.id !== statusId && status.reblog?.id !== statusId
        ),
      }
    }
  )

  // Remove from pinned statuses (flat array)
  queryClient.setQueriesData<Status[]>(
    {
      predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[0] === 'accounts' && key[2] === 'pinned_statuses'
      },
    },
    (old) => {
      if (!Array.isArray(old)) return old
      return old.filter((status) =>
        status.id !== statusId && status.reblog?.id !== statusId
      )
    }
  )

  // Remove from status context caches (ancestors/descendants in thread views)
  queryClient.setQueriesData<Context>(
    {
      predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[0] === 'statuses' && key[2] === 'context'
      }
    },
    (old) => {
      if (!old || !('ancestors' in old)) return old
      return {
        ancestors: old.ancestors.filter((status) =>
          status.id !== statusId && status.reblog?.id !== statusId
        ),
        descendants: old.descendants.filter((status) =>
          status.id !== statusId && status.reblog?.id !== statusId
        ),
      }
    }
  )
}

// Helper function to update poll in all statuses that contain it
function updatePollInCaches(
  queryClient: QueryClient,
  pollId: string,
  updatedPoll: Poll
) {
  const updatePollInStatus = (status: Status) =>
    status.poll?.id === pollId
      ? { ...status, poll: updatedPoll }
      : status

  const updateStatuses = (statuses: Status[]) => statuses.map(updatePollInStatus)

  // Update all timeline types (home, public, list, hashtag, etc.)
  updateInfiniteStatusCache(
    queryClient,
    {
      predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[0] === 'timelines'
      }
    },
    updateStatuses
  )

  // Update bookmarks
  updateInfiniteStatusCache(
    queryClient,
    { queryKey: queryKeys.bookmarks.all() },
    updateStatuses
  )

  // Update account statuses
  updateInfiniteStatusCache(
    queryClient,
    { queryKey: ['accounts'] },
    updateStatuses
  )

  // Update trending statuses (still plain arrays)
  queryClient.setQueriesData<InfiniteData<Status[]>>(
    { queryKey: queryKeys.trends.statuses() },
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map(page => page.map(updatePollInStatus)),
      }
    }
  )

  // Update search results - infinite search (Statuses, Accounts, Hashtags tabs)
  queryClient.setQueriesData<InfiniteData<{ accounts: unknown[]; statuses: Status[]; hashtags: unknown[] }>>(
    { queryKey: ['search'], predicate: (query) => query.queryKey.includes('infinite') },
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          statuses: page.statuses.map((status) =>
            status.poll?.id === pollId
              ? { ...status, poll: updatedPoll }
              : status
          ),
        })),
      }
    }
  )

  // Update search results - regular search (All tab)
  queryClient.setQueriesData<{ accounts: unknown[]; statuses: Status[]; hashtags: unknown[] }>(
    { queryKey: ['search'], predicate: (query) => !query.queryKey.includes('infinite') },
    (old) => {
      if (!old?.statuses) return old
      return {
        ...old,
        statuses: old.statuses.map((status) =>
          status.poll?.id === pollId
            ? { ...status, poll: updatedPoll }
            : status
        ),
      }
    }
  )

  // Update pinned statuses (flat array)
  queryClient.setQueriesData<Status[]>(
    {
      predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[0] === 'accounts' && key[2] === 'pinned_statuses'
      },
    },
    (old) => {
      if (!Array.isArray(old)) return old
      return old.map((status) =>
        status.poll?.id === pollId ? { ...status, poll: updatedPoll } : status
      )
    }
  )

  // Update status context caches (ancestors/descendants in thread views)
  queryClient.setQueriesData<Context>(
    {
      predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[0] === 'statuses' && key[2] === 'context'
      }
    },
    (old) => {
      if (!old || !('ancestors' in old)) return old
      return {
        ancestors: old.ancestors.map((status) =>
          status.poll?.id === pollId ? { ...status, poll: updatedPoll } : status
        ),
        descendants: old.descendants.map((status) =>
          status.poll?.id === pollId ? { ...status, poll: updatedPoll } : status
        ),
      }
    }
  )
}

// Helper function to rollback status in all caches (used on error)
function rollbackStatusInCaches(
  queryClient: QueryClient,
  statusId: string,
  previousStatus: Status | undefined
) {
  if (!previousStatus) return

  // Rollback status detail
  queryClient.setQueryData<Status>(queryKeys.statuses.detail(statusId), previousStatus)

  // Rollback in timeline caches
  updateStatusInCaches(queryClient, statusId, () => previousStatus)
}

// Helper function to cancel all relevant queries before optimistic update
async function cancelStatusQueries(queryClient: QueryClient, statusId: string) {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: queryKeys.statuses.detail(statusId) }),
    queryClient.cancelQueries({ queryKey: queryKeys.timelines.all }),
    queryClient.cancelQueries({ queryKey: queryKeys.bookmarks.all() }),
    queryClient.cancelQueries({ queryKey: ['accounts'] }),
    queryClient.cancelQueries({ queryKey: queryKeys.trends.statuses() }),
    queryClient.cancelQueries({ queryKey: ['search'] }),
    queryClient.cancelQueries({
      queryKey: ['statuses'], predicate: (query) => {
        const key = query.queryKey as readonly unknown[]
        return key[2] === 'context'
      }
    }),
  ])
}

// Status mutations
export function useCreateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateStatusParams) => createStatus(params),
    onSuccess: (data, params) => {
      // Invalidate home timeline to fetch new post
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.home() })

      // Invalidate current user's account timeline (profile page)
      if (data.account?.id) {
        queryClient.invalidateQueries({
          queryKey: ['accounts', data.account.id, 'statuses']
        })
      }

      // If this is a reply, optimistically update the context cache to show the new reply
      // This prevents layout shift by immediately adding the message instead of refetching
      if (params.in_reply_to_id) {
        queryClient.setQueryData<Context>(
          queryKeys.statuses.context(params.in_reply_to_id),
          (old) => {
            if (!old) return old
            // Check if the message already exists (avoid duplicates)
            const exists = old.descendants.some(s => s.id === data.id)
            if (exists) return old
            return {
              ...old,
              descendants: [...old.descendants, data],
            }
          }
        )
        // Also invalidate to ensure consistency with server
        queryClient.invalidateQueries({ queryKey: queryKeys.statuses.context(params.in_reply_to_id) })
      }

      // Also update conversations list for direct messages
      if (params.visibility === 'direct') {
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() })
      } else {
        // Show success toast for non-direct messages with link to view post
        toast.success('Post published.', {
          action: {
            label: 'OPEN',
            onClick: () => {
              window.location.href = `/status/${data.id}`
            },
          },
        })
      }
    },
  })
}

export function useDeleteStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteStatus(id),
    onSuccess: (_data, id) => {
      // Remove from status detail cache
      queryClient.removeQueries({ queryKey: queryKeys.statuses.detail(id) })

      // Remove the deleted status from all caches
      removeStatusFromCaches(queryClient, id)

      // Invalidate ALL context queries (not just the deleted status's context)
      // This ensures that if the deleted status is an ancestor or descendant in any thread,
      // those threads will refetch and show the updated context without the deleted status
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as readonly unknown[]
          return key[0] === 'statuses' && key[2] === 'context'
        }
      })

      // Show success toast
      toast.success('Post deleted.')
    },
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: CreateStatusParams }) =>
      updateStatus(id, params),
    onSuccess: (data, { id }) => {
      // Update the status in cache
      queryClient.setQueryData<Status>(queryKeys.statuses.detail(id), data)
      // Invalidate all caches to refetch updated status
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useFavouriteStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => favouriteStatus(id),
    onMutate: async (id) => {
      // Cancel all queries that will be updated optimistically
      await cancelStatusQueries(queryClient, id)

      const previous = findStatusInCaches(queryClient, id)

      if (previous) {
        queryClient.setQueryData<Status>(queryKeys.statuses.detail(id), {
          ...previous,
          favourited: true,
          favourites_count: previous.favourites_count + 1,
        })
      }

      // Update all caches using helper
      updateStatusInCaches(queryClient, id, (status) => ({
        ...status,
        favourited: true,
        favourites_count: status.favourites_count + 1,
      }))

      return { previous, id }
    },
    onError: (_err, _id, context) => {
      if (context?.previous && context?.id) {
        // Rollback to previous state
        rollbackStatusInCaches(queryClient, context.id, context.previous)
      }
    },
    onSuccess: (data) => {
      // Update cache with actual server response
      queryClient.setQueryData<Status>(queryKeys.statuses.detail(data.id), data)
      updateStatusInCaches(queryClient, data.id, () => data)
    },
  })
}

export function useUnfavouriteStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unfavouriteStatus(id),
    onMutate: async (id) => {
      // Cancel all queries that will be updated optimistically
      await cancelStatusQueries(queryClient, id)

      const previous = findStatusInCaches(queryClient, id)

      if (previous) {
        queryClient.setQueryData<Status>(queryKeys.statuses.detail(id), {
          ...previous,
          favourited: false,
          favourites_count: Math.max(0, previous.favourites_count - 1),
        })
      }

      updateStatusInCaches(queryClient, id, (status) => ({
        ...status,
        favourited: false,
        favourites_count: Math.max(0, status.favourites_count - 1),
      }))

      return { previous, id }
    },
    onError: (_err, _id, context) => {
      if (context?.previous && context?.id) {
        // Rollback to previous state
        rollbackStatusInCaches(queryClient, context.id, context.previous)
      }
    },
    onSuccess: (data) => {
      // Update cache with actual server response
      queryClient.setQueryData<Status>(queryKeys.statuses.detail(data.id), data)
      updateStatusInCaches(queryClient, data.id, () => data)
    },
  })
}

export function useReblogStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reblogStatus(id),
    onMutate: async (id) => {
      // Cancel all queries that will be updated optimistically
      await cancelStatusQueries(queryClient, id)

      const previous = findStatusInCaches(queryClient, id)

      if (previous) {
        queryClient.setQueryData<Status>(queryKeys.statuses.detail(id), {
          ...previous,
          reblogged: true,
          reblogs_count: previous.reblogs_count + 1,
        })
      }

      updateStatusInCaches(queryClient, id, (status) => ({
        ...status,
        reblogged: true,
        reblogs_count: status.reblogs_count + 1,
      }))

      return { previous, id }
    },
    onError: (_err, _id, context) => {
      if (context?.previous && context?.id) {
        // Rollback to previous state
        rollbackStatusInCaches(queryClient, context.id, context.previous)
      }
    },
    onSuccess: (data) => {
      // Update cache with actual server response
      queryClient.setQueryData<Status>(queryKeys.statuses.detail(data.id), data)
      updateStatusInCaches(queryClient, data.id, () => data)
    },
  })
}

export function useUnreblogStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unreblogStatus(id),
    onMutate: async (id) => {
      // Cancel all queries that will be updated optimistically
      await cancelStatusQueries(queryClient, id)

      const previous = findStatusInCaches(queryClient, id)

      if (previous) {
        queryClient.setQueryData<Status>(queryKeys.statuses.detail(id), {
          ...previous,
          reblogged: false,
          reblogs_count: Math.max(0, previous.reblogs_count - 1),
        })
      }

      updateStatusInCaches(queryClient, id, (status) => ({
        ...status,
        reblogged: false,
        reblogs_count: Math.max(0, status.reblogs_count - 1),
      }))

      return { previous, id }
    },
    onError: (_err, _id, context) => {
      if (context?.previous && context?.id) {
        // Rollback to previous state
        rollbackStatusInCaches(queryClient, context.id, context.previous)
      }
    },
    onSuccess: (data) => {
      // Update cache with actual server response
      queryClient.setQueryData<Status>(queryKeys.statuses.detail(data.id), data)
      updateStatusInCaches(queryClient, data.id, () => data)
    },
  })
}

export function useBookmarkStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookmarkStatus(id),
    onMutate: async (id) => {
      // Cancel all queries that will be updated optimistically
      await cancelStatusQueries(queryClient, id)

      const previous = findStatusInCaches(queryClient, id)

      if (previous) {
        queryClient.setQueryData<Status>(queryKeys.statuses.detail(id), {
          ...previous,
          bookmarked: true,
        })
      }

      updateStatusInCaches(queryClient, id, (status) => ({
        ...status,
        bookmarked: true,
      }))

      return { previous, id }
    },
    onError: (_err, _id, context) => {
      if (context?.previous && context?.id) {
        // Rollback to previous state
        rollbackStatusInCaches(queryClient, context.id, context.previous)
      }
    },
    onSuccess: (data) => {
      // Update cache with actual server response
      queryClient.setQueryData<Status>(queryKeys.statuses.detail(data.id), data)
      updateStatusInCaches(queryClient, data.id, () => data)
    },
  })
}

export function useUnbookmarkStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unbookmarkStatus(id),
    onMutate: async (id) => {
      // Cancel all queries that will be updated optimistically
      await cancelStatusQueries(queryClient, id)

      const previous = findStatusInCaches(queryClient, id)

      if (previous) {
        queryClient.setQueryData<Status>(queryKeys.statuses.detail(id), {
          ...previous,
          bookmarked: false,
        })
      }

      updateStatusInCaches(queryClient, id, (status) => ({
        ...status,
        bookmarked: false,
      }))

      return { previous, id }
    },
    onError: (_err, _id, context) => {
      if (context?.previous && context?.id) {
        // Rollback to previous state
        rollbackStatusInCaches(queryClient, context.id, context.previous)
      }
    },
    onSuccess: (data) => {
      // Update cache with actual server response
      queryClient.setQueryData<Status>(queryKeys.statuses.detail(data.id), data)
      updateStatusInCaches(queryClient, data.id, () => data)
    },
  })
}

// Account mutations
export function useFollowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => followAccount(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
      invalidateRelationshipsForAccount(queryClient, id)
    },
  })
}

export function useUnfollowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unfollowAccount(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
      invalidateRelationshipsForAccount(queryClient, id)
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdateAccountParams) => updateCredentials(params),
    onSuccess: (data) => {
      // Update current account in cache
      queryClient.setQueryData(queryKeys.accounts.current(), data)
      // Invalidate account detail and lookup queries
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.lookup(data.acct) })
    },
  })
}

// Poll mutations
export function useVotePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pollId, choices }: { pollId: string; choices: number[] }) =>
      votePoll(pollId, choices),
    onMutate: async ({ pollId, choices }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.timelines.all })
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks.all() })

      // Store previous state for rollback on error
      return { pollId, choices }
    },
    onSuccess: (updatedPoll, { pollId }) => {
      // Update the poll in all cached statuses that contain it
      updatePollInCaches(queryClient, pollId, updatedPoll)
    },
    onError: (_error) => {
      // Invalidate all relevant queries to refetch on error
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['timelines', 'hashtag'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.trends.statuses() })
    },
  })
}

// Notification mutations
export function useDismissNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => dismissNotification(id),
    onSuccess: (_data, id) => {
      // Remove the notification from the list cache
      queryClient.removeQueries({ queryKey: queryKeys.notifications.detail(id) })
      // Invalidate notifications list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      // Update unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    },
  })
}

export function useClearNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => clearNotifications(),
    onSuccess: () => {
      // Clear all notification queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      // Reset unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    },
  })
}

export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lastReadId: string) => updateMarkers({ notifications: { last_read_id: lastReadId } }),
    onSuccess: () => {
      // Reset unread count after marking as read
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
      // Invalidate markers cache so the UI updates
      queryClient.invalidateQueries({ queryKey: queryKeys.markers.notifications() })
    },
  })
}

// Grouped Notifications (v2)
export function useDismissNotificationGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupKey: string) => dismissNotificationGroup(groupKey),
    onSuccess: () => {
      // Invalidate grouped notifications cache
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.grouped() })
      // Also invalidate v1 notifications in case they're used
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      // Update unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    },
  })
}

// Follow Request mutations
export function useAcceptFollowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => acceptFollowRequest(id),
    onSuccess: (_data, id) => {
      // Invalidate follow requests list
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.followRequests() })
      // Invalidate relationships for the accepted user
      invalidateRelationshipsForAccount(queryClient, id)
      // Invalidate current user's followers count
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.current() })
    },
  })
}

export function useRejectFollowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => rejectFollowRequest(id),
    onSuccess: () => {
      // Invalidate follow requests list
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.followRequests() })
    },
  })
}

// Block/Unblock Account mutations
export function useBlockAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => blockAccount(id),
    onSuccess: (_data, id) => {
      // Invalidate account detail
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
      // Invalidate relationships
      invalidateRelationshipsForAccount(queryClient, id)
      // Invalidate blocks list
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.all() })
      // Invalidate timelines (blocked users' posts should disappear)
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
    },
  })
}

export function useUnblockAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unblockAccount(id),
    onSuccess: (_data, id) => {
      // Invalidate account detail
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
      // Invalidate relationships
      invalidateRelationshipsForAccount(queryClient, id)
      // Invalidate blocks list
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.all() })
    },
  })
}

// Mute/Unmute Account mutations
export function useMuteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params?: MuteAccountParams }) => muteAccount(id, params),
    onSuccess: (_data, { id }) => {
      // Invalidate account detail
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
      // Invalidate relationships
      invalidateRelationshipsForAccount(queryClient, id)
      // Invalidate mutes list
      queryClient.invalidateQueries({ queryKey: queryKeys.mutes.all() })
      // Invalidate timelines (muted users' posts should disappear)
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
      // Invalidate notifications if muting notifications
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}

export function useUnmuteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unmuteAccount(id),
    onSuccess: (_data, id) => {
      // Invalidate account detail
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
      // Invalidate relationships
      invalidateRelationshipsForAccount(queryClient, id)
      // Invalidate mutes list
      queryClient.invalidateQueries({ queryKey: queryKeys.mutes.all() })
    },
  })
}

// List mutations
export function useCreateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateListParams) => createList(params),
    onSuccess: () => {
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.all() })
    },
  })
}

export function useUpdateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateListParams }) => updateList(id, params),
    onSuccess: (_data, { id }) => {
      // Invalidate the specific list
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.detail(id) })
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.all() })
    },
  })
}

export function useDeleteList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteList(id),
    onSuccess: (_data, id) => {
      // Remove the list from cache
      queryClient.removeQueries({ queryKey: queryKeys.lists.detail(id) })
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.all() })
      // Remove list timeline
      queryClient.removeQueries({ queryKey: queryKeys.lists.timeline(id) })
    },
  })
}

export function useAddAccountsToList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ listId, accountIds }: { listId: string; accountIds: string[] }) =>
      addAccountsToList(listId, accountIds),
    onSuccess: (_data, { listId }) => {
      // Invalidate list accounts
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.accounts(listId) })
      // Invalidate list timeline
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.timeline(listId) })
    },
  })
}

export function useRemoveAccountsFromList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ listId, accountIds }: { listId: string; accountIds: string[] }) =>
      removeAccountsFromList(listId, accountIds),
    onSuccess: (_data, { listId }) => {
      // Invalidate list accounts
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.accounts(listId) })
      // Invalidate list timeline
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.timeline(listId) })
    },
  })
}

// Status Interactions
export function useMuteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => muteConversation(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(queryKeys.statuses.detail(id), data)
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
    },
  })
}

export function useUnmuteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unmuteConversation(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(queryKeys.statuses.detail(id), data)
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
    },
  })
}

export function usePinStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pinStatus(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(queryKeys.statuses.detail(id), data)
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
      // Also might affect profile (pinned statuses)?
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useUnpinStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unpinStatus(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(queryKeys.statuses.detail(id), data)
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

// Scheduled Statuses
export function useUpdateScheduledStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: ScheduledStatusParams }) =>
      updateScheduledStatus(id, params),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(queryKeys.scheduledStatuses.detail(id), data)
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledStatuses.all() })
    },
  })
}

export function useDeleteScheduledStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteScheduledStatus(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.scheduledStatuses.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledStatuses.all() })
    },
  })
}

// Conversations (Direct Messages)
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markConversationAsRead(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.conversations.list() })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedResponse<Conversation[]>>>(
        queryKeys.conversations.list()
      )

      // Optimistically update
      if (previousData?.pages) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<Conversation[]>>>(
          queryKeys.conversations.list(),
          {
            ...previousData,
            pages: previousData.pages.map(page => ({
              ...page,
              data: page.data.map(conv => conv.id === id ? { ...conv, unread: false } : conv)
            })),
          }
        )
      }

      return { previousData }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.conversations.list(), context.previousData)
      }
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.unreadCount() })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.conversations.list() })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedResponse<Conversation[]>>>(
        queryKeys.conversations.list()
      )

      // Optimistically remove conversation
      if (previousData?.pages) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<Conversation[]>>>(
          queryKeys.conversations.list(),
          {
            ...previousData,
            pages: previousData.pages.map(page => ({
              ...page,
              data: page.data.filter(conv => conv.id !== id)
            })),
          }
        )
      }

      return { previousData }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.conversations.list(), context.previousData)
      }
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.unreadCount() })
    },
  })
}

// Notification Request mutations
export function useAcceptNotificationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => acceptNotificationRequest(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notificationRequests.list() })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedResponse<NotificationRequest[]>>>(
        queryKeys.notificationRequests.list()
      )

      // Optimistically remove the request from the list
      if (previousData?.pages) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<NotificationRequest[]>>>(
          queryKeys.notificationRequests.list(),
          {
            ...previousData,
            pages: previousData.pages.map(page => ({
              ...page,
              data: page.data.filter(request => request.id !== id)
            })),
          }
        )
      }

      return { previousData }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.notificationRequests.list(), context.previousData)
      }
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationRequests.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationPolicy.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}

export function useDismissNotificationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => dismissNotificationRequest(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notificationRequests.list() })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedResponse<NotificationRequest[]>>>(
        queryKeys.notificationRequests.list()
      )

      // Optimistically remove the request from the list
      if (previousData?.pages) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<NotificationRequest[]>>>(
          queryKeys.notificationRequests.list(),
          {
            ...previousData,
            pages: previousData.pages.map(page => ({
              ...page,
              data: page.data.filter(request => request.id !== id)
            })),
          }
        )
      }

      return { previousData }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.notificationRequests.list(), context.previousData)
      }
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationRequests.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationPolicy.all() })
    },
  })
}

export function useAcceptNotificationRequests() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => acceptNotificationRequests(ids),
    onMutate: async (ids) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notificationRequests.list() })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedResponse<NotificationRequest[]>>>(
        queryKeys.notificationRequests.list()
      )

      // Optimistically remove the requests from the list
      if (previousData?.pages) {
        const idsSet = new Set(ids)
        queryClient.setQueryData<InfiniteData<PaginatedResponse<NotificationRequest[]>>>(
          queryKeys.notificationRequests.list(),
          {
            ...previousData,
            pages: previousData.pages.map(page => ({
              ...page,
              data: page.data.filter(request => !idsSet.has(request.id))
            })),
          }
        )
      }

      return { previousData }
    },
    onError: (_err, _ids, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.notificationRequests.list(), context.previousData)
      }
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationRequests.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationPolicy.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}

export function useDismissNotificationRequests() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => dismissNotificationRequests(ids),
    onMutate: async (ids) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notificationRequests.list() })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedResponse<NotificationRequest[]>>>(
        queryKeys.notificationRequests.list()
      )

      // Optimistically remove the requests from the list
      if (previousData?.pages) {
        const idsSet = new Set(ids)
        queryClient.setQueryData<InfiniteData<PaginatedResponse<NotificationRequest[]>>>(
          queryKeys.notificationRequests.list(),
          {
            ...previousData,
            pages: previousData.pages.map(page => ({
              ...page,
              data: page.data.filter(request => !idsSet.has(request.id))
            })),
          }
        )
      }

      return { previousData }
    },
    onError: (_err, _ids, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.notificationRequests.list(), context.previousData)
      }
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationRequests.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationPolicy.all() })
    },
  })
}

// V2 Notification Policy mutation (string-based)
export function useUpdateNotificationPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdateNotificationPolicyParams) => updateNotificationPolicy(params),
    onSuccess: (data) => {
      // Update the policy in cache
      queryClient.setQueryData(queryKeys.notificationPolicy.all(), data)
    },
  })
}

// V1 Notification Policy mutation (boolean-based)
export function useUpdateNotificationPolicyV1() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdateNotificationPolicyV1Params) => updateNotificationPolicyV1(params),
    onSuccess: (data) => {
      // Update the V1 policy in cache
      queryClient.setQueryData(['notificationPolicy', 'v1'], data)
    },
  })
}

// Translation mutation
export function useTranslateStatus() {
  return useMutation({
    mutationFn: (id: string) => translateStatus(id),
  })
}

// Push Subscription mutations
export function useCreatePushSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreatePushSubscriptionParams) => createPushSubscription(params),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.pushSubscription.all(), data)
    },
  })
}

export function useUpdatePushSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdatePushSubscriptionParams) => updatePushSubscription(params),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.pushSubscription.all(), data)
    },
  })
}

export function useDeletePushSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deletePushSubscription(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.pushSubscription.all() })
    },
  })
}

// Filter mutations
export function useCreateFilter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateFilterParams) => createFilter(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all() })
    },
  })
}

export function useUpdateFilter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateFilterParams }) =>
      updateFilter(id, params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all() })
      queryClient.setQueryData(queryKeys.filters.detail(data.id), data)
    },
  })
}

export function useDeleteFilter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFilter(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all() })
      queryClient.removeQueries({ queryKey: queryKeys.filters.detail(id) })
    },
  })
}

// Report mutations
export function useCreateReport() {
  return useMutation({
    mutationFn: (params: CreateReportParams) => createReport(params),
    onSuccess: () => {
      toast.success('Report submitted. Thank you for helping keep this community safe.')
    },
    onError: () => {
      toast.error('Failed to submit report. Please try again.')
    },
  })
}

