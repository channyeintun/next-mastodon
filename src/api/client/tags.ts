/**
 * Hashtag API
 *
 * Following a hashtag makes its posts appear in the home timeline, so these
 * endpoints are how a user curates their feed beyond the accounts they follow.
 */

import type { AxiosInstance } from 'axios'
import { api, wrapPaginatedResponse, type PaginatedResponse } from './base'
import type { Tag } from '../../types/mastodon'

/** Fetch a single hashtag, including whether the current user follows it. */
export async function getTag(name: string, signal?: AbortSignal, customClient?: AxiosInstance): Promise<Tag> {
    const client = customClient || api
    const response = await client.get<Tag>(`/api/v1/tags/${encodeURIComponent(name)}`, { signal })
    return response.data
}

export async function followTag(name: string, customClient?: AxiosInstance): Promise<Tag> {
    const client = customClient || api
    const response = await client.post<Tag>(`/api/v1/tags/${encodeURIComponent(name)}/follow`)
    return response.data
}

export async function unfollowTag(name: string, customClient?: AxiosInstance): Promise<Tag> {
    const client = customClient || api
    const response = await client.post<Tag>(`/api/v1/tags/${encodeURIComponent(name)}/unfollow`)
    return response.data
}

/** Hashtags the current user follows. Paginated via Link headers. */
export async function getFollowedTags(
    params?: { limit?: number; max_id?: string; since_id?: string },
    signal?: AbortSignal,
    customClient?: AxiosInstance
): Promise<PaginatedResponse<Tag[]>> {
    const client = customClient || api
    const response = await client.get<Tag[]>('/api/v1/followed_tags', { params, signal })
    return wrapPaginatedResponse(response.data, response.headers.link)
}
