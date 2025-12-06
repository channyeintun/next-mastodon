/**
 * Mastodon API Client
 * Axios-based client with authentication interceptor
 */

import axios, { type AxiosInstance } from 'axios'
import Cookies from 'js-cookie'
import type {
  Account,
  Application,
  Context,
  CreateAppParams,
  CreateStatusParams,
  Emoji,
  Instance,
  MediaAttachment,
  Poll,
  Relationship,
  SearchParams,
  SearchResults,
  Status,
  TimelineParams,
  Token,
  UpdateAccountParams,
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
    // Get instance URL from cookies, fallback to default (mastodon.social)
    const instanceURL = Cookies.get('instanceURL')
    if (instanceURL) {
      config.baseURL = instanceURL.replace(/\/$/, '') // Remove trailing slash
    }

    // Get access token from cookies and attach if it exists
    const accessToken = Cookies.get('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
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
          // Emit auth event to show modal
          if (typeof window !== 'undefined') {
            // Import dynamically to avoid issues during SSR
            import('../lib/authEvents').then(({ authEvents }) => {
              authEvents.emit()
            })
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
export async function getHomeTimeline(params?: TimelineParams): Promise<Status[]> {
  const { data } = await api.get<Status[]>('/api/v1/timelines/home', { params })
  return data
}

export async function getPublicTimeline(params?: TimelineParams): Promise<Status[]> {
  const { data } = await api.get<Status[]>('/api/v1/timelines/public', { params })
  return data
}

export async function getHashtagTimeline(hashtag: string, params?: TimelineParams): Promise<Status[]> {
  const { data } = await api.get<Status[]>(`/api/v1/timelines/tag/${encodeURIComponent(hashtag)}`, { params })
  return data
}

// Statuses
export async function getStatus(id: string): Promise<Status> {
  const { data } = await api.get<Status>(`/api/v1/statuses/${id}`)
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

export async function getStatusContext(id: string): Promise<Context> {
  const { data } = await api.get<Context>(`/api/v1/statuses/${id}/context`)
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
export async function getAccount(id: string): Promise<Account> {
  const { data } = await api.get<Account>(`/api/v1/accounts/${id}`)
  return data
}

export async function lookupAccount(acct: string): Promise<Account> {
  const { data } = await api.get<Account>(`/api/v1/accounts/lookup`, {
    params: { acct },
  })
  return data
}

export async function verifyCredentials(): Promise<Account> {
  const { data } = await api.get<Account>('/api/v1/accounts/verify_credentials')
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
): Promise<Status[]> {
  const { data } = await api.get<Status[]>(`/api/v1/accounts/${id}/statuses`, { params })
  return data
}

export async function getFollowers(id: string): Promise<Account[]> {
  const { data } = await api.get<Account[]>(`/api/v1/accounts/${id}/followers`)
  return data
}

export async function getFollowing(id: string): Promise<Account[]> {
  const { data } = await api.get<Account[]>(`/api/v1/accounts/${id}/following`)
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

export async function getRelationships(ids: string[]): Promise<Relationship[]> {
  const { data } = await api.get<Relationship[]>('/api/v1/accounts/relationships', {
    params: { 'id[]': ids },
    paramsSerializer: {
      indexes: null, // Use PHP/Rails style array params (id[]=1&id[]=2)
    },
  })
  return data
}

// Bookmarks
export async function getBookmarks(params?: TimelineParams): Promise<Status[]> {
  const { data } = await api.get<Status[]>('/api/v1/bookmarks', { params })
  return data
}

// Search
export async function search(params: SearchParams): Promise<SearchResults> {
  // Filter out undefined values to avoid "type=undefined" in query string
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  )
  const { data } = await api.get<SearchResults>('/api/v2/search', {
    params: filteredParams,
  })
  return data
}

// Custom Emojis
export async function getCustomEmojis(): Promise<Emoji[]> {
  const { data } = await api.get<Emoji[]>('/api/v1/custom_emojis')
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
export async function getPoll(id: string): Promise<Poll> {
  const { data } = await api.get<Poll>(`/api/v1/polls/${id}`)
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

// Instance
export async function getInstance(): Promise<Instance> {
  const { data } = await api.get<Instance>('/api/v2/instance')
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
