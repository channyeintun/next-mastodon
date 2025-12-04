/**
 * Mastodon API Client
 * Base client for making authenticated requests to Mastodon instances
 */

import type {
  Account,
  Application,
  Context,
  CreateAppParams,
  CreateStatusParams,
  Relationship,
  SearchParams,
  SearchResults,
  Status,
  TimelineParams,
  Token,
} from '../types/mastodon'

export class MastodonClient {
  private baseURL: string
  private accessToken: string | null = null

  constructor(instanceURL: string) {
    this.baseURL = instanceURL.replace(/\/$/, '') // Remove trailing slash
  }

  setAccessToken(token: string) {
    this.accessToken = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Authentication
  async createApp(params: CreateAppParams): Promise<Application> {
    return this.request<Application>('/api/v1/apps', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getToken(
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

    return this.request<Token>('/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })
  }

  // Timelines
  async getHomeTimeline(params?: TimelineParams): Promise<Status[]> {
    const query = new URLSearchParams(params as any).toString()
    return this.request<Status[]>(
      `/api/v1/timelines/home${query ? `?${query}` : ''}`,
    )
  }

  async getPublicTimeline(params?: TimelineParams): Promise<Status[]> {
    const query = new URLSearchParams(params as any).toString()
    return this.request<Status[]>(
      `/api/v1/timelines/public${query ? `?${query}` : ''}`,
    )
  }

  // Statuses
  async getStatus(id: string): Promise<Status> {
    return this.request<Status>(`/api/v1/statuses/${id}`)
  }

  async createStatus(params: CreateStatusParams): Promise<Status> {
    return this.request<Status>('/api/v1/statuses', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async deleteStatus(id: string): Promise<Status> {
    return this.request<Status>(`/api/v1/statuses/${id}`, {
      method: 'DELETE',
    })
  }

  async getStatusContext(id: string): Promise<Context> {
    return this.request<Context>(`/api/v1/statuses/${id}/context`)
  }

  async favouriteStatus(id: string): Promise<Status> {
    return this.request<Status>(`/api/v1/statuses/${id}/favourite`, {
      method: 'POST',
    })
  }

  async unfavouriteStatus(id: string): Promise<Status> {
    return this.request<Status>(`/api/v1/statuses/${id}/unfavourite`, {
      method: 'POST',
    })
  }

  async reblogStatus(id: string): Promise<Status> {
    return this.request<Status>(`/api/v1/statuses/${id}/reblog`, {
      method: 'POST',
    })
  }

  async unreblogStatus(id: string): Promise<Status> {
    return this.request<Status>(`/api/v1/statuses/${id}/unreblog`, {
      method: 'POST',
    })
  }

  async bookmarkStatus(id: string): Promise<Status> {
    return this.request<Status>(`/api/v1/statuses/${id}/bookmark`, {
      method: 'POST',
    })
  }

  async unbookmarkStatus(id: string): Promise<Status> {
    return this.request<Status>(`/api/v1/statuses/${id}/unbookmark`, {
      method: 'POST',
    })
  }

  // Accounts
  async getAccount(id: string): Promise<Account> {
    return this.request<Account>(`/api/v1/accounts/${id}`)
  }

  async verifyCredentials(): Promise<Account> {
    return this.request<Account>('/api/v1/accounts/verify_credentials')
  }

  async getAccountStatuses(
    id: string,
    params?: TimelineParams,
  ): Promise<Status[]> {
    const query = new URLSearchParams(params as any).toString()
    return this.request<Status[]>(
      `/api/v1/accounts/${id}/statuses${query ? `?${query}` : ''}`,
    )
  }

  async getFollowers(id: string): Promise<Account[]> {
    return this.request<Account[]>(`/api/v1/accounts/${id}/followers`)
  }

  async getFollowing(id: string): Promise<Account[]> {
    return this.request<Account[]>(`/api/v1/accounts/${id}/following`)
  }

  async followAccount(id: string): Promise<Relationship> {
    return this.request<Relationship>(`/api/v1/accounts/${id}/follow`, {
      method: 'POST',
    })
  }

  async unfollowAccount(id: string): Promise<Relationship> {
    return this.request<Relationship>(`/api/v1/accounts/${id}/unfollow`, {
      method: 'POST',
    })
  }

  async getRelationships(ids: string[]): Promise<Relationship[]> {
    const query = ids.map((id) => `id[]=${id}`).join('&')
    return this.request<Relationship[]>(`/api/v1/accounts/relationships?${query}`)
  }

  // Bookmarks
  async getBookmarks(params?: TimelineParams): Promise<Status[]> {
    const query = new URLSearchParams(params as any).toString()
    return this.request<Status[]>(
      `/api/v1/bookmarks${query ? `?${query}` : ''}`,
    )
  }

  // Search
  async search(params: SearchParams): Promise<SearchResults> {
    const query = new URLSearchParams(params as any).toString()
    return this.request<SearchResults>(`/api/v2/search?${query}`)
  }
}

// Singleton instance - will be configured with instance URL
let clientInstance: MastodonClient | null = null

export function getMastodonClient(): MastodonClient {
  if (!clientInstance) {
    throw new Error('Mastodon client not initialized. Call initMastodonClient first.')
  }
  return clientInstance
}

export function initMastodonClient(instanceURL: string): MastodonClient {
  clientInstance = new MastodonClient(instanceURL)
  return clientInstance
}
