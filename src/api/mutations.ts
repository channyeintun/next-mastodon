/**
 * TanStack Query mutations for Mastodon data updates
 * Includes optimistic updates for better UX
 */

import { useMutation, useQueryClient, type QueryClient, type InfiniteData } from '@tanstack/react-query'
import { getMastodonClient } from './client'
import { queryKeys } from './queryKeys'
import type { CreateStatusParams, Status, UpdateAccountParams } from '../types/mastodon'

// Helper function to update status in all infinite query caches
function updateStatusInCaches(
  queryClient: QueryClient,
  statusId: string,
  updateFn: (status: Status) => Status
) {
  // Update timelines
  queryClient.setQueriesData<InfiniteData<Status[]>>(
    { queryKey: queryKeys.timelines.all },
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((status) => (status.id === statusId ? updateFn(status) : status))
        ),
      }
    }
  )

  // Update bookmarks
  queryClient.setQueriesData<InfiniteData<Status[]>>(
    { queryKey: queryKeys.bookmarks.all() },
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((status) => (status.id === statusId ? updateFn(status) : status))
        ),
      }
    }
  )

  // Update account statuses
  queryClient.setQueriesData<InfiniteData<Status[]>>(
    { queryKey: ['accounts'] },
    (old) => {
      if (!old?.pages) return old
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((status) => (status.id === statusId ? updateFn(status) : status))
        ),
      }
    }
  )
}

// Status mutations
export function useCreateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateStatusParams) => getMastodonClient().createStatus(params),
    onSuccess: () => {
      // Invalidate home timeline to fetch new post
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.home() })
    },
  })
}

export function useDeleteStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => getMastodonClient().deleteStatus(id),
    onSuccess: (_data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.statuses.detail(id) })
      // Invalidate timelines
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: CreateStatusParams }) =>
      getMastodonClient().updateStatus(id, params),
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
    mutationFn: (id: string) => getMastodonClient().favouriteStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.statuses.detail(id) })

      const previous = queryClient.getQueryData<Status>(queryKeys.statuses.detail(id))

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
      if (context?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(context.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
    },
  })
}

export function useUnfavouriteStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => getMastodonClient().unfavouriteStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.statuses.detail(id) })

      const previous = queryClient.getQueryData<Status>(queryKeys.statuses.detail(id))

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
      if (context?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(context.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
    },
  })
}

export function useReblogStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => getMastodonClient().reblogStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.statuses.detail(id) })

      const previous = queryClient.getQueryData<Status>(queryKeys.statuses.detail(id))

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
      if (context?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(context.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
    },
  })
}

export function useUnreblogStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => getMastodonClient().unreblogStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.statuses.detail(id) })

      const previous = queryClient.getQueryData<Status>(queryKeys.statuses.detail(id))

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
      if (context?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(context.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
    },
  })
}

export function useBookmarkStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => getMastodonClient().bookmarkStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.statuses.detail(id) })

      const previous = queryClient.getQueryData<Status>(queryKeys.statuses.detail(id))

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
      if (context?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(context.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
    },
  })
}

export function useUnbookmarkStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => getMastodonClient().unbookmarkStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.statuses.detail(id) })

      const previous = queryClient.getQueryData<Status>(queryKeys.statuses.detail(id))

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
      if (context?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(context.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statuses.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
    },
  })
}

// Account mutations
export function useFollowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => getMastodonClient().followAccount(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.relationships([id]),
      })
    },
  })
}

export function useUnfollowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => getMastodonClient().unfollowAccount(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.relationships([id]),
      })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdateAccountParams) => getMastodonClient().updateCredentials(params),
    onSuccess: (data) => {
      // Update current account in cache
      queryClient.setQueryData(queryKeys.currentAccount(), data)
      // Invalidate account detail
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(data.id) })
    },
  })
}

// Poll mutations
export function useVotePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pollId, choices }: { pollId: string; choices: number[] }) =>
      getMastodonClient().votePoll(pollId, choices),
    onSuccess: (updatedPoll, { pollId }) => {
      // Update the poll in all cached statuses that contain it
      updateStatusInCaches(queryClient, pollId, (status) => {
        if (status.poll?.id === pollId) {
          return {
            ...status,
            poll: updatedPoll,
          }
        }
        return status
      })

      // Invalidate all relevant queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() })
    },
  })
}
