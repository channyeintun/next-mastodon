/**
 * Mastodon API Client
 * Axios-based client with authentication interceptor
 */

import axios, { type AxiosInstance } from 'axios'
import { getRootStore } from '../stores/rootStore'
import type {
  Account,
  Application,
  Context,
  CreateAppParams,
  CreateListParams,
  CreateStatusParams,
  Emoji,
  GroupedNotificationParams,
  GroupedNotificationsResults,
  Instance,
  List,
  MediaAttachment,
  MuteAccountParams,
  Notification,
  NotificationParams,
  Poll,
  Preferences,
  Relationship,
  SearchParams,
  SearchResults,
  Status,
  StatusEdit,
  StatusSource,
  ScheduledStatus,
  ScheduledStatusParams,
  Tag,
  TimelineParams,
  Token,
  TrendingLink,
  UnreadCount,
  UpdateAccountParams,
  UpdateListParams,
} from '../types/mastodon'

// Create axios instance with default base URL
const api: AxiosInstance = axios.create({
  baseURL: 'https://mastodon.social', // Default instance
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach auth token and set base URL
api.interceptors.request.use(
  (config) => {
    // Get auth state from MobX store (in-memory, synced with cookies)
    const { authStore } = getRootStore()

    // Set instance URL if available
    if (authStore.instanceURL) {
      config.baseURL = authStore.instanceURL
    }

    // Attach access token if available
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        const requestUrl = error.config?.url || ''
        // Don't show modal for sign-in related endpoints
        const isSignInRequest = requestUrl.includes('/oauth/token') || requestUrl.includes('/api/v1/apps')

        if (!isSignInRequest) {
          // Show auth modal via MobX store
          if (typeof window !== 'undefined') {
            getRootStore().authStore.openAuthModal()
          }
        }
      }

      const errorMessage = error.response.data?.error || `HTTP ${error.response.status}`
      throw new Error(errorMessage)
    }
    throw error
  }
)

// Authentication
export async function createApp(params: CreateAppParams): Promise<Application> {
  const { data } = await api.post<Application>('/api/v1/apps', params)
  return data
}

export async function getToken(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string,
): Promise<Token> {
  const formData = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  })

  const { data } = await api.post<Token>('/oauth/token', formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return data
}

// Timelines
export async function getHomeTimeline(params?: TimelineParams, signal?: AbortSignal): Promise<Status[]> {
  const { data } = await api.get<Status[]>('/api/v1/timelines/home', { params, signal })
  return data
}

export async function getPublicTimeline(params?: TimelineParams, signal?: AbortSignal): Promise<Status[]> {
  const { data } = await api.get<Status[]>('/api/v1/timelines/public', { params, signal })
  return data
}

export async function getHashtagTimeline(hashtag: string, params?: TimelineParams, signal?: AbortSignal): Promise<Status[]> {
  const { data } = await api.get<Status[]>(`/api/v1/timelines/tag/${encodeURIComponent(hashtag)}`, { params, signal })
  return data
}

// Statuses
export async function getStatus(id: string, signal?: AbortSignal): Promise<Status> {
  const { data } = await api.get<Status>(`/api/v1/statuses/${id}`, { signal })
  return data
}

export async function createStatus(params: CreateStatusParams): Promise<Status> {
  const { data } = await api.post<Status>('/api/v1/statuses', params)
  return data
}

export async function deleteStatus(id: string): Promise<Status> {
  const { data } = await api.delete<Status>(`/api/v1/statuses/${id}`)
  return data
}

export async function updateStatus(id: string, params: CreateStatusParams): Promise<Status> {
  const { data } = await api.put<Status>(`/api/v1/statuses/${id}`, params)
  return data
}

export async function getStatusContext(id: string, signal?: AbortSignal): Promise<Context> {
  const { data } = await api.get<Context>(`/api/v1/statuses/${id}/context`, { signal })
  return data
}

export async function favouriteStatus(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/favourite`)
  return data
}

export async function unfavouriteStatus(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/unfavourite`)
  return data
}

export async function reblogStatus(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/reblog`)
  return data
}

export async function unreblogStatus(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/unreblog`)
  return data
}

export async function bookmarkStatus(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/bookmark`)
  return data
}

export async function unbookmarkStatus(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/unbookmark`)
  return data
}

// Accounts
export async function getAccount(id: string, signal?: AbortSignal): Promise<Account> {
  const { data } = await api.get<Account>(`/api/v1/accounts/${id}`, { signal })
  return data
}

export async function lookupAccount(acct: string, signal?: AbortSignal): Promise<Account> {
  const { data } = await api.get<Account>(`/api/v1/accounts/lookup`, {
    params: { acct },
    signal,
  })
  return data
}

export async function verifyCredentials(signal?: AbortSignal): Promise<Account> {
  const { data } = await api.get<Account>('/api/v1/accounts/verify_credentials', { signal })
  return data
}

export async function updateCredentials(params: UpdateAccountParams): Promise<Account> {
  const formData = new FormData()

  // Add text fields
  if (params.display_name !== undefined) {
    formData.append('display_name', params.display_name)
  }
  if (params.note !== undefined) {
    formData.append('note', params.note)
  }
  if (params.locked !== undefined) {
    formData.append('locked', String(params.locked))
  }
  if (params.bot !== undefined) {
    formData.append('bot', String(params.bot))
  }
  if (params.discoverable !== undefined) {
    formData.append('discoverable', String(params.discoverable))
  }
  if (params.hide_collections !== undefined) {
    formData.append('hide_collections', String(params.hide_collections))
  }
  if (params.indexable !== undefined) {
    formData.append('indexable', String(params.indexable))
  }

  // Add file fields
  if (params.avatar) {
    formData.append('avatar', params.avatar)
  }
  if (params.header) {
    formData.append('header', params.header)
  }

  // Add fields_attributes
  if (params.fields_attributes) {
    params.fields_attributes.forEach((field, index) => {
      formData.append(`fields_attributes[${index}][name]`, field.name)
      formData.append(`fields_attributes[${index}][value]`, field.value)
    })
  }

  // Add source fields for posting defaults
  if (params.source) {
    if (params.source.privacy !== undefined) {
      formData.append('source[privacy]', params.source.privacy)
    }
    if (params.source.sensitive !== undefined) {
      formData.append('source[sensitive]', String(params.source.sensitive))
    }
    if (params.source.language !== undefined) {
      formData.append('source[language]', params.source.language)
    }
    if (params.source.quote_policy !== undefined) {
      formData.append('source[quote_policy]', params.source.quote_policy)
    }
  }

  const { data } = await api.patch<Account>('/api/v1/accounts/update_credentials', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function getAccountStatuses(
  id: string,
  params?: TimelineParams,
  signal?: AbortSignal,
): Promise<Status[]> {
  const { data } = await api.get<Status[]>(`/api/v1/accounts/${id}/statuses`, { params, signal })
  return data
}

export async function getPinnedStatuses(id: string, signal?: AbortSignal): Promise<Status[]> {
  const { data } = await api.get<Status[]>(`/api/v1/accounts/${id}/statuses`, {
    params: { pinned: true },
    signal,
  })
  return data
}

export async function getFollowers(id: string, params?: { max_id?: string; limit?: number }, signal?: AbortSignal): Promise<Account[]> {
  const { data } = await api.get<Account[]>(`/api/v1/accounts/${id}/followers`, { params, signal })
  return data
}

export async function getFollowing(id: string, params?: { max_id?: string; limit?: number }, signal?: AbortSignal): Promise<Account[]> {
  const { data } = await api.get<Account[]>(`/api/v1/accounts/${id}/following`, { params, signal })
  return data
}

export async function followAccount(id: string): Promise<Relationship> {
  const { data } = await api.post<Relationship>(`/api/v1/accounts/${id}/follow`)
  return data
}

export async function unfollowAccount(id: string): Promise<Relationship> {
  const { data } = await api.post<Relationship>(`/api/v1/accounts/${id}/unfollow`)
  return data
}

export async function getRelationships(ids: string[], signal?: AbortSignal): Promise<Relationship[]> {
  const { data } = await api.get<Relationship[]>('/api/v1/accounts/relationships', {
    params: { 'id[]': ids },
    paramsSerializer: {
      indexes: null, // Use PHP/Rails style array params (id[]=1&id[]=2)
    },
    signal,
  })
  return data
}

// Follow Requests
export async function getFollowRequests(params?: { max_id?: string; limit?: number }, signal?: AbortSignal): Promise<Account[]> {
  const { data } = await api.get<Account[]>('/api/v1/follow_requests', { params, signal })
  return data
}

export async function acceptFollowRequest(id: string): Promise<Relationship> {
  const { data } = await api.post<Relationship>(`/api/v1/follow_requests/${id}/authorize`)
  return data
}

export async function rejectFollowRequest(id: string): Promise<void> {
  await api.post(`/api/v1/follow_requests/${id}/reject`)
}

// Block/Unblock Accounts
export async function blockAccount(id: string): Promise<Relationship> {
  const { data } = await api.post<Relationship>(`/api/v1/accounts/${id}/block`)
  return data
}

export async function unblockAccount(id: string): Promise<Relationship> {
  const { data } = await api.post<Relationship>(`/api/v1/accounts/${id}/unblock`)
  return data
}

export async function getBlockedAccounts(params?: { max_id?: string; limit?: number }, signal?: AbortSignal): Promise<Account[]> {
  const { data } = await api.get<Account[]>('/api/v1/blocks', { params, signal })
  return data
}

// Mute/Unmute Accounts
export async function muteAccount(id: string, params?: MuteAccountParams): Promise<Relationship> {
  const { data } = await api.post<Relationship>(`/api/v1/accounts/${id}/mute`, params)
  return data
}

export async function unmuteAccount(id: string): Promise<Relationship> {
  const { data } = await api.post<Relationship>(`/api/v1/accounts/${id}/unmute`)
  return data
}

export async function getMutedAccounts(params?: { max_id?: string; limit?: number }, signal?: AbortSignal): Promise<Account[]> {
  const { data } = await api.get<Account[]>('/api/v1/mutes', { params, signal })
  return data
}

// Bookmarks
export async function getBookmarks(params?: TimelineParams, signal?: AbortSignal): Promise<Status[]> {
  const { data } = await api.get<Status[]>('/api/v1/bookmarks', { params, signal })
  return data
}

// Search
export async function search(params: SearchParams, signal?: AbortSignal): Promise<SearchResults> {
  // Filter out undefined values to avoid "type=undefined" in query string
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  )
  const { data } = await api.get<SearchResults>('/api/v2/search', {
    params: filteredParams,
    signal,
  })
  return data
}

// Custom Emojis
export async function getCustomEmojis(signal?: AbortSignal): Promise<Emoji[]> {
  const { data } = await api.get<Emoji[]>('/api/v1/custom_emojis', { signal })
  return data
}

// Media
export async function uploadMedia(file: File, description?: string): Promise<MediaAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  if (description) {
    formData.append('description', description)
  }

  const { data } = await api.post<MediaAttachment>('/api/v2/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function updateMedia(id: string, description: string): Promise<MediaAttachment> {
  const formData = new FormData()
  formData.append('description', description)

  const { data } = await api.put<MediaAttachment>(`/api/v1/media/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

// Polls
export async function getPoll(id: string, signal?: AbortSignal): Promise<Poll> {
  const { data } = await api.get<Poll>(`/api/v1/polls/${id}`, { signal })
  return data
}

export async function votePoll(id: string, choices: number[]): Promise<Poll> {
  const { data } = await api.post<Poll>(`/api/v1/polls/${id}/votes`, { choices })
  return data
}

// Trends
export async function getTrendingStatuses(params?: { limit?: number; offset?: number }): Promise<Status[]> {
  const { data } = await api.get<Status[]>('/api/v1/trends/statuses', { params })
  return data
}

export async function getTrendingTags(params?: { limit?: number; offset?: number }): Promise<Tag[]> {
  const { data } = await api.get<Tag[]>('/api/v1/trends/tags', { params })
  return data
}

export async function getTrendingLinks(params?: { limit?: number; offset?: number }): Promise<TrendingLink[]> {
  const { data } = await api.get<TrendingLink[]>('/api/v1/trends/links', { params })
  return data
}

// Notifications (v1)
export async function getNotifications(params?: NotificationParams, signal?: AbortSignal): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/api/v1/notifications', { params, signal })
  return data
}

export async function getNotification(id: string, signal?: AbortSignal): Promise<Notification> {
  const { data } = await api.get<Notification>(`/api/v1/notifications/${id}`, { signal })
  return data
}

export async function dismissNotification(id: string): Promise<void> {
  await api.post(`/api/v1/notifications/${id}/dismiss`)
}

export async function clearNotifications(): Promise<void> {
  await api.post('/api/v1/notifications/clear')
}

export async function getUnreadNotificationCount(signal?: AbortSignal): Promise<UnreadCount> {
  const { data } = await api.get<UnreadCount>('/api/v1/notifications/unread_count', { signal })
  return data
}

// Grouped Notifications (v2)
export async function getGroupedNotifications(
  params?: GroupedNotificationParams,
  signal?: AbortSignal
): Promise<GroupedNotificationsResults> {
  const { data } = await api.get<GroupedNotificationsResults>('/api/v2/notifications', { params, signal })
  return data
}

export async function dismissNotificationGroup(groupKey: string): Promise<void> {
  await api.post(`/api/v2/notifications/${encodeURIComponent(groupKey)}/dismiss`)
}

// Markers (for tracking read position)
export interface Marker {
  last_read_id: string
  version: number
  updated_at: string
}

export interface MarkersResponse {
  notifications?: Marker
  home?: Marker
}

export async function getMarkers(timeline: ('home' | 'notifications')[], signal?: AbortSignal): Promise<MarkersResponse> {
  const { data } = await api.get<MarkersResponse>('/api/v1/markers', {
    params: { 'timeline[]': timeline },
    signal,
  })
  return data
}

export async function updateMarkers(params: {
  home?: { last_read_id: string }
  notifications?: { last_read_id: string }
}): Promise<MarkersResponse> {
  const { data } = await api.post<MarkersResponse>('/api/v1/markers', params)
  return data
}

// Preferences
export async function getPreferences(signal?: AbortSignal): Promise<Preferences> {
  const { data } = await api.get<Preferences>('/api/v1/preferences', { signal })
  return data
}

// Instance
export async function getInstance(signal?: AbortSignal): Promise<Instance> {
  const { data } = await api.get<Instance>('/api/v2/instance', { signal })
  return data
}

// Lists
export async function getLists(signal?: AbortSignal): Promise<List[]> {
  const { data } = await api.get<List[]>('/api/v1/lists', { signal })
  return data
}

export async function getList(id: string, signal?: AbortSignal): Promise<List> {
  const { data } = await api.get<List>(`/api/v1/lists/${id}`, { signal })
  return data
}

export async function createList(params: CreateListParams): Promise<List> {
  const { data } = await api.post<List>('/api/v1/lists', params)
  return data
}

export async function updateList(id: string, params: UpdateListParams): Promise<List> {
  const { data } = await api.put<List>(`/api/v1/lists/${id}`, params)
  return data
}

export async function deleteList(id: string): Promise<void> {
  await api.delete(`/api/v1/lists/${id}`)
}

export async function getListAccounts(id: string, params?: { max_id?: string; since_id?: string; limit?: number }, signal?: AbortSignal): Promise<Account[]> {
  const { data } = await api.get<Account[]>(`/api/v1/lists/${id}/accounts`, { params, signal })
  return data
}

export async function addAccountsToList(listId: string, accountIds: string[]): Promise<void> {
  await api.post(`/api/v1/lists/${listId}/accounts`, { account_ids: accountIds })
}

export async function removeAccountsFromList(listId: string, accountIds: string[]): Promise<void> {
  await api.delete(`/api/v1/lists/${listId}/accounts`, { data: { account_ids: accountIds } })
}

export async function getListTimeline(id: string, params?: TimelineParams, signal?: AbortSignal): Promise<Status[]> {
  const { data } = await api.get<Status[]>(`/api/v1/timelines/list/${id}`, { params, signal })
  return data
}

export async function getAccountLists(accountId: string, signal?: AbortSignal): Promise<List[]> {
  const { data } = await api.get<List[]>(`/api/v1/accounts/${accountId}/lists`, { signal })
  return data
}

// Helper function to create a custom axios instance for a specific instance URL
// Used for trending statuses from mastodon.social
export function createCustomClient(instanceURL: string): AxiosInstance {
  return axios.create({
    baseURL: instanceURL.replace(/\/$/, ''),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Status Interactions
export async function muteConversation(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/mute`)
  return data
}

export async function unmuteConversation(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/unmute`)
  return data
}

export async function pinStatus(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/pin`)
  return data
}

export async function unpinStatus(id: string): Promise<Status> {
  const { data } = await api.post<Status>(`/api/v1/statuses/${id}/unpin`)
  return data
}

export async function getStatusHistory(id: string, signal?: AbortSignal): Promise<StatusEdit[]> {
  const { data } = await api.get<StatusEdit[]>(`/api/v1/statuses/${id}/history`, { signal })
  return data
}

export async function getStatusSource(id: string, signal?: AbortSignal): Promise<StatusSource> {
  const { data } = await api.get<StatusSource>(`/api/v1/statuses/${id}/source`, { signal })
  return data
}

// Scheduled Statuses
export async function getScheduledStatuses(params?: { min_id?: string; max_id?: string; limit?: number }, signal?: AbortSignal): Promise<ScheduledStatus[]> {
  const { data } = await api.get<ScheduledStatus[]>('/api/v1/scheduled_statuses', { params, signal })
  return data
}

export async function getScheduledStatus(id: string, signal?: AbortSignal): Promise<ScheduledStatus> {
  const { data } = await api.get<ScheduledStatus>(`/api/v1/scheduled_statuses/${id}`, { signal })
  return data
}

export async function updateScheduledStatus(id: string, params: ScheduledStatusParams): Promise<ScheduledStatus> {
  const { data } = await api.put<ScheduledStatus>(`/api/v1/scheduled_statuses/${id}`, params)
  return data
}

export async function deleteScheduledStatus(id: string): Promise<void> {
  await api.delete(`/api/v1/scheduled_statuses/${id}`)
}
